const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const authenticateToken = require('../middleware/authMiddleware');
const PushSubscription = require('../models/PushSubscription');

router.get('/public-key', (_, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

router.post('/subscribe', authenticateToken, async (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  try {
    await PushSubscription.findOneAndUpdate(
      { endpoint: sub.endpoint },
      { ...sub, user: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscribed' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
