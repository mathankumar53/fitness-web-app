// In-Memory Storage & Default Catalogs for Demo Mode and Initial Seeding

const defaultWorkouts = [
  {
    _id: 'w1',
    title: 'Full Body HIIT Blast',
    category: 'hiit',
    level: 'intermediate',
    durationMinutes: 25,
    estimatedCaloriesBurned: 320,
    description: 'High intensity interval training designed to burn maximum fat in short time.',
    imageBadge: '⚡',
    exercises: [
      { name: 'Jumping Jacks', sets: 3, repsOrDuration: '45 sec', restSeconds: 15, targetMuscle: 'Full Body', icon: '🏃‍♂️', instructions: 'Jump feet out and raise arms overhead repeatedly with fast tempo.' },
      { name: 'Mountain Climbers', sets: 3, repsOrDuration: '45 sec', restSeconds: 15, targetMuscle: 'Core & Cardio', icon: '🧗‍♂️', instructions: 'High plank position, alternate driving knees rapidly toward chest.' },
      { name: 'Bodyweight Squats', sets: 3, repsOrDuration: '20 reps', restSeconds: 20, targetMuscle: 'Quads & Glutes', icon: '🏋️‍♂️', instructions: 'Keep feet shoulder-width apart, lower hips below knee level.' },
      { name: 'Push-Ups', sets: 3, repsOrDuration: '15 reps', restSeconds: 20, targetMuscle: 'Chest & Triceps', icon: '💪', instructions: 'Keep core tight, lower chest to floor and push up strong.' },
      { name: 'High Knees', sets: 3, repsOrDuration: '45 sec', restSeconds: 15, targetMuscle: 'Cardio & Legs', icon: '🏃‍♀️', instructions: 'Sprint in place bringing knees up to hip height.' }
    ]
  },
  {
    _id: 'w2',
    title: 'Fat Loss Shredder',
    category: 'weight_loss',
    level: 'beginner',
    durationMinutes: 30,
    estimatedCaloriesBurned: 280,
    description: 'Targeted cardio and core routine aimed at shedding unwanted weight smoothly.',
    imageBadge: '🔥',
    exercises: [
      { name: 'High Knee Sprints', sets: 4, repsOrDuration: '30 sec', restSeconds: 15, targetMuscle: 'Cardio', icon: '👟', instructions: 'Pump arms and drive knees continuously.' },
      { name: 'Bicycle Crunches', sets: 3, repsOrDuration: '20 reps', restSeconds: 15, targetMuscle: 'Abs & Obliques', icon: '🧘‍♂️', instructions: 'Touch opposite elbow to knee while rotating torso.' },
      { name: 'Plank Hold', sets: 3, repsOrDuration: '60 sec', restSeconds: 30, targetMuscle: 'Core', icon: '🧱', instructions: 'Hold straight line from shoulders to ankles.' },
      { name: 'Lunges', sets: 3, repsOrDuration: '12 per leg', restSeconds: 20, targetMuscle: 'Legs', icon: '🦵', instructions: 'Step forward into 90-degree bend for both knees.' }
    ]
  },
  {
    _id: 'w3',
    title: 'Hypertrophy Upper Body',
    category: 'muscle_building',
    level: 'advanced',
    durationMinutes: 45,
    estimatedCaloriesBurned: 380,
    description: 'Hypertrophy focused routine for shoulder, chest, and back muscle growth.',
    imageBadge: '💪',
    exercises: [
      { name: 'Diamond Push-ups', sets: 4, repsOrDuration: '12 reps', restSeconds: 45, targetMuscle: 'Triceps & Inner Chest', icon: '🔹', instructions: 'Form a diamond shape with index finger and thumbs under chest.' },
      { name: 'Pike Push-ups', sets: 4, repsOrDuration: '10 reps', restSeconds: 45, targetMuscle: 'Deltoids & Upper Chest', icon: '🔺', instructions: 'Hips high in upside-down V position, lower top of head toward floor.' },
      { name: 'Doorframe Towel Rows', sets: 4, repsOrDuration: '15 reps', restSeconds: 45, targetMuscle: 'Lats & Upper Back', icon: '🚣', instructions: 'Lean back pulling body toward frame with elbows tucked.' },
      { name: 'Dips (Chair/Bench)', sets: 4, repsOrDuration: '15 reps', restSeconds: 30, targetMuscle: 'Triceps & Chest', icon: '🪑', instructions: 'Lower hips off bench edge until elbows flex 90 degrees.' }
    ]
  },
  {
    _id: 'w4',
    title: 'Core & Abs Sculptor',
    category: 'hiit',
    level: 'beginner',
    durationMinutes: 15,
    estimatedCaloriesBurned: 180,
    description: 'Quick 15-minute high intensity core workout to tone and strengthen abdominals.',
    imageBadge: '🎯',
    exercises: [
      { name: 'Russian Twists', sets: 3, repsOrDuration: '30 reps', restSeconds: 15, targetMuscle: 'Obliques', icon: '🔄', instructions: 'Sit on floor, lean back slightly and rotate shoulders side to side.' },
      { name: 'Leg Raises', sets: 3, repsOrDuration: '15 reps', restSeconds: 20, targetMuscle: 'Lower Abs', icon: '⬆️', instructions: 'Lie flat, lift legs straight up to 90 degrees without arching lower back.' },
      { name: 'Flutter Kicks', sets: 3, repsOrDuration: '40 sec', restSeconds: 15, targetMuscle: 'Lower Core', icon: '👣', instructions: 'Small fast scissor kicks keeping legs extended.' },
      { name: 'Side Plank', sets: 2, repsOrDuration: '30 sec per side', restSeconds: 15, targetMuscle: 'Obliques', icon: '📐', instructions: 'Balance on forearm, lift hips high in straight line.' }
    ]
  },
  {
    _id: 'w5',
    title: 'Morning Energy Yoga & Stretch',
    category: 'flexibility',
    level: 'beginner',
    durationMinutes: 20,
    estimatedCaloriesBurned: 120,
    description: 'Gentle mobility and flexibility flow to increase joint range of motion and vitality.',
    imageBadge: '🧘',
    exercises: [
      { name: 'Cat-Cow Flow', sets: 2, repsOrDuration: '10 reps', restSeconds: 10, targetMuscle: 'Spine', icon: '🐈', instructions: 'Inhale arch back down, exhale round spine upward.' },
      { name: 'Downward-Facing Dog', sets: 3, repsOrDuration: '45 sec', restSeconds: 15, targetMuscle: 'Hamstrings & Shoulders', icon: '🐕', instructions: 'Press hands down and lift hips up toward ceiling.' },
      { name: 'Cobra Stretch', sets: 2, repsOrDuration: '30 sec', restSeconds: 15, targetMuscle: 'Abs & Chest', icon: '🐍', instructions: 'Lie prone, press hands down to lift chest while keeping hips down.' }
    ]
  }
];

const defaultDietPlans = [
  {
    _id: 'd1',
    title: 'High Protein Lean Shred',
    goal: 'weight_loss',
    description: 'Designed for fat loss while preserving muscle mass with optimized protein intake.',
    targetDailyCalories: 2000,
    macrosPercentage: { protein: 40, carbs: 35, fat: 25 },
    meals: [
      { timeCategory: 'Breakfast', name: 'Oatmeal & Protein Bowl', description: 'Rolled oats cooked with skim milk, 1 scoop whey protein, chia seeds & fresh berries.', calories: 420, proteinGrams: 32, carbsGrams: 52, fatGrams: 8, icon: '🥣' },
      { timeCategory: 'Lunch', name: 'Grilled Chicken Quinoa Salad', description: '200g grilled breast chicken, quinoa, mixed greens, cherry tomatoes & olive oil dressing.', calories: 580, proteinGrams: 48, carbsGrams: 45, fatGrams: 14, icon: '🥗' },
      { timeCategory: 'Snack', name: 'Greek Yogurt & Almonds', description: 'Plain Greek yogurt with 15g raw almonds and honey drizzle.', calories: 250, proteinGrams: 20, carbsGrams: 18, fatGrams: 10, icon: '🍨' },
      { timeCategory: 'Dinner', name: 'Baked Salmon & Asparagus', description: 'Salmon fillet with roasted asparagus, steamed broccoli and brown rice.', calories: 650, proteinGrams: 45, carbsGrams: 40, fatGrams: 22, icon: '🐟' }
    ],
    tips: [
      'Drink at least 3 Liters of water daily.',
      'Eat dinner at least 2.5 hours before sleep.',
      'Avoid sugary sodas and fruit juices with added sugar.'
    ]
  },
  {
    _id: 'd2',
    title: 'Clean Bulking Muscle Growth',
    goal: 'muscle_gain',
    description: 'Nutrient-dense calorie surplus plan to maximize hypertrophy without excessive body fat.',
    targetDailyCalories: 2800,
    macrosPercentage: { protein: 30, carbs: 50, fat: 20 },
    meals: [
      { timeCategory: 'Breakfast', name: 'Egg White & Whole Egg Omelet', description: '3 whole eggs + 2 egg whites, whole wheat toast & avocado slice.', calories: 550, proteinGrams: 35, carbsGrams: 42, fatGrams: 20, icon: '🍳' },
      { timeCategory: 'Lunch', name: 'Lean Beef & Sweet Potato Plate', description: 'Lean ground beef (200g), large sweet potato, green beans.', calories: 750, proteinGrams: 52, carbsGrams: 75, fatGrams: 18, icon: '🥩' },
      { timeCategory: 'Snack', name: 'Mass Gainer Smoothie', description: 'Banana, peanut butter, oats, milk and whey protein blended.', calories: 550, proteinGrams: 38, carbsGrams: 65, fatGrams: 16, icon: '🥤' },
      { timeCategory: 'Dinner', name: 'Turkey Breast & Basmati Rice', description: 'Grilled turkey cutlets, basmati rice, sautéed spinach.', calories: 700, proteinGrams: 50, carbsGrams: 70, fatGrams: 14, icon: '🦃' }
    ],
    tips: [
      'Consistent meal timing every 3-4 hours.',
      'Post-workout meal within 45 minutes of training.',
      'Prioritize complex carbohydrates like sweet potatoes and oats.'
    ]
  },
  {
    _id: 'd3',
    title: 'Balanced Fitness Maintenance',
    goal: 'maintenance',
    description: 'Sustain your ideal body composition with balanced macronutrient distribution.',
    targetDailyCalories: 2200,
    macrosPercentage: { protein: 25, carbs: 50, fat: 25 },
    meals: [
      { timeCategory: 'Breakfast', name: 'Fruit & Seed Smoothie Toast', description: 'Whole grain toast with almond butter, green berry smoothie.', calories: 450, proteinGrams: 18, carbsGrams: 60, fatGrams: 14, icon: '🍞' },
      { timeCategory: 'Lunch', name: 'Mediterranean Chicken Wrap', description: 'Whole wheat wrap, diced chicken breast, hummus, cucumber and feta.', calories: 600, proteinGrams: 38, carbsGrams: 58, fatGrams: 18, icon: '🌯' },
      { timeCategory: 'Snack', name: 'Mixed Fruit & Walnut Bowl', description: 'Apple slices, oranges and raw walnuts.', calories: 250, proteinGrams: 6, carbsGrams: 35, fatGrams: 12, icon: '🍎' },
      { timeCategory: 'Dinner', name: 'Tofu / Lean Pork Stir-Fry', description: 'Stir-fried vegetables, tofu or pork strips with noodles or brown rice.', calories: 680, proteinGrams: 36, carbsGrams: 72, fatGrams: 16, icon: '🍲' }
    ],
    tips: [
      'Focus on whole foods over processed snacks.',
      'Maintain steady hydration throughout the day.'
    ]
  }
];

const bcrypt = require('bcryptjs');

const defaultDemoUser = {
  _id: 'demo_user_1',
  name: 'Alex Morgan',
  email: 'demo@pulsefit.com',
  password: bcrypt.hashSync('password123', 10),
  role: 'member',
  age: 22,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  targetWeightKg: 65,
  dailyCalorieGoal: 2200,
  dailyWaterGoalL: 3.0,
  fitnessGoal: 'weight_loss',
  activityLevel: 'moderate',
  avatar: '⚡',
  streakDays: 5,
  createdAt: new Date(),
  assignedTrainer: 'trainer_demo_1'
};

const defaultDemoTrainer = {
  _id: 'trainer_demo_1',
  name: 'Coach Marcus Vance',
  email: 'trainer@pulsefit.com',
  password: bcrypt.hashSync('password123', 10),
  role: 'trainer',
  avatar: '🏋️‍♂️',
  specialization: 'Elite Strength & Conditioning',
  experienceYears: 8,
  certifications: 'NASM-CPT, CSCS',
  bio: 'Head Strength Coach with 8+ years helping college athletes and fitness enthusiasts surpass their physical limits.',
  assignedMembers: ['demo_user_1'],
  createdAt: new Date()
};

// Fallback In-Memory Storage for Demo Mode
const inMemoryStore = {
  users: [defaultDemoUser, defaultDemoTrainer],
  progressLogs: [],
  workouts: [...defaultWorkouts],
  dietPlans: [...defaultDietPlans],
  assignments: [], // For coach notes and plan assignments
  messages: [] // For coach advice messages
};

module.exports = {
  defaultWorkouts,
  defaultDietPlans,
  inMemoryStore
};

