/**
 * Admin Routes — /api/admin
 * All routes require auth + admin role.
 */
const express = require('express');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [auth, authorize('admin')];

// ─── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users  — list all users (optionally filter by role)
router.get('/users', adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/role  — change a user's role
router.put('/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['child', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin update role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/active  — toggle isActive
router.put('/users/:id/active', adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true },
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin toggle active error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Assignments ──────────────────────────────────────────────────────────────

// GET /api/admin/assignments  — list all active teacher→student assignments
router.get('/assignments', adminOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find({ active: true })
      .populate('teacherId', 'username email role')
      .populate('studentId', 'username email role')
      .populate('assignedBy', 'username')
      .sort({ assignedAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error('Admin get assignments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/assign  — create teacher→student assignment
router.post('/assign', adminOnly, async (req, res) => {
  try {
    const { teacherId, studentId } = req.body;
    if (!teacherId || !studentId) {
      return res.status(400).json({ message: 'teacherId and studentId are required' });
    }

    const [teacher, student] = await Promise.all([
      User.findById(teacherId),
      User.findById(studentId),
    ]);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }
    if (!student || student.role !== 'child') {
      return res.status(400).json({ message: 'Invalid student (must be a child role)' });
    }

    // Upsert — reactivate if previously deactivated
    const assignment = await Assignment.findOneAndUpdate(
      { teacherId, studentId },
      { teacherId, studentId, assignedBy: req.user.userId, active: true, assignedAt: new Date() },
      { upsert: true, new: true },
    );

    const populated = await assignment.populate([
      { path: 'teacherId', select: 'username email' },
      { path: 'studentId', select: 'username email' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Admin assign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/assign/:id  — deactivate assignment
router.delete('/assign/:id', adminOnly, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true },
    );
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment removed' });
  } catch (err) {
    console.error('Admin delete assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── System Stats ──────────────────────────────────────────────────────────────

// GET /api/admin/stats  — system-wide overview numbers
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalTeachers, totalStudents, totalAdmins, totalAssignments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ role: 'admin' }),
      Assignment.countDocuments({ active: true }),
    ]);
    res.json({ totalUsers, totalTeachers, totalStudents, totalAdmins, totalAssignments });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
