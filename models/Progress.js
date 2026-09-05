const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  weightKg: {
    type: Number,
    required: true
  },
  heightCm: {
    type: Number
  },
  bmi: {
    type: Number
  },
  bmiCategory: {
    type: String
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  caloriesConsumed: {
    type: Number,
    default: 0
  },
  waterIntakeL: {
    type: Number,
    default: 0
  },
  workoutsCompletedCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
