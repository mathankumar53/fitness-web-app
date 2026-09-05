/* Dashboard Page Controller Script */

const Dashboard = {
  quotes: [
    "“The only bad workout is the one that didn't happen.”",
    "“Your body can stand almost anything. It's your mind that you have to convince.”",
    "“Action is the foundational key to all success.”",
    "“Small daily improvements over time lead to stunning results.”",
    "“Believe you can and you're halfway there.”"
  ],

  currentWaterL: 1.5,
  _bound: false,

  init() {
    this.renderRandomQuote();
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.updateStats();
  },

  bindEvents() {
    const addWaterBtn = document.getElementById('dashAddWaterBtn');
    if (addWaterBtn) {
      addWaterBtn.addEventListener('click', () => {
        this.currentWaterL = parseFloat((this.currentWaterL + 0.25).toFixed(2));
        this.updateWaterDisplay();
        showToast('Logged 250ml water! 💧', 'info');
        const user = API.getUser();
        const userId = user ? user._id : 'demo_user';
        API.post('/api/progress/log', {
          userId,
          waterIntakeL: 0.25
        }).catch(() => {});
      });
    }

    const quickWorkoutBtn = document.getElementById('dashQuickWorkoutBtn');
    if (quickWorkoutBtn) {
      quickWorkoutBtn.addEventListener('click', () => {
        window.App.navigateTo('workouts');
      });
    }
  },

  renderRandomQuote() {
    const quoteEl = document.getElementById('dashMotivationalQuote');
    if (quoteEl) {
      const idx = Math.floor(Math.random() * this.quotes.length);
      quoteEl.textContent = this.quotes[idx];
    }
  },

  updateWaterDisplay() {
    const user = API.getUser();
    const targetL = user ? (user.dailyWaterGoalL || 3.0) : 3.0;
    const waterValEl = document.getElementById('dashWaterValue');
    const waterFillEl = document.getElementById('dashWaterFill');

    if (waterValEl) {
      waterValEl.textContent = `${this.currentWaterL.toFixed(2)} / ${targetL} L`;
    }
    if (waterFillEl) {
      const pct = Math.min(100, Math.round((this.currentWaterL / targetL) * 100));
      waterFillEl.style.width = `${pct}%`;
    }
  },

  async updateStats() {
    const user = API.getUser();
    const userId = user ? user._id : 'demo_user';

    const weightValEl = document.getElementById('dashWeightValue');
    const calorieValEl = document.getElementById('dashCalorieValue');
    const bmiValEl = document.getElementById('dashBMIValue');
    const streakValEl = document.getElementById('dashStreakValue');
    const streakHeaderEl = document.getElementById('dashStreakHeader');

    const streakDays = user ? (user.streakDays || 3) : 3;
    if (streakValEl) streakValEl.textContent = `${streakDays} Days`;
    if (streakHeaderEl) streakHeaderEl.textContent = `${streakDays} Day Streak`;

    if (user) {
      if (weightValEl) weightValEl.textContent = `${user.weightKg || 70} kg`;
      if (calorieValEl) calorieValEl.textContent = `${user.dailyCalorieGoal || 2200} kcal`;

      if (user.weightKg && user.heightCm) {
        const heightM = user.heightCm / 100;
        const bmi = (user.weightKg / (heightM * heightM)).toFixed(1);
        if (bmiValEl) bmiValEl.textContent = bmi;
      }
    } else {
      if (weightValEl) weightValEl.textContent = '70 kg';
      if (calorieValEl) calorieValEl.textContent = '2200 kcal';
      if (bmiValEl) bmiValEl.textContent = '22.9';
    }

    // Sync today's progress log (e.g. water intake) from server/store
    try {
      const res = await API.get(`/api/progress/${userId}`);
      if (res.success && res.logs && res.logs.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = res.logs.find(l => l.date === todayStr);
        if (todayLog && typeof todayLog.waterIntakeL === 'number') {
          this.currentWaterL = todayLog.waterIntakeL;
        }
      }
    } catch (e) {
      // ignore offline error
    }

    this.updateWaterDisplay();
  }
};

window.Dashboard = Dashboard;
