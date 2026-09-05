const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  age: {
    type: Number,
    default: 22
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  heightCm: {
    type: Number,
    default: 175
  },
  weightKg: {
    type: Number,
    default: 70
  },
  targetWeightKg: {
    type: Number,
    default: 68
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2200
  },
  dailyWaterGoalL: {
    type: Number,
    default: 3.0
  },
  fitnessGoal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance'],
    default: 'weight_loss'
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'very_active'],
    default: 'moderate'
  },
  avatar: {
    type: String,
    default: '⚡'
  },
  streakDays: {
    type: Number,
    default: 1
  },
  role: {
    type: String,
    enum: ['member', 'trainer'],
    default: 'member'
  },
  specialization: {
    type: String
  },
  experienceYears: {
    type: Number
  },
  certifications: {
    type: String
  },
  bio: {
    type: String
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password Hash Pre-Save Hook
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
