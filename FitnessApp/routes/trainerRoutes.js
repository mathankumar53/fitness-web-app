const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Message = require('../models/Message');
const { getIsConnected } = require('../config/db');
const { inMemoryStore } = require('../config/store');
const { protect } = require('../middleware/auth');

// Middleware to ensure user is a trainer
const trainerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'trainer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Trainer role required.' });
  }
};

// @route   GET /api/trainer/trainees
// @desc    Get all trainees assigned to this trainer (or all users in demo mode)
// @access  Private (Trainer only)
router.get('/trainees', protect, trainerOnly, async (req, res) => {
  try {
    if (getIsConnected()) {
      const trainees = await User.find({ role: 'member' }).select('-password');
      // Fetch progress for these trainees
      const traineesWithProgress = await Promise.all(trainees.map(async (t) => {
        const logs = await Progress.find({ userId: t._id }).sort({ date: -1 }).limit(5);
        return { ...t.toObject(), recentLogs: logs };
      }));
      return res.json({ success: true, count: traineesWithProgress.length, trainees: traineesWithProgress });
    } else {
      const trainees = inMemoryStore.users.filter(u => u.role === 'member' && u.assignedTrainer === req.user.id);
      const traineesWithProgress = trainees.map(t => {
        const logs = inMemoryStore.progressLogs.filter(p => p.userId === t._id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        const { password, ...safeUser } = t;
        return { ...safeUser, recentLogs: logs };
      });
      return res.json({ success: true, count: traineesWithProgress.length, trainees: traineesWithProgress });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch trainees.' });
  }
});

// @route   POST /api/trainer/assign-plan
// @desc    Assign a plan or leave coach notes for a member
// @access  Private (Trainer only)
router.post('/assign-plan', protect, trainerOnly, async (req, res) => {
  try {
    const { memberId, planType, planId, notes } = req.body;
    
    if (getIsConnected()) {
      // For simplicity in the demo, we could just log this assignment in a generic collection or User fields.
      // E.g., we add `trainerNotes` to the User model, but we'll use our assignments array in memory for demo
      return res.json({ success: true, message: 'Plan assigned successfully (DB mode not fully implemented for assignments).' });
    } else {
      const member = inMemoryStore.users.find(u => u._id === memberId && u.role === 'member');
      if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

      const assignment = {
        _id: 'assign_' + Date.now(),
        trainerId: req.user.id,
        memberId,
        planType, // 'workout', 'diet', 'general'
        planId,
        notes,
        date: new Date()
      };
      inMemoryStore.assignments.push(assignment);
      return res.json({ success: true, message: `Successfully assigned to ${member.name}!` });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign plan.' });
  }
});

// @route   GET /api/trainer/assignments/:memberId
// @desc    Get coach assignments/notes for a member
// @access  Private
router.get('/assignments/:memberId', protect, async (req, res) => {
  try {
    const targetId = req.params.memberId || req.user.id;
    if (!getIsConnected()) {
      const assignments = inMemoryStore.assignments.filter(a => a.memberId === targetId).sort((a,b) => b.date - a.date);
      return res.json({ success: true, assignments });
    }
    return res.json({ success: true, assignments: [] });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error fetching assignments.' });
  }
});

// @route   POST /api/trainer/add-member
// @desc    Add a member to the trainer's roster using their email
// @access  Private (Trainer only)
router.post('/add-member', protect, trainerOnly, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide a member email.' });

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const member = await User.findOne({ email: cleanEmail, role: 'member' });
      if (!member) return res.status(404).json({ success: false, message: 'Member not found with that email.' });
      
      // Assign trainer to member
      member.assignedTrainer = req.user.id;
      await member.save();

      // Add member to trainer's assignedMembers
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { assignedMembers: member._id } });

      return res.json({ success: true, message: `Successfully added ${member.name} to your roster!` });
    } else {
      const member = inMemoryStore.users.find(u => u.email === cleanEmail && u.role === 'member');
      if (!member) return res.status(404).json({ success: false, message: 'Member not found with that email.' });

      member.assignedTrainer = req.user.id;
      
      const trainer = inMemoryStore.users.find(u => u._id === req.user.id);
      if (trainer) {
        if (!trainer.assignedMembers) trainer.assignedMembers = [];
        if (!trainer.assignedMembers.includes(member._id)) {
          trainer.assignedMembers.push(member._id);
        }
      }
      return res.json({ success: true, message: `Successfully added ${member.name} to your roster! (Demo Mode)` });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add member.' });
  }
});

// @route   POST /api/trainer/messages
// @desc    Send an advice message to a member
// @access  Private (Trainer only)
router.post('/messages', protect, trainerOnly, async (req, res) => {
  try {
    const { memberId, content } = req.body;
    if (!memberId || !content) return res.status(400).json({ success: false, message: 'Please provide member ID and content.' });

    if (getIsConnected()) {
      const newMessage = await Message.create({
        trainerId: req.user.id,
        memberId,
        content
      });
      return res.json({ success: true, message: 'Advice sent successfully!', data: newMessage });
    } else {
      const newMessage = {
        _id: 'msg_' + Date.now(),
        trainerId: req.user.id,
        memberId,
        content,
        createdAt: new Date()
      };
      inMemoryStore.messages.push(newMessage);
      return res.json({ success: true, message: 'Advice sent successfully! (Demo Mode)', data: newMessage });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// @route   GET /api/trainer/messages/:memberId
// @desc    Get messages sent to a specific member
// @access  Private (Trainer only)
router.get('/messages/:memberId', protect, trainerOnly, async (req, res) => {
  try {
    const memberId = req.params.memberId;
    if (getIsConnected()) {
      const messages = await Message.find({ trainerId: req.user.id, memberId }).sort({ createdAt: -1 });
      return res.json({ success: true, messages });
    } else {
      const messages = inMemoryStore.messages.filter(m => m.trainerId === req.user.id && m.memberId === memberId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, messages });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

module.exports = router;
