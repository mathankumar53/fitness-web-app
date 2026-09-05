/* Trainer Hub Controller Script */

const TrainerHub = {
  _bound: false,
  trainees: [],

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.loadTrainees();
  },

  bindEvents() {
    // We could bind assigning plan modals or other interactions here
  },

  async loadTrainees() {
    const user = API.getUser();
    if (!user || user.role !== 'trainer') return;

    try {
      const res = await API.get('/api/trainer/trainees');
      if (res.success) {
        this.trainees = res.trainees;
        this.renderTrainees();
      }
    } catch (err) {
      showToast('Failed to load trainees data', 'error');
    }
  },

  renderTrainees() {
    const container = document.getElementById('traineesListContainer');
    if (!container) return;

    if (this.trainees.length === 0) {
      container.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px;">No clients assigned yet.</div>';
      return;
    }

    let html = '';
    this.trainees.forEach(client => {
      const latestLog = client.recentLogs && client.recentLogs.length > 0 ? client.recentLogs[0] : null;
      const currentWeight = latestLog ? latestLog.weightKg : client.weightKg;
      
      let progressBadge = '';
      if (currentWeight && client.targetWeightKg) {
        const diff = (currentWeight - client.targetWeightKg).toFixed(1);
        if (client.fitnessGoal === 'weight_loss' && diff <= 0) {
          progressBadge = '<span class="streak-badge" style="background: rgba(16,185,129,0.1); color: var(--accent-green);"><i class="fa-solid fa-check"></i> Goal Reached</span>';
        } else if (client.fitnessGoal === 'weight_loss' && diff > 0) {
          progressBadge = `<span class="streak-badge" style="background: rgba(17,17,17,0.1); color: var(--primary);"><i class="fa-solid fa-arrow-down"></i> ${diff}kg to go</span>`;
        }
      }

      html += `
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 12px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="user-avatar" style="width: 48px; height: 48px; font-size: 24px;">${client.avatar || '🏃'}</div>
              <div>
                <h3 style="font-size: 16px; margin: 0;">${client.name}</h3>
                <div style="font-size: 12px; color: var(--text-muted);">${client.email}</div>
              </div>
            </div>
            ${progressBadge}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 13px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
            <div><span style="color:var(--text-muted)">Goal:</span> <span style="text-transform: capitalize; color:var(--text-main); font-weight: 500;">${(client.fitnessGoal || '').replace('_', ' ')}</span></div>
            <div><span style="color:var(--text-muted)">Weight:</span> <span style="color:var(--text-main); font-weight: 500;">${currentWeight || '--'} kg</span></div>
            <div><span style="color:var(--text-muted)">Target:</span> <span style="color:var(--text-main); font-weight: 500;">${client.targetWeightKg || '--'} kg</span></div>
            <div><span style="color:var(--text-muted)">Streak:</span> <span style="color:var(--text-main); font-weight: 500;"><i class="fa-solid fa-fire" style="color:var(--primary)"></i> ${client.streakDays || 0}</span></div>
          </div>

          <div style="margin-top: auto; display: flex; gap: 8px; padding-top: 12px;">
            <button class="btn btn-primary" style="flex: 1; padding: 8px; font-size: 13px;" onclick="TrainerHub.openSendAdviceModal('${client._id}', '${client.name}')">
              <i class="fa-solid fa-envelope"></i> Message
            </button>
            <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 13px;" onclick="TrainerHub.viewHistory('${client._id}')">
              <i class="fa-solid fa-chart-line"></i> History
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  openAddClientModal() {
    document.getElementById('addClientModal').classList.add('active');
    document.getElementById('addClientEmail').value = '';
  },

  async submitAddClient() {
    const email = document.getElementById('addClientEmail').value;
    if (!email) return showToast('Please enter an email', 'error');

    try {
      const res = await API.post('/api/trainer/add-member', { email });
      if (res.success) {
        showToast(res.message, 'success');
        document.getElementById('addClientModal').classList.remove('active');
        this.loadTrainees();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add client', 'error');
    }
  },

  currentMessageTargetId: null,

  openSendAdviceModal(clientId, clientName) {
    this.currentMessageTargetId = clientId;
    document.getElementById('sendAdviceModal').classList.add('active');
    document.getElementById('adviceContent').value = '';
  },

  async submitAdvice() {
    const content = document.getElementById('adviceContent').value;
    if (!content) return showToast('Please write some advice', 'error');

    try {
      const res = await API.post('/api/trainer/messages', {
        memberId: this.currentMessageTargetId,
        content
      });
      if (res.success) {
        showToast(res.message, 'success');
        document.getElementById('sendAdviceModal').classList.remove('active');
      }
    } catch (err) {
      showToast('Failed to send advice', 'error');
    }
  },

  viewHistory(clientId) {
    const client = this.trainees.find(c => c._id === clientId);
    if (!client) return;

    const container = document.getElementById('historyContentContainer');
    if (!container) return;

    let html = '';
    if (!client.recentLogs || client.recentLogs.length === 0) {
      html = '<div style="color:var(--text-muted); text-align:center;">No progress logs found.</div>';
    } else {
      client.recentLogs.forEach(log => {
        html += `
          <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
            <div style="font-weight: 600; color: var(--secondary); margin-bottom: 4px;">${log.date}</div>
            <div style="font-size: 13px; color: var(--text-main); display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div>Weight: ${log.weightKg} kg</div>
              <div>Calories Burned: ${log.caloriesBurned} kcal</div>
              <div>Water: ${log.waterIntakeL || 0} L</div>
              <div>Notes: ${log.notes || 'None'}</div>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
    document.getElementById('historyModal').classList.add('active');
  }
};

window.TrainerHub = TrainerHub;
