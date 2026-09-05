const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');

// @route   GET /api/progress/:userId
// @desc    Get user progress logs history for charts
// @access  Public / Protected
router.get('/:userId', async (req, res) => {
  try {
    const targetUserId = req.params.userId || 'demo_user';

    if (getIsConnected() && mongoose.Types.ObjectId.isValid(targetUserId)) {
      const logs = await Progress.find({ userId: targetUserId }).sort({ date: 1 });
      return res.json({ success: true, count: logs.length, logs });
    } else {
      let logs = inMemoryStore.progressLogs.filter(p => p.userId === targetUserId);
      
      // If user has no logs in demo mode yet, generate sample initial week data and persist into memory store
      if (logs.length === 0) {
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const sampleWeight = parseFloat((72.5 - (i * 0.3)).toFixed(1));
          const sampleHeight = 175;
          const sampleBmi = parseFloat((sampleWeight / (1.75 * 1.75)).toFixed(1));
          inMemoryStore.progressLogs.push({
            _id: 'sample_' + Date.now() + '_' + i,
            userId: targetUserId,
            date: dateStr,
            weightKg: sampleWeight,
            heightCm: sampleHeight,
            bmi: sampleBmi,
            bmiCategory: 'Normal Weight',
            caloriesBurned: 200 + (i % 3) * 80,
            waterIntakeL: parseFloat((2.0 + (i % 2) * 0.5).toFixed(1)),
            workoutsCompletedCount: i % 2 === 0 ? 1 : 0,
            notes: i === 0 ? "Today's sample log" : `Daily activity (${dateStr})`
          });
        }
        logs = inMemoryStore.progressLogs.filter(p => p.userId === targetUserId);
      }
      return res.json({ success: true, count: logs.length, logs });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress logs.' });
  }
});

// @route   POST /api/progress/log
// @desc    Add or update today's progress entry (weight, water, calories, notes)
// @access  Public / Protected
router.post('/log', async (req, res) => {
  try {
    const { userId, weightKg, heightCm, waterIntakeL, caloriesBurned, notes } = req.body;

    const targetUserId = userId || 'demo_user';
    const today = new Date().toISOString().split('T')[0];
    const w = weightKg ? Number(weightKg) : null;
    const h = heightCm ? Number(heightCm) : 175;
    const water = waterIntakeL ? Number(waterIntakeL) : 0;
    const burned = caloriesBurned ? Number(caloriesBurned) : 0;

    let bmi = null;
    let bmiCategory = '';
    if (w && h) {
      const heightM = h / 100;
      bmi = parseFloat((w / (heightM * heightM)).toFixed(1));
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi <= 24.9) bmiCategory = 'Normal Weight';
      else if (bmi <= 29.9) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    if (getIsConnected() && mongoose.Types.ObjectId.isValid(targetUserId)) {
      let progress = await Progress.findOne({ userId: targetUserId, date: today });
      if (progress) {
        if (w) progress.weightKg = w;
        if (h) progress.heightCm = h;
        if (bmi) progress.bmi = bmi;
        if (bmiCategory) progress.bmiCategory = bmiCategory;
        if (water > 0) progress.waterIntakeL = parseFloat((progress.waterIntakeL + water).toFixed(2));
        if (burned > 0) progress.caloriesBurned += burned;
        if (notes) progress.notes = notes;
        await progress.save();
      } else {
        progress = await Progress.create({
          userId: targetUserId,
          date: today,
          weightKg: w || 70,
          heightCm: h,
          bmi: bmi || 22.9,
          bmiCategory: bmiCategory || 'Normal Weight',
          waterIntakeL: water,
          caloriesBurned: burned,
          notes: notes || ''
        });
      }

      if (w || h) {
        const u = await User.findById(targetUserId);
        if (u) {
          if (w) u.weightKg = w;
          if (h) u.heightCm = h;
          await u.save();
        }
      }

      return res.json({ success: true, message: 'Progress entry saved successfully!', progress });
    } else {
      let progress = inMemoryStore.progressLogs.find(p => (p.userId === targetUserId || p.userId === 'demo_user') && p.date === today);
      if (progress) {
        if (w) progress.weightKg = w;
        if (h) progress.heightCm = h;
        if (bmi) progress.bmi = bmi;
        if (bmiCategory) progress.bmiCategory = bmiCategory;
        if (water > 0) progress.waterIntakeL = parseFloat(((progress.waterIntakeL || 0) + water).toFixed(2));
        if (burned > 0) progress.caloriesBurned = (progress.caloriesBurned || 0) + burned;
        if (notes) progress.notes = notes;
      } else {
        progress = {
          _id: 'p_' + Date.now(),
          userId: targetUserId,
          date: today,
          weightKg: w || 70,
          heightCm: h,
          bmi: bmi || 22.9,
          bmiCategory: bmiCategory || 'Normal Weight',
          waterIntakeL: water,
          caloriesBurned: burned,
          notes: notes || ''
        };
        inMemoryStore.progressLogs.push(progress);
      }

      if (w || h) {
        const u = inMemoryStore.users.find(user => user._id === targetUserId);
        if (u) {
          if (w) u.weightKg = w;
          if (h) u.heightCm = h;
        }
      }

      return res.json({ success: true, message: 'Progress entry saved successfully! (Demo Mode)', progress });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log progress.' });
  }
});

module.exports = router;
