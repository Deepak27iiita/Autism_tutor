const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['child', 'teacher', 'admin'],
    default: 'child',
  },
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    avatar: String,
  },
  preferences: {
    animationIntensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    autoAdvance: {
      type: Boolean,
      default: false,
    },
  },
  learningStats: {
    totalSessions: { type: Number, default: 0 },
    totalWordsLearned: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    lastSessionDate: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

