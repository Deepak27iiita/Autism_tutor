const express = require('express');
const Word = require('../models/Word');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/words
// @desc    Get all words (with optional filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, pecsPhase, limit } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (pecsPhase) filter.pecsPhase = parseInt(pecsPhase);

    let query = Word.find(filter).sort({ word: 1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const words = await query;
    res.json(words);
  } catch (error) {
    console.error('Get words error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/words/:id
// @desc    Get word by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(word);
  } catch (error) {
    console.error('Get word error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/words
// @desc    Create a new word (Admin/Teacher only)
// @access  Private (Admin/Teacher)
router.post('/', auth, async (req, res) => {
  try {
    // In production, add authorization check
    const word = new Word(req.body);
    await word.save();
    res.status(201).json(word);
  } catch (error) {
    console.error('Create word error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/words/:id
// @desc    Update a word
// @access  Private (Admin/Teacher)
router.put('/:id', auth, async (req, res) => {
  try {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(word);
  } catch (error) {
    console.error('Update word error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/words/:id
// @desc    Delete a word
// @access  Private (Admin/Teacher)
router.delete('/:id', auth, async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.id);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Delete word error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
