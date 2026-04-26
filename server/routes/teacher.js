/**
 * Teacher Routes — /api/teacher
 * Requires auth + teacher or admin role.
 */
const express = require('express');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Session = require('../models/Session');
const Analytics = require('../models/Analytics');
const { buildAdaptiveModel } = require('../utils/adaptiveLearning');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const teacherOrAdmin = [auth, authorize('teacher', 'admin')];

// GET /api/teacher/students  — get all students assigned to this teacher
router.get('/students', teacherOrAdmin, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      teacherId: req.user.userId,
      active: true,
    }).populate('studentId', '-password');

    const students = assignments.map((a) => a.studentId);
    res.json(students);
  } catch (err) {
    console.error('Teacher get students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/students/:studentId/progress  — full progress for one student
router.get('/students/:studentId/progress', teacherOrAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify teacher is actually assigned to this student (unless admin)
    if (req.user.role !== 'admin') {
      const assignment = await Assignment.findOne({
        teacherId: req.user.userId,
        studentId,
        active: true,
      });
      if (!assignment) {
        return res.status(403).json({ message: 'This student is not assigned to you' });
      }
    }

    const [student, sessions, analytics] = await Promise.all([
      User.findById(studentId).select('-password'),
      Session.find({ userId: studentId, completed: true })
        .populate('words')
        .sort({ completedAt: -1 }),
      Analytics.find({ userId: studentId }).sort({ date: -1 }).limit(30),
    ]);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const mlModel = buildAdaptiveModel(sessions);

    res.json({
      student,
      sessions,
      analytics,
      mlInsights: {
        predictedAccuracy: mlModel.predictedAccuracy,
        recommendedAnimationIntensity: mlModel.recommendedAnimationIntensity,
        recommendedSessionSize: mlModel.recommendedSessionSize,
        weakWords: mlModel.weakWords,
        decliningWords: mlModel.decliningWords,
        dueForReview: mlModel.dueForReview,
        observations: mlModel.observations,
      },
    });
  } catch (err) {
    console.error('Teacher get student progress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teacher/students/:studentId/notes  — add note to a student
router.put('/students/:studentId/notes', teacherOrAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { notes } = req.body;

    // Verify assignment
    if (req.user.role !== 'admin') {
      const assignment = await Assignment.findOne({
        teacherId: req.user.userId,
        studentId,
        active: true,
      });
      if (!assignment) {
        return res.status(403).json({ message: 'This student is not assigned to you' });
      }
    }

    const student = await User.findByIdAndUpdate(
      studentId,
      { notes },
      { new: true },
    ).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Notes updated', student });
  } catch (err) {
    console.error('Teacher update notes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
