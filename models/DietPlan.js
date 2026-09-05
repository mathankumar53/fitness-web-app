const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  timeCategory: {
    type: String, // Breakfast, Lunch, Snack, Dinner
    required: true
  },
  name: { type: String, required: true },
  description: { type: String },
  calories: { type: Number, required: true },
  proteinGrams: { type: Number, default: 0 },
  carbsGrams: { type: Number, default: 0 },
  fatGrams: { type: Number, default: 0 },
  icon: { type: String, default: '🥗' }
});

const DietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'keto'],
    required: true
  },
  description: { type: String, required: true },
  targetDailyCalories: { type: Number, required: true },
  macrosPercentage: {
    protein: { type: Number, default: 30 },
    carbs: { type: Number, default: 45 },
    fat: { type: Number, default: 25 }
  },
  meals: [MealSchema],
  tips: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
