const mongoose = require('mongoose');

/**
 * Assignment — links a teacher to a student.
 * Created by admin via POST /api/admin/assign.
 */
const assignmentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

// A teacher-student pair must be unique
assignmentSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
