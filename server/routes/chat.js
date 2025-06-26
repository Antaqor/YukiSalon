const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const authenticateToken = require('../middleware/authMiddleware');

// list chats for logged in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'participants',
        select: 'username profilePicture',
      });
    res.json(chats);
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
    await chat.populate({
      path: 'participants',
      select: 'username profilePicture',
    });
    res.json(chat);
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
    res.json(full);
  } catch (err) {
    console.error('Chat send error', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
