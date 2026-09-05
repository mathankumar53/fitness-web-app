const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');

// @route   POST /api/diet/calculate-macros
// @desc    Calculate Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE) and target macros
// @access  Public
router.post('/calculate-macros', (req, res) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;

    const w = weightKg ? Number(weightKg) : 70;
    const h = heightCm ? Number(heightCm) : 175;
    const a = age ? Number(age) : 22;
    const isMale = gender === 'male' || !gender;

    // Harris-Benedict BMR Calculation
    let bmr = 0;
    if (isMale) {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    // Activity multiplier
    let multiplier = 1.375; // light activity default
    if (activityLevel === 'sedentary') multiplier = 1.2;
    if (activityLevel === 'moderate') multiplier = 1.55;
    if (activityLevel === 'very_active') multiplier = 1.725;

    let tdee = bmr * multiplier;

    // Goal adjustments
    let targetCalories = Math.round(tdee);
    if (goal === 'weight_loss') targetCalories = Math.round(tdee - 500); // 500 kcal deficit
    if (goal === 'muscle_gain') targetCalories = Math.round(tdee + 400); // 400 kcal surplus

    // Macros Ratio (Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g)
    let proteinRatio = 0.30;
    let carbsRatio = 0.45;
    let fatRatio = 0.25;

    if (goal === 'weight_loss') {
      proteinRatio = 0.35;
      carbsRatio = 0.40;
      fatRatio = 0.25;
    } else if (goal === 'muscle_gain') {
      proteinRatio = 0.30;
      carbsRatio = 0.50;
      fatRatio = 0.20;
    }

    const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
    const carbsGrams = Math.round((targetCalories * carbsRatio) / 4);
    const fatGrams = Math.round((targetCalories * fatRatio) / 9);

    return res.json({
      success: true,
      data: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
        goal: goal || 'weight_loss',
        macros: {
          protein: { grams: proteinGrams, calories: proteinGrams * 4, percentage: Math.round(proteinRatio * 100) },
          carbs: { grams: carbsGrams, calories: carbsGrams * 4, percentage: Math.round(carbsRatio * 100) },
          fat: { grams: fatGrams, calories: fatGrams * 9, percentage: Math.round(fatRatio * 100) }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Macro calculation failed.' });
  }
});

// @route   GET /api/diet/plans
// @desc    Get curated diet plans (optional filter by goal)
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const { goal } = req.query;

    if (getIsConnected()) {
      const query = {};
      if (goal && goal !== 'all') query.goal = goal;

      const plans = await DietPlan.find(query);
      return res.json({ success: true, count: plans.length, plans });
    } else {
      let plans = [...inMemoryStore.dietPlans];
      if (goal && goal !== 'all') {
        plans = plans.filter(p => p.goal === goal);
      }
      return res.json({ success: true, count: plans.length, plans });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch diet plans.' });
  }
});

module.exports = router;
