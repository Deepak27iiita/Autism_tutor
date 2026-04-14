const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['animals', 'food', 'objects', 'actions', 'colors', 'body', 'clothing', 'transport'],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  pecsPhase: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 1,
  },
  metadata: {
    description: String,
    tags: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Word', wordSchema);

