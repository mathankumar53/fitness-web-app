const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB, getIsConnected } = require('./config/db');
const { defaultWorkouts, defaultDietPlans } = require('./config/store');
const WorkoutPlan = require('./models/WorkoutPlan');
const DietPlan = require('./models/DietPlan');
const User = require('./models/User');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const bmiRoutes = require('./routes/bmiRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const dietRoutes = require('./routes/dietRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');
const trainerRoutes = require('./routes/trainerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trainer', trainerRoutes);

// Seed function for MongoDB Atlas
const seedInitialData = async () => {
  if (!getIsConnected()) return;
  try {
    const workoutCount = await WorkoutPlan.countDocuments();
    if (workoutCount === 0) {
      console.log('🌱 Seeding default Workout Plans to MongoDB Atlas...');
      await WorkoutPlan.insertMany(defaultWorkouts.map(({ _id, ...rest }) => rest));
      console.log('✅ Default Workout Plans seeded successfully.');
    }

    const dietCount = await DietPlan.countDocuments();
    if (dietCount === 0) {
      console.log('🌱 Seeding default Diet Plans to MongoDB Atlas...');
      await DietPlan.insertMany(defaultDietPlans.map(({ _id, ...rest }) => rest));
      console.log('✅ Default Diet Plans seeded successfully.');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default Demo User to MongoDB Atlas...');
      await User.create({
        name: 'Alex Morgan',
        email: 'demo@pulsefit.com',
        password: 'password123',
        role: 'member',
        age: 22,
        gender: 'male',
        heightCm: 175,
        weightKg: 70,
        targetWeightKg: 65,
        dailyCalorieGoal: 2200,
        dailyWaterGoalL: 3.0,
        fitnessGoal: 'weight_loss',
        avatar: '⚡',
        streakDays: 5
      });
      console.log('✅ Default Demo User seeded successfully.');

      console.log('🌱 Seeding default Trainer User to MongoDB Atlas...');
      await User.create({
        name: 'Coach Marcus Vance',
        email: 'trainer@pulsefit.com',
        password: 'password123',
        role: 'trainer',
        avatar: '🏋️‍♂️',
        specialization: 'Elite Strength & Conditioning',
        experienceYears: 8,
        certifications: 'NASM-CPT, CSCS',
        bio: 'Head Strength Coach with 8+ years helping college athletes and fitness enthusiasts surpass their physical limits.'
      });
      console.log('✅ Default Demo Trainer seeded successfully.');
    }
  } catch (err) {
    console.error('Data seeding warning:', err.message);
  }
};

// Catch-all route to serve SPA frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global JSON & Express Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload received.' });
  }
  console.error('Express Error Handler:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Process Level Safety Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// Start Server & Connect Database
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 Fitness Web Application Server running on http://localhost:${PORT}`);
  try {
    const connected = await connectDB();
    if (connected) {
      await seedInitialData();
    }
  } catch (err) {
    console.error('Database connection warning:', err.message);
  }
});

