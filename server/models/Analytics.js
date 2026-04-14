const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  metrics: {
    wordsLearned: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    averageTimePerWord: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 }, // after 30 days
  },
  animationMetrics: {
    averageIntensity: { type: String, enum: ['low', 'medium', 'high'] },
    animationAssistedImprovement: { type: Number, default: 0 },
  },
  wordProgress: [{
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
    },
    masteryLevel: {
      type: Number, // 0-100
      default: 0,
    },
    lastPracticed: Date,
    timesPracticed: { type: Number, default: 0 },
  }],
});

// Index for efficient queries
analyticsSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

