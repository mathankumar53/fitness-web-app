/* BMI Calculator Page Controller Script */

const BMICalculator = {
  lastResult: null,

  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.populateInputs();
  },

  populateInputs() {
    const user = API.getUser();
    if (user) {
      const weightInput = document.getElementById('bmiWeightInput');
      const heightInput = document.getElementById('bmiHeightInput');
      if (weightInput && user.weightKg && !weightInput.value) weightInput.value = user.weightKg;
      if (heightInput && user.heightCm && !heightInput.value) heightInput.value = user.heightCm;
    }
  },

  bindEvents() {
    const form = document.getElementById('bmiForm');
    const saveBtn = document.getElementById('bmiSaveLogBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.calculate();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const user = API.getUser();
        const userId = user ? user._id : 'demo_user';
        const weightKg = document.getElementById('bmiWeightInput').value;
        const heightCm = document.getElementById('bmiHeightInput').value;

        if (!weightKg || !heightCm) {
          showToast('Please calculate your BMI first.', 'error');
          return;
        }

        try {
          const res = await API.post('/api/bmi/calculate', {
            weightKg,
            heightCm,
            saveLog: true,
            userId
          });

          if (res.success) {
            showToast('BMI entry saved to your progress history! 📈', 'success');
            if (window.ProgressTracker && window.ProgressTracker.fetchHistory) {
              window.ProgressTracker.fetchHistory();
            }
          }
        } catch (err) {
          showToast(err.message || 'Failed to save log', 'error');
        }
      });
    }
  },

  async calculate() {
    const weightKg = parseFloat(document.getElementById('bmiWeightInput').value);
    const heightCm = parseFloat(document.getElementById('bmiHeightInput').value);

    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
      showToast('Please enter valid positive numbers for weight and height.', 'error');
      return;
    }

    try {
      const res = await API.post('/api/bmi/calculate', { weightKg, heightCm });
      if (res.success) {
        this.lastResult = res.data;
        this.renderResult(res.data);
      }
    } catch (err) {
      showToast(err.message || 'BMI calculation failed', 'error');
    }
  },

  renderResult(data) {
    const resultBox = document.getElementById('bmiResultBox');
    const scoreEl = document.getElementById('bmiScoreDisplay');
    const badgeEl = document.getElementById('bmiCategoryBadge');
    const needleEl = document.getElementById('bmiNeedle');
    const riskEl = document.getElementById('bmiRiskText');
    const idealRangeEl = document.getElementById('bmiIdealRangeText');
    const adviceEl = document.getElementById('bmiAdviceText');

    resultBox.style.display = 'block';
    scoreEl.textContent = data.bmi;
    badgeEl.textContent = data.category;
    badgeEl.style.backgroundColor = data.color;
    badgeEl.style.color = '#ffffff';

    // Calculate position % on meter (scale from 15 to 35)
    // 15 = 0%, 35 = 100%
    const minBMI = 15;
    const maxBMI = 35;
    let clampedBMI = Math.max(minBMI, Math.min(maxBMI, data.bmi));
    let pct = ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
    needleEl.style.left = `${pct}%`;

    riskEl.textContent = data.riskLevel;
    idealRangeEl.textContent = data.idealWeightRange;
    adviceEl.textContent = data.advice;

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.BMICalculator = BMICalculator;
