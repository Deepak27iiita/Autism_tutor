const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new learning session
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { sessionType, words, animationIntensity } = req.body;

    const session = new Session({
      userId: req.user.userId,
      sessionType,
      words: words || [],
      animationIntensity: animationIntensity || 'medium',
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sessions
// @desc    Get user's sessions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId })
      .populate('words')
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('words')
      .populate('results.wordId');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sessions/:id/results
// @desc    Add result to session
// @access  Private
router.put('/:id/results', auth, async (req, res) => {
  try {
    const { stage, wordId, correct, timeSpent, attempts, animationLevel } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    session.results.push({
      stage,
      wordId,
      correct,
      timeSpent,
      attempts,
      animationLevel,
    });

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Add result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sessions/:id/complete
// @desc    Complete a session
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { preTestScore, postTestScore } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    session.completed = true;
    session.completedAt = new Date();
    session.preTestScore = preTestScore || session.preTestScore;
    session.postTestScore = postTestScore || session.postTestScore;

    // Calculate duration
    session.duration = Math.floor((session.completedAt - session.startedAt) / 1000);

    await session.save();

    // Update user learning stats
    const user = await User.findById(req.user.userId);
    user.learningStats.totalSessions += 1;
    user.learningStats.lastSessionDate = new Date();
    await user.save();

    res.json(session);
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

