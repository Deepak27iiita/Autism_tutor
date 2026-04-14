const express = require('express');
const Analytics = require('../models/Analytics');
const Session = require('../models/Session');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/:userId
// @desc    Get analytics for a user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId.toString();

    // Check if user is accessing their own analytics or is admin/teacher
    if (currentUserId !== userId && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get recent analytics
    const analytics = await Analytics.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    // Get session statistics
    const sessions = await Session.find({ userId: userId, completed: true });
    
    const totalSessions = sessions.length;
    const totalWords = sessions.reduce((sum, s) => sum + s.words.length, 0);
    const avgAccuracy = sessions.length > 0
      ? sessions.reduce((sum, s) => {
          const correct = s.results.filter(r => r.correct).length;
          const total = s.results.length;
          return sum + (total > 0 ? (correct / total) * 100 : 0);
        }, 0) / sessions.length
      : 0;

    // Calculate improvement trends
    const preTestSessions = sessions.filter(s => s.sessionType === 'pre-test');
    const postTestSessions = sessions.filter(s => s.sessionType === 'post-test');
    
    const avgImprovement = postTestSessions.length > 0
      ? postTestSessions.reduce((sum, s) => sum + (s.improvement || 0), 0) / postTestSessions.length
      : 0;

    res.json({
      analytics,
      summary: {
        totalSessions,
        totalWords,
        averageAccuracy: Math.round(avgAccuracy * 100) / 100,
        averageImprovement: Math.round(avgImprovement * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/analytics
// @desc    Create/Update analytics record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { userId, metrics, animationMetrics, wordProgress } = req.body;

    const analytics = new Analytics({
      userId: userId || req.user.userId,
      metrics,
      animationMetrics,
      wordProgress,
    });

    await analytics.save();
    res.status(201).json(analytics);
  } catch (error) {
    console.error('Create analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

