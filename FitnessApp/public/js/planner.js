const Planner = {
  exercises: [],

  init() {
    this.bindEvents();
    this.loadTrainees();
    if (this.exercises.length === 0) {
      this.addExerciseRow();
    }
  },

  bindEvents() {
    const addBtn = document.getElementById('addExerciseBtn');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.addEventListener('click', () => this.addExerciseRow());
      addBtn.dataset.bound = "true";
    }

    const form = document.getElementById('plannerForm');
    if (form && !form.dataset.bound) {
      form.addEventListener('submit', (e) => this.submitPlan(e));
      form.dataset.bound = "true";
    }
  },

  async loadTrainees() {
    const assigneeSelect = document.getElementById('planAssignee');
    if (!assigneeSelect) return;

    try {
      const res = await API.get('/api/trainer/trainees');
      if (res.success) {
        assigneeSelect.innerHTML = '<option value="">Select a Trainee...</option>';
        res.trainees.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c._id;
          opt.textContent = `${c.name} (${c.email})`;
          assigneeSelect.appendChild(opt);
        });
        if (res.trainees.length === 0) {
          assigneeSelect.innerHTML = '<option value="">No trainees assigned to you yet</option>';
        }
      }
    } catch (err) {
      console.error('Failed to load trainees for planner', err);
      assigneeSelect.innerHTML = '<option value="">Failed to load trainees</option>';
    }
  },

  addExerciseRow() {
    const container = document.getElementById('plannerExercisesContainer');
    if (!container) return;

    const rowId = 'ex_' + Date.now() + Math.floor(Math.random() * 1000);
    this.exercises.push(rowId);

    const row = document.createElement('div');
    row.className = 'exercise-row glass-card';
    row.id = rowId;
    row.style.padding = '16px';
    row.style.marginBottom = '12px';
    row.style.position = 'relative';

    row.innerHTML = `
      <button type="button" class="btn btn-secondary btn-sm" onclick="Planner.removeExerciseRow('${rowId}')" style="position: absolute; top: 12px; right: 12px; background: rgba(239,68,68,0.1); color: var(--accent-red); border-color: rgba(239,68,68,0.2);">
        <i class="fa-solid fa-trash"></i>
      </button>
      <div class="grid-3" style="padding-right: 40px;">
        <div class="form-group">
          <label class="form-label">Exercise Name</label>
          <input type="text" class="form-control ex-name" placeholder="e.g., Push-ups" required>
        </div>
        <div class="form-group">
          <label class="form-label">Sets</label>
          <input type="number" class="form-control ex-sets" placeholder="3" required>
        </div>
        <div class="form-group">
          <label class="form-label">Reps / Duration</label>
          <input type="text" class="form-control ex-reps" placeholder="12 reps or 30s" required>
        </div>
      </div>
    `;

    container.appendChild(row);
  },

  removeExerciseRow(rowId) {
    this.exercises = this.exercises.filter(id => id !== rowId);
    const row = document.getElementById(rowId);
    if (row) row.remove();
  },

  async submitPlan(e) {
    e.preventDefault();

    const title = document.getElementById('planTitle').value;
    const category = document.getElementById('planCategory').value;
    const durationMinutes = document.getElementById('planDuration').value;
    const estimatedCaloriesBurned = document.getElementById('planCalories').value;
    const assignedToMemberId = document.getElementById('planAssignee').value;
    const description = document.getElementById('planDescription').value;

    if (!assignedToMemberId) {
      return showToast('Please select a trainee to assign the workout to.', 'error');
    }

    if (this.exercises.length === 0) {
      return showToast('Please add at least one exercise.', 'error');
    }

    const exercises = [];
    let hasError = false;

    this.exercises.forEach(rowId => {
      const row = document.getElementById(rowId);
      if (row) {
        const name = row.querySelector('.ex-name').value;
        const sets = row.querySelector('.ex-sets').value;
        const reps = row.querySelector('.ex-reps').value;
        
        if (!name || !sets || !reps) hasError = true;

        exercises.push({
          name: name,
          sets: Number(sets),
          repsOrDuration: reps,
          restSeconds: 30,
          targetMuscle: 'Custom Workout',
          icon: '🔥'
        });
      }
    });

    if (hasError) {
      return showToast('Please fill out all exercise fields.', 'error');
    }

    const payload = {
      title,
      category,
      durationMinutes: Number(durationMinutes),
      estimatedCaloriesBurned: Number(estimatedCaloriesBurned),
      assignedToMemberId,
      description,
      exercises
    };

    const submitBtn = document.querySelector('#plannerForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    try {
      const res = await API.post('/api/workouts/custom', payload);
      if (res.success) {
        showToast(res.message, 'success');
        document.getElementById('plannerForm').reset();
        document.getElementById('plannerExercisesContainer').innerHTML = '';
        this.exercises = [];
        this.addExerciseRow();
      }
    } catch (err) {
      showToast(err.message || 'Failed to assign workout plan', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
};

window.Planner = Planner;
