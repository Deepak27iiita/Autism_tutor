const mongoose = require('mongoose');

const stageResultSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['pre-test', 'presentation', 'recognition', 'reading', 'spelling', 'imitation', 'elicitation', 'post-test'],
    required: true,
  },
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true,
  },
  correct: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  animationLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['training', 'pre-test', 'post-test'],
    required: true,
  },
  words: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
  }],
  results: [stageResultSchema],
  preTestScore: {
    type: Number,
    default: 0,
  },
  postTestScore: {
    type: Number,
    default: 0,
  },
  improvement: {
    type: Number, // percentage
    default: 0,
  },
  duration: {
    type: Number, // total time in seconds
    default: 0,
  },
  animationIntensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Calculate improvement before saving
sessionSchema.pre('save', function (next) {
  if (this.preTestScore > 0 && this.postTestScore > 0) {
    this.improvement = ((this.postTestScore - this.preTestScore) / this.preTestScore) * 100;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);

