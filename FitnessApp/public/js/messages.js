/* Messages Controller Script (Member View) */

const Messages = {
  _bound: false,
  messages: [],

  init() {
    if (!this._bound) {
      this._bound = true;
    }
    this.loadMessages();
  },

  async loadMessages() {
    const user = API.getUser();
    if (!user || user.role !== 'member') return;

    try {
      const res = await API.get('/api/user/messages');
      if (res.success) {
        this.messages = res.messages;
        this.renderMessages();
      }
    } catch (err) {
      showToast('Failed to load coach messages', 'error');
    }
  },

  renderMessages() {
    const container = document.getElementById('messagesFeedContainer');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-envelope-open" style="font-size: 32px; margin-bottom: 16px; opacity: 0.5;"></i>
          <div>No advice from your coach yet. Keep crushing your workouts!</div>
        </div>
      `;
      return;
    }

    let html = '';
    this.messages.forEach(msg => {
      const dateStr = new Date(msg.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      let workoutBtnHtml = '';
      if (msg.workoutPlanId) {
        workoutBtnHtml = `
          <div style="margin-top: 12px;">
            <button class="btn btn-primary btn-sm" onclick="window.Workouts.openWorkoutModal('${msg.workoutPlanId}')">
              <i class="fa-solid fa-play"></i> Start Custom Workout
            </button>
          </div>
        `;
      }

      html += `
        <div class="message-card">
          <div class="message-avatar"><i class="fa-solid fa-crown" style="font-size: 20px; color: white;"></i></div>
          <div class="message-body">
            <div class="message-header">
              <span class="message-sender">Coach's Advice</span>
              <span class="message-date">${dateStr}</span>
            </div>
            <div class="message-content">${msg.content}</div>
            ${workoutBtnHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};

window.Messages = Messages;
