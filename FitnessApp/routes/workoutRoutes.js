const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const WorkoutPlan = require('../models/WorkoutPlan');
const Progress = require('../models/Progress');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');
const { protect, optionalProtect } = require('../middleware/auth');

// @route   GET /api/workouts
// @desc    Get all workout plans with optional filter by category or level
// @access  Public
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { category, level } = req.query;
    const userId = req.user ? req.user.id : null;

    if (getIsConnected()) {
      const query = { $or: [{ memberId: { $exists: false } }, { memberId: null }] };

      if (category && category !== 'all') query.category = category;
      if (level && level !== 'all') query.level = level;

      const workouts = await WorkoutPlan.find(query);
      return res.json({ success: true, count: workouts.length, workouts });
    } else {
      let workouts = [...inMemoryStore.workouts];
      workouts = workouts.filter(w => !w.memberId);
      if (category && category !== 'all') {
        workouts = workouts.filter(w => w.category === category);
      }
      if (level && level !== 'all') {
        workouts = workouts.filter(w => w.level === level);
      }
      return res.json({ success: true, count: workouts.length, workouts });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch workout plans.' });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get details of a specific workout plan
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const workoutId = req.params.id;

    if (getIsConnected() && mongoose.Types.ObjectId.isValid(workoutId)) {
      const workout = await WorkoutPlan.findById(workoutId);
      if (!workout) {
        return res.status(404).json({ success: false, message: 'Workout plan not found.' });
      }
      return res.json({ success: true, workout });
    } else {
      const workout = inMemoryStore.workouts.find(w => w._id === workoutId);
      if (!workout) {
        return res.status(404).json({ success: false, message: 'Workout plan not found.' });
      }
      return res.json({ success: true, workout });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching workout details.' });
  }
});

// @route   POST /api/workouts/custom
// @desc    Create a custom workout plan (Trainer Only)
// @access  Private (Trainer)
router.post('/custom', protect, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ success: false, message: 'Only trainers can create custom workout plans.' });
    }

    const { title, category, durationMinutes, estimatedCaloriesBurned, description, exercises, assignedToMemberId } = req.body;

    if (getIsConnected()) {
      const newPlan = await WorkoutPlan.create({
        trainerId: req.user.id,
        memberId: assignedToMemberId,
        title,
        category,
        durationMinutes,
        estimatedCaloriesBurned,
        description,
        exercises
      });

      const Message = require('../models/Message');
      await Message.create({
        trainerId: req.user.id,
        memberId: assignedToMemberId,
        workoutPlanId: newPlan._id,
        content: `I've assigned you a new custom workout plan: **${title}**! Click below to get started.`
      });

      return res.json({ success: true, message: 'Custom workout plan assigned successfully!', plan: newPlan });
    } else {
      const newPlan = {
        _id: 'plan_' + Date.now(),
        trainerId: req.user.id,
        memberId: assignedToMemberId,
        title,
        category,
        durationMinutes,
        estimatedCaloriesBurned,
        description,
        exercises,
        createdAt: new Date()
      };
      inMemoryStore.workouts.push(newPlan);

      inMemoryStore.messages.push({
        _id: 'msg_' + Date.now(),
        trainerId: req.user.id,
        memberId: assignedToMemberId,
        workoutPlanId: newPlan._id,
        content: `I've assigned you a new custom workout plan: **${title}**! Click below to get started.`,
        createdAt: new Date()
      });

      return res.json({ success: true, message: 'Custom workout plan assigned successfully! (Demo)', plan: newPlan });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating custom workout plan.' });
  }
});

// @route   POST /api/workouts/complete
// @desc    Log a completed workout and add calories burned to daily progress
// @access  Public / Protected
router.post('/complete', async (req, res) => {
  try {
    const { userId, workoutTitle, caloriesBurned, durationMinutes } = req.body;

    const targetUserId = userId || 'demo_user';
    const burned = caloriesBurned ? Number(caloriesBurned) : 250;
    const duration = durationMinutes ? Number(durationMinutes) : 30;
    const today = new Date().toISOString().split('T')[0];

    if (getIsConnected() && mongoose.Types.ObjectId.isValid(targetUserId)) {
      let progress = await Progress.findOne({ userId: targetUserId, date: today });
      if (!progress) {
        progress = new Progress({
          userId: targetUserId,
          date: today,
          weightKg: 70,
          caloriesBurned: burned,
          workoutsCompletedCount: 1,
          notes: `Completed: ${workoutTitle || 'Workout'} (${duration} min)`
        });
      } else {
        progress.caloriesBurned += burned;
        progress.workoutsCompletedCount += 1;
      }
      await progress.save();
    } else {
      const existingLog = inMemoryStore.progressLogs.find(p => (p.userId === targetUserId || p.userId === 'demo_user') && p.date === today);
      if (existingLog) {
        existingLog.caloriesBurned += burned;
        existingLog.workoutsCompletedCount = (existingLog.workoutsCompletedCount || 0) + 1;
      } else {
        inMemoryStore.progressLogs.push({
          _id: 'p_' + Date.now(),
          userId: targetUserId,
          date: today,
          weightKg: 70,
          caloriesBurned: burned,
          workoutsCompletedCount: 1,
          notes: `Completed: ${workoutTitle || 'Workout'}`
        });
      }
    }

    res.json({
      success: true,
      message: `Awesome! You completed "${workoutTitle || 'Workout'}" and burned ${burned} calories! 🔥`,
      summary: {
        workoutTitle,
        caloriesBurned: burned,
        durationMinutes: duration
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record workout completion.' });
  }
});

module.exports = router;
