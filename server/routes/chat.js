const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const authenticateToken = require('../middleware/authMiddleware');

// Fetch last 50 messages for a room
router.get('/:room', authenticateToken, async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username profilePicture');
    res.json(messages.reverse());
  } catch (err) {
    console.error('Chat fetch error', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
