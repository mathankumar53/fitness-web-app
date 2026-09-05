/* Diet & Nutrition Page Controller Script */

const Diet = {
  activeGoal: 'all',

  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this.fetchDietPlans();
      this._bound = true;
    }
    this.populateInputs();
  },

  populateInputs() {
    const user = API.getUser();
    if (user) {
      const ageInput = document.getElementById('dietAgeInput');
      const genderInput = document.getElementById('dietGenderInput');
      const weightInput = document.getElementById('dietWeightInput');
      const heightInput = document.getElementById('dietHeightInput');
      const goalInput = document.getElementById('dietGoalInput');

      if (ageInput && user.age) ageInput.value = user.age;
      if (genderInput && user.gender) genderInput.value = user.gender;
      if (weightInput && user.weightKg) weightInput.value = user.weightKg;
      if (heightInput && user.heightCm) heightInput.value = user.heightCm;
      if (goalInput && user.fitnessGoal) goalInput.value = user.fitnessGoal;
    }
  },

  lastTargetCalories: 2000,

  bindEvents() {
    const macroForm = document.getElementById('macroForm');
    if (macroForm) {
      macroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateMacros();
      });
    }

    const applyBtn = document.getElementById('applyMacroGoalBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        const user = API.getUser();
        if (user) {
          user.dailyCalorieGoal = this.lastTargetCalories;
          API.setUser(user);
          try {
            await API.put('/api/user/profile', { dailyCalorieGoal: this.lastTargetCalories });
          } catch (e) {}
        }
        showToast(`Daily Calorie Target updated to ${this.lastTargetCalories} kcal! 🎯`, 'success');
        if (window.Dashboard && window.Dashboard.updateStats) {
          window.Dashboard.updateStats();
        }
      });
    }

    const dietGoalTabs = document.getElementById('dietGoalTabs');
    if (dietGoalTabs) {
      dietGoalTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
          document.querySelectorAll('#dietGoalTabs .tab-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.activeGoal = e.target.getAttribute('data-goal');
          this.fetchDietPlans();
        }
      });
    }
  },

  async calculateMacros() {
    const age = document.getElementById('dietAgeInput').value;
    const gender = document.getElementById('dietGenderInput').value;
    const weightKg = document.getElementById('dietWeightInput').value;
    const heightCm = document.getElementById('dietHeightInput').value;
    const activityLevel = document.getElementById('dietActivityInput').value;
    const goal = document.getElementById('dietGoalInput').value;

    try {
      const res = await API.post('/api/diet/calculate-macros', {
        age, gender, weightKg, heightCm, activityLevel, goal
      });

      if (res.success && res.data) {
        this.lastTargetCalories = res.data.targetCalories;
        this.renderMacroResults(res.data);
      }
    } catch (err) {
      showToast('Failed to calculate macros.', 'error');
    }
  },

  renderMacroResults(data) {
    const box = document.getElementById('macroResultBox');
    box.style.display = 'block';

    document.getElementById('resBMR').textContent = `${data.bmr} kcal`;
    document.getElementById('resTDEE').textContent = `${data.tdee} kcal`;
    document.getElementById('resTargetCalories').textContent = `${data.targetCalories} kcal/day`;

    // Protein
    document.getElementById('resProteinText').textContent = `${data.macros.protein.grams}g (${data.macros.protein.percentage}%)`;
    document.getElementById('resProteinBar').style.width = `${data.macros.protein.percentage}%`;

    // Carbs
    document.getElementById('resCarbsText').textContent = `${data.macros.carbs.grams}g (${data.macros.carbs.percentage}%)`;
    document.getElementById('resCarbsBar').style.width = `${data.macros.carbs.percentage}%`;

    // Fat
    document.getElementById('resFatText').textContent = `${data.macros.fat.grams}g (${data.macros.fat.percentage}%)`;
    document.getElementById('resFatBar').style.width = `${data.macros.fat.percentage}%`;

    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async fetchDietPlans() {
    const container = document.getElementById('dietPlansContainer');
    container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">Loading nutrition plans... 🥗</div>';

    try {
      const res = await API.get(`/api/diet/plans?goal=${this.activeGoal}`);
      if (res.success && res.plans) {
        this.renderDietPlans(res.plans);
      }
    } catch (err) {
      container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--accent-rose);">Failed to load diet plans.</div>';
    }
  },

  renderDietPlans(plans) {
    const container = document.getElementById('dietPlansContainer');
    if (plans.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">No diet plans found for this goal.</div>';
      return;
    }

    container.innerHTML = plans.map(p => `
      <div class="glass-card" style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 20px; color: var(--text-main);">${p.title}</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">${p.description}</p>
          </div>
          <div style="text-align:right;">
            <span style="font-family: var(--font-heading); font-size: 22px; font-weight:800; color: var(--accent-green);">${p.targetDailyCalories} kcal</span>
            <div style="font-size: 12px; color: var(--text-muted);">Daily Target</div>
          </div>
        </div>

        <!-- Meals Grid -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 16px 0;">
          ${p.meals.map(m => `
            <div style="background: rgba(15,23,42,0.6); padding: 14px; border-radius: 12px; border: 1px solid var(--border-glass);">
              <div style="font-size: 12px; font-weight:700; color: var(--secondary); text-transform:uppercase;">${m.icon || '🥗'} ${m.timeCategory}</div>
              <div style="font-weight:600; font-size: 15px; margin: 6px 0;">${m.name}</div>
              <p style="font-size: 12px; color: var(--text-muted); line-height: 1.3;">${m.description}</p>
              <div style="margin-top: 10px; font-size: 12px; display:flex; justify-content:space-between; color: var(--text-main); font-weight:600;">
                <span>🔥 ${m.calories} kcal</span>
                <span>💪 ${m.proteinGrams}g P</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tips Section -->
        ${p.tips && p.tips.length > 0 ? `
          <div style="background: rgba(139,92,246,0.1); border-left: 3px solid var(--primary); padding: 12px 16px; border-radius: 6px; font-size: 13px; color: var(--text-muted);">
            <strong style="color: var(--text-main);">💡 Nutrition Tips:</strong> ${p.tips.join(' • ')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
};

window.Diet = Diet;
