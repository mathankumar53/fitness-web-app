const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  repsOrDuration: { type: String, required: true },
  restSeconds: { type: Number, default: 30 },
  instructions: { type: String, default: '' },
  targetMuscle: { type: String, default: 'Full Body' },
  icon: { type: String, default: '🏋️‍♂️' }
});

const WorkoutPlanSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['weight_loss', 'muscle_building', 'cardio', 'hiit', 'flexibility'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  estimatedCaloriesBurned: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageBadge: {
    type: String,
    default: '🔥'
  },
  exercises: [ExerciseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
