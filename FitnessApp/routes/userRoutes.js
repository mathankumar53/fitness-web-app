const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');
const { protect } = require('../middleware/auth');

// @route   PUT /api/user/profile
// @desc    Update user profile data
// @access  Private / Protected
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      dailyCalorieGoal,
      dailyWaterGoalL,
      fitnessGoal,
      avatar,
      specialization,
      experienceYears,
      bio,
      certifications
    } = req.body;

    if (getIsConnected() && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      if (name) user.name = name;
      if (age) user.age = Number(age);
      if (gender) user.gender = gender;
      if (heightCm) user.heightCm = Number(heightCm);
      if (weightKg) user.weightKg = Number(weightKg);
      if (targetWeightKg) user.targetWeightKg = Number(targetWeightKg);
      if (dailyCalorieGoal) user.dailyCalorieGoal = Number(dailyCalorieGoal);
      if (dailyWaterGoalL) user.dailyWaterGoalL = Number(dailyWaterGoalL);
      if (fitnessGoal) user.fitnessGoal = fitnessGoal;
      if (avatar) user.avatar = avatar;
      if (specialization) user.specialization = specialization;
      if (experienceYears) user.experienceYears = Number(experienceYears);
      if (bio) user.bio = bio;
      if (certifications) user.certifications = certifications;

      await user.save();

      const updatedObj = user.toObject();
      delete updatedObj.password;

      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: updatedObj
      });
    } else {
      let user = inMemoryStore.users.find(u => u._id === req.user.id);
      if (!user) {
        // Return dummy user for fallback session
        user = {
          _id: req.user.id,
          name: name || 'Demo Fitness User',
          email: req.user.email,
          age: age ? Number(age) : 22,
          gender: gender || 'male',
          heightCm: heightCm ? Number(heightCm) : 175,
          weightKg: weightKg ? Number(weightKg) : 70,
          targetWeightKg: targetWeightKg ? Number(targetWeightKg) : 65,
          dailyCalorieGoal: dailyCalorieGoal ? Number(dailyCalorieGoal) : 2200,
          dailyWaterGoalL: dailyWaterGoalL ? Number(dailyWaterGoalL) : 3.0,
          fitnessGoal: fitnessGoal || 'weight_loss',
          avatar: avatar || '⚡',
          streakDays: 3,
          specialization: specialization || '',
          experienceYears: experienceYears ? Number(experienceYears) : null,
          bio: bio || '',
          certifications: certifications || ''
        };
        inMemoryStore.users.push(user);
      } else {
        if (name) user.name = name;
        if (age) user.age = Number(age);
        if (gender) user.gender = gender;
        if (heightCm) user.heightCm = Number(heightCm);
        if (weightKg) user.weightKg = Number(weightKg);
        if (targetWeightKg) user.targetWeightKg = Number(targetWeightKg);
        if (dailyCalorieGoal) user.dailyCalorieGoal = Number(dailyCalorieGoal);
        if (dailyWaterGoalL) user.dailyWaterGoalL = Number(dailyWaterGoalL);
        if (fitnessGoal) user.fitnessGoal = fitnessGoal;
        if (avatar) user.avatar = avatar;
        if (specialization) user.specialization = specialization;
        if (experienceYears) user.experienceYears = Number(experienceYears);
        if (bio) user.bio = bio;
        if (certifications) user.certifications = certifications;
      }

      const { password: _, ...userWithoutPass } = user;

      return res.json({
        success: true,
        message: 'Profile updated successfully! (Demo Mode)',
        user: userWithoutPass
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// @route   GET /api/user/messages
// @desc    Get advice messages sent to the member by their trainer
// @access  Private (Member only)
router.get('/messages', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const Message = require('../models/Message');
      const messages = await Message.find({ memberId: req.user.id }).sort({ createdAt: -1 });
      return res.json({ success: true, messages });
    } else {
      const messages = inMemoryStore.messages.filter(m => m.memberId === req.user.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, messages });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

module.exports = router;
