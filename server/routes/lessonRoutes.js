const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const authenticateToken = require('../middleware/authMiddleware');

// Get all lessons
router.get('/', async (_, res) => {
  try {
    const lessons = await Lesson.find()
      .populate('author', 'username')
      .sort({ createdAt: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create lesson
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.username !== 'Antaqor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { url, title, description } = req.body;
    const lesson = await Lesson.create({
      url,
      title,
      description,
      author: req.user._id,
    });
    await lesson.populate('author', 'username');
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update lesson
router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.username !== 'Antaqor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { url, title, description } = req.body;
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { url, title, description },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    await lesson.populate('author', 'username');
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lesson
router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.username !== 'Antaqor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
