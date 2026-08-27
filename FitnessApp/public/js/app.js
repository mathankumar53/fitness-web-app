/* Main Application Router & Controller */

window.App = {
  currentView: 'dashboard',

  init() {
    this.bindNavigation();
    this.bindMobileDrawer();
    
    // Initialize Sub-Modules
    if (typeof Auth !== 'undefined') Auth.init();
    if (typeof Dashboard !== 'undefined') Dashboard.init();
    if (typeof BMICalculator !== 'undefined') BMICalculator.init();
    if (typeof Workouts !== 'undefined') Workouts.init();
    if (typeof Diet !== 'undefined') Diet.init();
    if (typeof ProgressTracker !== 'undefined') ProgressTracker.init();
    if (typeof Profile !== 'undefined') Profile.init();

    // Check hash URL if any
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'bmi', 'workouts', 'diet', 'progress', 'profile'].includes(hash)) {
      this.navigateTo(hash);
    }
  },

  bindNavigation() {
    document.querySelectorAll('[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Handle Auth Modal Overlay Close
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authModalClose');
    if (authClose && authModal) {
      authClose.addEventListener('click', () => {
        authModal.classList.remove('active');
      });
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          authModal.classList.remove('active');
        }
      });
    }

    // Handle Workout Detail Modal Overlay Close
    const workoutModal = document.getElementById('workoutDetailModal');
    const workoutClose = document.getElementById('workoutModalClose');
    if (workoutClose && workoutModal) {
      workoutModal.addEventListener('click', (e) => {
        if (e.target === workoutModal && window.Workouts) {
          window.Workouts.closeWorkoutModal();
        }
      });
    }

    // Close Modals on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (authModal && authModal.classList.contains('active')) {
          authModal.classList.remove('active');
        }
        if (workoutModal && workoutModal.classList.contains('active') && window.Workouts) {
          window.Workouts.closeWorkoutModal();
        }
      }
    });
  },

  bindMobileDrawer() {
    const menuToggle = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });

      // Close mobile drawer when clicking a link
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
        });
      });
    }
  },

  navigateTo(viewId) {
    this.currentView = viewId;
    window.location.hash = viewId;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Handle Role-based sidebar items visibility
    const user = typeof API !== 'undefined' ? API.getUser() : null;
    const isTrainer = user && user.role === 'trainer';

    document.querySelectorAll('.member-only-nav').forEach(el => {
      el.style.display = isTrainer ? 'none' : 'block';
    });
    document.querySelectorAll('.trainer-only-nav').forEach(el => {
      el.style.display = isTrainer ? 'block' : 'none';
    });
    
    // Default fallback view based on role if trying to access unauthorized view
    if (isTrainer && ['dashboard', 'bmi', 'workouts', 'diet', 'progress'].includes(viewId)) {
      // If trainer tries to access member dash and they just logged in, redirect to trainer hub
      if (viewId === 'dashboard' && this.currentView !== 'trainer-hub') {
        this.currentView = 'trainer-hub';
        window.location.hash = 'trainer-hub';
        viewId = 'trainer-hub';
      }
    } else if (!isTrainer && ['trainer-hub'].includes(viewId)) {
      this.currentView = 'dashboard';
      window.location.hash = 'dashboard';
      viewId = 'dashboard';
    }

    // Update active nav link again if we changed views
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Setup dashboard views for members vs trainers
    const memberDashboardElements = document.querySelector('#view-dashboard > .grid-4');
    const memberDashboardWater = document.querySelector('#view-dashboard > .grid-2');
    const memberDashboardBanner = document.querySelector('#view-dashboard > .welcome-banner');
    const trainerDashboardElements = document.getElementById('trainerDashboardElements');

    if (viewId === 'dashboard' && isTrainer) {
      if (memberDashboardElements) memberDashboardElements.style.display = 'none';
      if (memberDashboardWater) memberDashboardWater.style.display = 'none';
      if (memberDashboardBanner) memberDashboardBanner.style.display = 'none';
      if (trainerDashboardElements) trainerDashboardElements.style.display = 'block';
    } else if (viewId === 'dashboard') {
      if (memberDashboardElements) memberDashboardElements.style.display = 'grid';
      if (memberDashboardWater) memberDashboardWater.style.display = 'grid';
      if (memberDashboardBanner) memberDashboardBanner.style.display = 'block';
      if (trainerDashboardElements) trainerDashboardElements.style.display = 'none';
    }

    // Update visible view section
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${viewId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Page Header Title
    const titles = {
      dashboard: isTrainer ? 'Trainer Command Center' : 'Home Dashboard',
      bmi: 'BMI Calculator',
      workouts: 'Workout Plans & Exercises',
      diet: 'Diet & Nutrition Calculator',
      progress: 'Progress Tracker',
      profile: isTrainer ? 'Trainer Profile & Settings' : 'User Profile & Settings',
      'trainer-hub': 'Trainees Roster & Management',
      planner: 'Custom Workout Planner',
      messages: 'Coach Advice'
    };
    const titleEl = document.getElementById('currentPageTitle');
    if (titleEl) titleEl.textContent = titles[viewId] || 'Fitness App';

    // Trigger module lifecycle refresh if needed
    if (viewId === 'dashboard' && typeof Dashboard !== 'undefined') Dashboard.updateStats();
    if (viewId === 'bmi' && typeof BMICalculator !== 'undefined') BMICalculator.init();
    if (viewId === 'diet' && typeof Diet !== 'undefined') Diet.init();
    if (viewId === 'progress' && typeof ProgressTracker !== 'undefined') ProgressTracker.fetchHistory();
    if (viewId === 'profile' && typeof Profile !== 'undefined') Profile.loadUserData();
    if (viewId === 'trainer-hub' && typeof TrainerHub !== 'undefined') TrainerHub.loadTrainees();
    if (viewId === 'planner' && typeof Planner !== 'undefined') Planner.init();
    if (viewId === 'messages' && typeof Messages !== 'undefined') Messages.init();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  refreshData() {
    if (typeof Dashboard !== 'undefined') Dashboard.updateStats();
    if (typeof BMICalculator !== 'undefined') BMICalculator.init();
    if (typeof Diet !== 'undefined') Diet.init();
    if (typeof ProgressTracker !== 'undefined') ProgressTracker.fetchHistory();
    if (typeof Profile !== 'undefined') Profile.loadUserData();
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Dom Ready Event Listener
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
