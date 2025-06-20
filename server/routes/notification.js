const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Get notifications for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username profilePicture')
      .populate('post', '_id')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a notification as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Read notification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
