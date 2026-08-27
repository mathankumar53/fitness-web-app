/* Progress Tracker Page Controller Script (Chart.js Integration) */

const ProgressTracker = {
  weightChart: null,
  activityChart: null,

  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.fetchHistory();
  },

  bindEvents() {
    const form = document.getElementById('progressLogForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitLog();
      });
    }
  },

  async fetchHistory() {
    const user = API.getUser();
    const userId = user ? user._id : 'demo_user';

    try {
      const res = await API.get(`/api/progress/${userId}`);
      if (res.success && res.logs) {
        this.renderCharts(res.logs);
        this.renderHistoryTable(res.logs);
      }
    } catch (err) {
      console.error('Failed to fetch progress history:', err);
    }
  },

  async submitLog() {
    const user = API.getUser();
    const userId = user ? user._id : 'demo_user';
    const heightCm = user ? (user.heightCm || 175) : 175;

    const weightKg = document.getElementById('logWeightInput').value;
    const waterIntakeL = document.getElementById('logWaterInput').value;
    const caloriesBurned = document.getElementById('logCaloriesInput').value;
    const notes = document.getElementById('logNotesInput').value;

    try {
      const res = await API.post('/api/progress/log', {
        userId,
        weightKg,
        heightCm,
        waterIntakeL,
        caloriesBurned,
        notes
      });

      if (res.success) {
        showToast('Progress entry recorded successfully! 📈', 'success');
        document.getElementById('progressLogForm').reset();
        
        if (user && weightKg) {
          user.weightKg = Number(weightKg);
          API.setUser(user);
        }

        await this.fetchHistory();
        if (window.Dashboard && window.Dashboard.updateStats) {
          window.Dashboard.updateStats();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit log entry', 'error');
    }
  },

  renderCharts(logs) {
    if (typeof Chart === 'undefined') return;

    const dates = logs.map(l => l.date);
    const weights = logs.map(l => l.weightKg);
    const calories = logs.map(l => l.caloriesBurned || 0);

    // Render Weight Line Chart
    const weightCtx = document.getElementById('weightChartCanvas');
    if (weightCtx) {
      if (this.weightChart) this.weightChart.destroy();

      this.weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Weight (kg)',
            data: weights,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
          }
        }
      });
    }

    // Render Calories Burned Bar Chart
    const activityCtx = document.getElementById('activityChartCanvas');
    if (activityCtx) {
      if (this.activityChart) this.activityChart.destroy();

      this.activityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: 'Calories Burned (kcal)',
            data: calories,
            backgroundColor: '#06b6d4',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
          }
        }
      });
    }
  },

  renderHistoryTable(logs) {
    const tbody = document.getElementById('progressHistoryTbody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">No entries recorded yet.</td></tr>';
      return;
    }

    // Sort newest first for table
    const reversedLogs = [...logs].reverse();

    tbody.innerHTML = reversedLogs.map(l => `
      <tr style="border-bottom: 1px solid var(--border-glass);">
        <td style="padding: 12px; font-weight:600;">${l.date}</td>
        <td style="padding: 12px; color: var(--secondary);">${l.weightKg} kg</td>
        <td style="padding: 12px;">${l.bmi ? l.bmi + ' (' + (l.bmiCategory || 'Normal') + ')' : '-'}</td>
        <td style="padding: 12px; color: var(--accent-orange);">${l.caloriesBurned ? l.caloriesBurned + ' kcal' : '-'}</td>
        <td style="padding: 12px; color: var(--text-muted); font-size: 13px;">${l.notes || 'Daily log'}</td>
      </tr>
    `).join('');
  }
};

window.ProgressTracker = ProgressTracker;
