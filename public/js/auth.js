/* Auth Controller Script */

const Auth = {
  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.checkSession();
  },

  bindEvents() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    if (toggleToRegister) {
      toggleToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('registerBox').style.display = 'block';
      });
    }

    if (toggleToLogin) {
      toggleToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerBox').style.display = 'none';
        document.getElementById('loginBox').style.display = 'block';
      });
    }

    const fillDemoLoginBtn = document.getElementById('fillDemoLoginBtn');
    if (fillDemoLoginBtn) {
      fillDemoLoginBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = 'demo@pulsefit.com';
        if (passInput) passInput.value = 'password123';
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit'));
        }
      });
    }

    const fillTrainerLoginBtn = document.getElementById('fillTrainerLoginBtn');
    if (fillTrainerLoginBtn) {
      fillTrainerLoginBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = 'trainer@pulsefit.com';
        if (passInput) passInput.value = 'password123';
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit'));
        }
      });
    }

    // Role Switcher Logic
    let selectedRole = 'member';
    const roleBtnMember = document.getElementById('roleBtnMember');
    const roleBtnTrainer = document.getElementById('roleBtnTrainer');
    const memberRegFields = document.getElementById('memberRegFields');
    const trainerRegFields = document.getElementById('trainerRegFields');

    const updateRoleUI = (role) => {
      selectedRole = role;
      if (role === 'member') {
        if (roleBtnMember) roleBtnMember.classList.add('active');
        if (roleBtnTrainer) roleBtnTrainer.classList.remove('active');
        if (memberRegFields) memberRegFields.style.display = 'block';
        if (trainerRegFields) trainerRegFields.style.display = 'none';
      } else {
        if (roleBtnTrainer) roleBtnTrainer.classList.add('active');
        if (roleBtnMember) roleBtnMember.classList.remove('active');
        if (trainerRegFields) trainerRegFields.style.display = 'block';
        if (memberRegFields) memberRegFields.style.display = 'none';
      }
    };

    if (roleBtnMember) roleBtnMember.addEventListener('click', () => updateRoleUI('member'));
    if (roleBtnTrainer) roleBtnTrainer.addEventListener('click', () => updateRoleUI('trainer'));

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
          const res = await API.post('/api/auth/login', { email, password });
          if (res.success) {
            API.setToken(res.token);
            API.setUser(res.user);
            showToast(res.message || 'Login successful!', 'success');
            document.getElementById('authModal').classList.remove('active');
            this.updateUserUI(res.user);
            if (window.App && window.App.refreshData) {
              window.App.refreshData();
            }
          }
        } catch (err) {
          showToast(err.message || 'Login failed', 'error');
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const weightKg = document.getElementById('regWeight') ? document.getElementById('regWeight').value : '';
        const heightCm = document.getElementById('regHeight') ? document.getElementById('regHeight').value : '';
        const fitnessGoal = document.getElementById('regGoal') ? document.getElementById('regGoal').value : '';
        
        const specialization = document.getElementById('regSpecialization') ? document.getElementById('regSpecialization').value : '';
        const experienceYears = document.getElementById('regExperience') ? document.getElementById('regExperience').value : '';
        const bio = document.getElementById('regBio') ? document.getElementById('regBio').value : '';

        try {
          const res = await API.post('/api/auth/register', {
            name, email, password, weightKg, heightCm, fitnessGoal,
            role: selectedRole, specialization, experienceYears, bio
          });
          if (res.success) {
            API.setToken(res.token);
            API.setUser(res.user);
            showToast(res.message || 'Registration successful!', 'success');
            document.getElementById('authModal').classList.remove('active');
            this.updateUserUI(res.user);
            if (window.App && window.App.refreshData) {
              window.App.refreshData();
            }
          }
        } catch (err) {
          showToast(err.message || 'Registration failed', 'error');
        }
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  },

  async checkSession() {
    const token = API.getToken();
    if (!token) {
      this.updateUserUI(null);
      return;
    }

    try {
      const res = await API.get('/api/auth/me');
      if (res.success && res.user) {
        API.setUser(res.user);
        this.updateUserUI(res.user);
      }
    } catch (e) {
      // Session expired or offline fallback
      const cachedUser = API.getUser();
      if (cachedUser) {
        this.updateUserUI(cachedUser);
      }
    }
  },

  updateUserUI(user) {
    const userQuickName = document.getElementById('sidebarUserName');
    const userQuickAvatar = document.getElementById('sidebarUserAvatar');
    const headerAuthBtn = document.getElementById('headerAuthBtn');
    const welcomeUserName = document.getElementById('dashWelcomeName');
    const streakHeaderEl = document.getElementById('dashStreakHeader');

    const streakDays = user ? (user.streakDays || 3) : 3;
    if (streakHeaderEl) streakHeaderEl.textContent = `${streakDays} Day Streak`;

    if (user) {
      if (userQuickName) userQuickName.textContent = user.name || 'Member';
      if (userQuickAvatar) userQuickAvatar.textContent = user.avatar || '⚡';
      if (welcomeUserName) welcomeUserName.textContent = user.name || 'Member';
      
      const dashTrainerName = document.getElementById('dashTrainerName');
      if (dashTrainerName) dashTrainerName.textContent = user.name || 'Coach';

      if (headerAuthBtn) {
        if (user.role === 'trainer') {
          headerAuthBtn.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--primary)"></i> Coach';
        } else {
          headerAuthBtn.textContent = 'Account';
        }
        headerAuthBtn.onclick = () => window.App.navigateTo('profile');
      }
    } else {
      if (userQuickName) userQuickName.textContent = 'Guest User';
      if (userQuickAvatar) userQuickAvatar.textContent = '👤';
      if (welcomeUserName) welcomeUserName.textContent = 'Fitness Enthusiast';
      if (headerAuthBtn) {
        headerAuthBtn.textContent = 'Login / Register';
        headerAuthBtn.onclick = () => document.getElementById('authModal').classList.add('active');
      }
    }
  },

  logout() {
    API.setToken(null);
    API.setUser(null);
    showToast('Logged out successfully', 'info');
    this.updateUserUI(null);
    window.App.navigateTo('dashboard');
  }
};

window.Auth = Auth;
