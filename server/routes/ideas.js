const express = require('express');
const jwt = require('jsonwebtoken');
const Idea = require('../models/Idea');
const User = require('../models/User');

const router = express.Router();

// simple auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create idea
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;
    const idea = new Idea({ author: req.user._id, title, description, tags: tags || [] });
    await idea.save();
    const populated = await Idea.findById(idea._id)
      .populate('author', 'name email')
      .populate({ path: 'comments.user', select: 'name' });
    res.json(populated);
    try{ req.app.get('io')?.emit('idea:created', populated) }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all ideas
router.get('/', async (req, res) => {
  try {
    const { q, tags } = req.query
    const filter = {}
    if (q) {
      // simple text search on title and description
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }
    if (tags) {
      const ts = Array.isArray(tags) ? tags : tags.split(',').map(t=>t.trim()).filter(Boolean)
      if (ts.length) filter.tags = { $in: ts }
    }

    const ideas = await Idea.find(filter)
      .populate('author', 'name email avatar')
      .populate({ path: 'comments.user', select: 'name avatar' })
      .sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update idea
router.put('/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Not found' });
    if (!idea.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    const { title, description, tags } = req.body;
    idea.title = title ?? idea.title;
    idea.description = description ?? idea.description;
    idea.tags = tags ?? idea.tags;
    await idea.save();
    const populated = await Idea.findById(idea._id)
      .populate('author', 'name email')
      .populate({ path: 'comments.user', select: 'name' });
    res.json(populated);
    try{ req.app.get('io')?.emit('idea:updated', populated) }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete idea
router.delete('/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Not found' });
    if (!idea.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    await idea.remove();
    res.json({ message: 'Deleted' });
    try{ req.app.get('io')?.emit('idea:deleted', { id: req.params.id }) }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike
router.post('/:id/like', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Not found' });
    const idx = idea.likes.findIndex(id => id.equals(req.user._id));
    if (idx >= 0) {
      idea.likes.splice(idx,1);
    } else {
      idea.likes.push(req.user._id);
    }
    await idea.save();
    const populated = await Idea.findById(idea._id)
      .populate('author', 'name email')
      .populate({ path: 'comments.user', select: 'name' });
    res.json(populated);
    try{ req.app.get('io')?.emit('idea:liked', populated) }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Not found' });
    idea.comments.push({ user: req.user._id, text: req.body.text });
    await idea.save();
    const populated = await Idea.findById(idea._id)
      .populate('author', 'name email')
      .populate({ path: 'comments.user', select: 'name' });
    res.json(populated);
    try{ req.app.get('io')?.emit('idea:commented', populated) }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
