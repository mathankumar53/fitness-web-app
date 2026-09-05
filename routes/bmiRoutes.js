const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');

// Helper to calculate BMI and status
const calculateBMIDetails = (weightKg, heightCm) => {
  const heightMeters = heightCm / 100;
  const bmiRaw = weightKg / (heightMeters * heightMeters);
  const bmi = parseFloat(bmiRaw.toFixed(1));

  let category = '';
  let color = '';
  let advice = '';
  let riskLevel = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#38bdf8'; // Light Blue
    riskLevel = 'Low (Risk of nutritional deficiency)';
    advice = 'Focus on nutrient-rich foods and strength training to build healthy lean body mass.';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal Weight';
    color = '#10b981'; // Emerald Green
    riskLevel = 'Low Risk (Optimal health range)';
    advice = 'Great job! Maintain your balanced diet and regular physical activity to sustain fitness.';
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = 'Overweight';
    color = '#f59e0b'; // Amber
    riskLevel = 'Increased Risk (Pre-obesity stage)';
    advice = 'Incorporate moderate daily aerobic workouts and a mild caloric deficit with balanced macros.';
  } else {
    category = 'Obese';
    color = '#ef4444'; // Red
    riskLevel = 'High Risk (Increased cardiovascular risk)';
    advice = 'Consult a healthcare professional to create a structured weight loss and lifestyle plan.';
  }

  // Ideal weight range for height (BMI 18.5 - 24.9)
  const minIdealWeight = parseFloat((18.5 * heightMeters * heightMeters).toFixed(1));
  const maxIdealWeight = parseFloat((24.9 * heightMeters * heightMeters).toFixed(1));

  return {
    bmi,
    category,
    color,
    riskLevel,
    advice,
    idealWeightRange: `${minIdealWeight} kg - ${maxIdealWeight} kg`
  };
};

// @route   POST /api/bmi/calculate
// @desc    Calculate BMI & optionally save log to user history
// @access  Public / Optional Auth
router.post('/calculate', async (req, res) => {
  try {
    const { weightKg, heightCm, saveLog, userId } = req.body;

    if (!weightKg || !heightCm) {
      return res.status(400).json({ success: false, message: 'Please provide both weight (kg) and height (cm).' });
    }

    const w = Number(weightKg);
    const h = Number(heightCm);

    if (w <= 0 || h <= 0) {
      return res.status(400).json({ success: false, message: 'Weight and height must be positive numbers.' });
    }

    const result = calculateBMIDetails(w, h);
    const today = new Date().toISOString().split('T')[0];

    // If request asks to save log and userId is provided
    if (saveLog && userId) {
      if (getIsConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        let log = await Progress.findOne({ userId, date: today });
        if (log) {
          log.weightKg = w;
          log.heightCm = h;
          log.bmi = result.bmi;
          log.bmiCategory = result.category;
          log.notes = `BMI calculated: ${result.bmi} (${result.category})`;
          await log.save();
        } else {
          await Progress.create({
            userId,
            date: today,
            weightKg: w,
            heightCm: h,
            bmi: result.bmi,
            bmiCategory: result.category,
            notes: `BMI calculated: ${result.bmi} (${result.category})`
          });
        }
      } else {
        let log = inMemoryStore.progressLogs.find(p => (p.userId === userId || p.userId === 'demo_user') && p.date === today);
        if (log) {
          log.weightKg = w;
          log.heightCm = h;
          log.bmi = result.bmi;
          log.bmiCategory = result.category;
          log.notes = `BMI calculated: ${result.bmi} (${result.category})`;
        } else {
          inMemoryStore.progressLogs.push({
            _id: 'p_' + Date.now(),
            userId: userId || 'demo_user',
            date: today,
            weightKg: w,
            heightCm: h,
            bmi: result.bmi,
            bmiCategory: result.category,
            caloriesBurned: 0,
            waterIntakeL: 0,
            notes: `BMI calculated: ${result.bmi}`
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        weightKg: w,
        heightCm: h,
        ...result,
        logSaved: !!(saveLog && userId)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to calculate BMI.' });
  }
});

module.exports = router;
