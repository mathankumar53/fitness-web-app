const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fitness_app_jwt_key_2026';

// Generate Token helper
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, heightCm, weightKg, age, gender, fitnessGoal, role, specialization, experienceYears, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        role: role || 'member',
        heightCm: heightCm ? Number(heightCm) : 175,
        weightKg: weightKg ? Number(weightKg) : 70,
        age: age ? Number(age) : 22,
        gender: gender || 'male',
        fitnessGoal: fitnessGoal || 'weight_loss',
        specialization: specialization || '',
        experienceYears: experienceYears ? Number(experienceYears) : null,
        bio: bio || ''
      });

      const token = generateToken(user._id, user.email, user.role);
      const userObj = user.toObject();
      delete userObj.password;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: userObj
      });
    } else {
      // In-Memory Fallback
      const existingUser = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: role || 'member',
        heightCm: heightCm ? Number(heightCm) : 175,
        weightKg: weightKg ? Number(weightKg) : 70,
        age: age ? Number(age) : 22,
        gender: gender || 'male',
        fitnessGoal: fitnessGoal || 'weight_loss',
        dailyCalorieGoal: 2200,
        dailyWaterGoalL: 3.0,
        avatar: role === 'trainer' ? '🏋️‍♂️' : '⚡',
        streakDays: 1,
        specialization: specialization || '',
        experienceYears: experienceYears ? Number(experienceYears) : null,
        bio: bio || '',
        createdAt: new Date()
      };

      inMemoryStore.users.push(newUser);

      const token = generateToken(newUser._id, newUser.email, newUser.role);
      const { password: _, ...userWithoutPass } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully! (Demo Storage)',
        token,
        user: userWithoutPass
      });
    }
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Registration Error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      const userObj = user.toObject();
      delete userObj.password;

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: userObj
      });
    } else {
      // In-Memory Fallback
      const user = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      const { password: _, ...userWithoutPass } = user;

      return res.json({
        success: true,
        message: 'Logged in successfully! (Demo Storage)',
        token,
        user: userWithoutPass
      });
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Login Error' });
  }
});



// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    if (getIsConnected() && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({ success: true, user });
    } else {
      const user = inMemoryStore.users.find(u => u._id === req.user.id);
      if (!user) {
        // Return fallback profile if user id is temporary
        return res.json({
          success: true,
          user: {
            _id: req.user.id,
            name: 'Demo Fitness User',
            email: req.user.email,
            age: 22,
            heightCm: 175,
            weightKg: 70,
            targetWeightKg: 65,
            dailyCalorieGoal: 2200,
            dailyWaterGoalL: 3.0,
            fitnessGoal: 'weight_loss',
            avatar: '⚡',
            streakDays: 3
          }
        });
      }
      const { password: _, ...userWithoutPass } = user;
      return res.json({ success: true, user: userWithoutPass });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
  }
});

module.exports = router;
