const express = require('express');
const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const authenticateToken = require('../middleware/authMiddleware');

module.exports = function(io) {
  const router = express.Router();

  // list chats for logged in user
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const chats = await Chat.find({ participants: req.user._id })
        .sort({ updatedAt: -1 })
        .populate({ path: 'participants', select: 'username profilePicture' })
        .lean();

      const withLast = await Promise.all(
        chats.map(async c => {
          const last = await ChatMessage.findOne({ room: c._id })
            .sort({ createdAt: -1 })
            .lean();
          const unreadCount = await ChatMessage.countDocuments({
            room: c._id,
            sender: { $ne: req.user._id },
            read: false,
          });
          return {
            ...c,
            lastMessage: last ? last.text : '',
            lastMessageAt: last ? last.createdAt : c.updatedAt,
            unreadCount,
          };
        })
      );

      res.json(withLast);
    } catch (err) {
      console.error('Chat list error', err);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });

  // get or create chat with specific user
  router.post('/with/:userId', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const participants = [req.user._id.toString(), userId].sort();
      let chat = await Chat.findOne({ participants: { $all: participants, $size: 2 } });
      if (!chat) {
        chat = await Chat.create({ participants });
      }
      await chat.populate({ path: 'participants', select: 'username profilePicture' });
      const last = await ChatMessage.findOne({ room: chat._id })
        .sort({ createdAt: -1 })
        .lean();
      const unreadCount = await ChatMessage.countDocuments({
        room: chat._id,
        sender: { $ne: req.user._id },
        read: false,
      });
      res.json({
        ...chat.toObject(),
        lastMessage: last ? last.text : '',
        lastMessageAt: last ? last.createdAt : chat.updatedAt,
        unreadCount,
      });
    } catch (err) {
      console.error('Chat create error', err);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  // get messages for chat
  router.get('/:chatId/messages', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await ChatMessage.find({ room: chatId })
        .sort({ createdAt: 1 })
        .populate('sender', 'username profilePicture');
      res.json(messages);
    } catch (err) {
      console.error('Chat fetch error', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // send a message
  router.post('/:chatId/messages', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { text } = req.body;
      const msg = await ChatMessage.create({ room: chatId, text, sender: req.user._id });
      const full = await msg.populate('sender', 'username profilePicture');
      await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });
      io.to(chatId).emit('chat-message', full);
      res.json(full);
    } catch (err) {
      console.error('Chat send error', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // mark messages as read
  router.post('/:chatId/read', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      await ChatMessage.updateMany(
        { room: chatId, sender: { $ne: req.user._id }, read: false },
        { $set: { read: true } }
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Chat read error', err);
      res.status(500).json({ error: 'Failed to mark read' });
    }
  });

  return router;
};
