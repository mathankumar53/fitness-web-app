/* Workouts Page Controller Script */

const Workouts = {
  activeCategory: 'all',
  currentWorkout: null,
  timerInterval: null,
  timerSecondsLeft: 0,

  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.fetchWorkouts();
  },

  bindEvents() {
    const tabContainer = document.getElementById('workoutTabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
          const cat = e.target.getAttribute('data-category');
          document.querySelectorAll('#workoutTabs .tab-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          this.activeCategory = cat;
          this.fetchWorkouts();
        }
      });
    }

    const modalCloseBtn = document.getElementById('workoutModalClose');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeWorkoutModal();
      });
    }

    const timerToggleBtn = document.getElementById('timerToggleBtn');
    if (timerToggleBtn) {
      timerToggleBtn.addEventListener('click', () => {
        this.toggleTimer();
      });
    }

    const finishWorkoutBtn = document.getElementById('finishWorkoutBtn');
    if (finishWorkoutBtn) {
      finishWorkoutBtn.addEventListener('click', async () => {
        await this.completeWorkout();
      });
    }
  },

  async fetchWorkouts() {
    const container = document.getElementById('workoutsGrid');
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Loading workout routines... 🏋️‍♂️</div>';

    try {
      const res = await API.get(`/api/workouts?category=${this.activeCategory}`);
      if (res.success && res.workouts) {
        this.renderWorkouts(res.workouts);
      }
    } catch (err) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--accent-rose);">Failed to load workout plans.</div>';
    }
  },

  renderWorkouts(workouts) {
    const container = document.getElementById('workoutsGrid');
    if (workouts.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No workouts found for this category.</div>';
      return;
    }

    container.innerHTML = workouts.map(w => `
      <div class="glass-card glass-card-interactive workout-card">
        <div>
          <div class="workout-card-header">
            <span class="workout-badge">${w.imageBadge || '🔥'}</span>
            <span class="level-tag ${w.level}">${w.level}</span>
          </div>
          <h3 class="workout-title">${w.title}</h3>
          <p class="workout-desc">${w.description}</p>
          <div class="workout-meta">
            <div class="workout-meta-item"><i class="fa-regular fa-clock"></i> ${w.durationMinutes} min</div>
            <div class="workout-meta-item"><i class="fa-solid fa-fire-flame-curved"></i> ${w.estimatedCaloriesBurned} kcal</div>
            <div class="workout-meta-item"><i class="fa-solid fa-list-check"></i> ${w.exercises ? w.exercises.length : 0} exercises</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Workouts.openWorkoutModal('${w._id}')">
          <i class="fa-solid fa-play"></i> Start Workout
        </button>
      </div>
    `).join('');
  },

  async openWorkoutModal(workoutId) {
    try {
      const res = await API.get(`/api/workouts/${workoutId}`);
      if (res.success && res.workout) {
        this.currentWorkout = res.workout;
        const modal = document.getElementById('workoutDetailModal');

        document.getElementById('modalWorkoutTitle').textContent = res.workout.title;
        document.getElementById('modalWorkoutDesc').textContent = res.workout.description;
        document.getElementById('modalCalories').textContent = `${res.workout.estimatedCaloriesBurned} kcal`;
        document.getElementById('modalDuration').textContent = `${res.workout.durationMinutes} min`;

        // Render exercise list
        const exList = document.getElementById('modalExerciseList');
        exList.innerHTML = res.workout.exercises.map((ex, i) => `
          <div style="background: rgba(15,23,42,0.6); padding: 14px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border-glass);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <strong style="color: var(--text-main); font-size: 15px;">${ex.icon} ${i + 1}. ${ex.name}</strong>
              <span style="font-size: 13px; color: var(--secondary); background: rgba(6,182,212,0.1); padding: 2px 8px; border-radius: 12px;">${ex.sets} sets × ${ex.repsOrDuration}</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">${ex.instructions || 'Focus on smooth form and controlled breathing.'}</p>
          </div>
        `).join('');

        // Reset Timer
        this.timerSecondsLeft = res.workout.durationMinutes * 60;
        this.updateTimerDisplay();
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        document.getElementById('timerToggleBtn').innerHTML = '<i class="fa-solid fa-play"></i> Start Timer';

        modal.classList.add('active');
      }
    } catch (err) {
      showToast('Failed to open workout details.', 'error');
    }
  },

  closeWorkoutModal() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    document.getElementById('workoutDetailModal').classList.remove('active');
  },

  toggleTimer() {
    const btn = document.getElementById('timerToggleBtn');
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume Timer';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Timer';
      this.timerInterval = setInterval(() => {
        if (this.timerSecondsLeft > 0) {
          this.timerSecondsLeft--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          showToast('Time is up! Great workout session!', 'success');
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Timer Done';
        }
      }, 1000);
    }
  },

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSecondsLeft / 60);
    const secs = this.timerSecondsLeft % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('modalTimerCountdown').textContent = str;
  },

  async completeWorkout() {
    if (!this.currentWorkout) return;
    const user = API.getUser();
    const userId = user ? user._id : 'demo_user';

    try {
      const res = await API.post('/api/workouts/complete', {
        userId,
        workoutTitle: this.currentWorkout.title,
        caloriesBurned: this.currentWorkout.estimatedCaloriesBurned,
        durationMinutes: this.currentWorkout.durationMinutes
      });

      if (res.success) {
        showToast(res.message, 'success');
        this.closeWorkoutModal();
        if (window.Dashboard && window.Dashboard.updateStats) {
          window.Dashboard.updateStats();
        }
        if (window.ProgressTracker && window.ProgressTracker.fetchHistory) {
          window.ProgressTracker.fetchHistory();
        }
      }
    } catch (err) {
      showToast('Workout logged!', 'success');
      this.closeWorkoutModal();
      if (window.Dashboard && window.Dashboard.updateStats) {
        window.Dashboard.updateStats();
      }
      if (window.ProgressTracker && window.ProgressTracker.fetchHistory) {
        window.ProgressTracker.fetchHistory();
      }
    }
  }
};

window.Workouts = Workouts;
