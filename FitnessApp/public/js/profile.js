/* Profile Page Controller Script */

const Profile = {
  selectedAvatar: '⚡',

  _bound: false,

  init() {
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
    this.loadUserData();
  },

  bindEvents() {
    const form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.updateProfile();
      });
    }

    const avatarGrid = document.getElementById('profileAvatarGrid');
    if (avatarGrid) {
      avatarGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('avatar-option')) {
          document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
          e.target.classList.add('selected');
          this.selectedAvatar = e.target.textContent;
        }
      });
    }
  },

  loadUserData() {
    const user = API.getUser();
    if (!user) return;

    if (user.name) document.getElementById('profNameInput').value = user.name;
    if (user.email) document.getElementById('profEmailInput').value = user.email;
    if (user.age) document.getElementById('profAgeInput').value = user.age;
    if (user.gender) document.getElementById('profGenderInput').value = user.gender;
    if (user.heightCm) document.getElementById('profHeightInput').value = user.heightCm;
    if (user.weightKg) document.getElementById('profWeightInput').value = user.weightKg;
    if (user.targetWeightKg) document.getElementById('profTargetWeightInput').value = user.targetWeightKg;
    if (user.dailyCalorieGoal) document.getElementById('profCalorieGoalInput').value = user.dailyCalorieGoal;
    if (user.fitnessGoal) document.getElementById('profFitnessGoalInput').value = user.fitnessGoal;

    if (user.role === 'trainer') {
      const trainerFields = document.getElementById('trainerProfileFields');
      if (trainerFields) trainerFields.style.display = 'block';
      if (user.specialization) document.getElementById('profSpecializationInput').value = user.specialization;
      if (user.experienceYears) document.getElementById('profExperienceInput').value = user.experienceYears;
      if (user.certifications) document.getElementById('profCertificationsInput').value = user.certifications;
      if (user.bio) document.getElementById('profBioInput').value = user.bio;
    } else {
      const trainerFields = document.getElementById('trainerProfileFields');
      if (trainerFields) trainerFields.style.display = 'none';
    }

    if (user.avatar) {
      this.selectedAvatar = user.avatar;
      document.querySelectorAll('.avatar-option').forEach(a => {
        if (a.textContent === user.avatar) a.classList.add('selected');
        else a.classList.remove('selected');
      });
    }
  },

  async updateProfile() {
    const user = API.getUser();
    if (!user) {
      showToast('Please login to update your profile.', 'error');
      document.getElementById('authModal').classList.add('active');
      return;
    }

    const name = document.getElementById('profNameInput').value;
    const age = document.getElementById('profAgeInput').value;
    const gender = document.getElementById('profGenderInput').value;
    const heightCm = document.getElementById('profHeightInput').value;
    const weightKg = document.getElementById('profWeightInput').value;
    const targetWeightKg = document.getElementById('profTargetWeightInput').value;
    const dailyCalorieGoal = document.getElementById('profCalorieGoalInput').value;
    const fitnessGoal = document.getElementById('profFitnessGoalInput').value;
    
    let specialization, experienceYears, certifications, bio;
    if (user.role === 'trainer') {
      specialization = document.getElementById('profSpecializationInput').value;
      experienceYears = document.getElementById('profExperienceInput').value;
      certifications = document.getElementById('profCertificationsInput').value;
      bio = document.getElementById('profBioInput').value;
    }

    try {
      const res = await API.put('/api/user/profile', {
        name, age, gender, heightCm, weightKg, targetWeightKg,
        dailyCalorieGoal, fitnessGoal, avatar: this.selectedAvatar,
        specialization, experienceYears, certifications, bio
      });

      if (res.success && res.user) {
        API.setUser(res.user);
        showToast('Profile updated successfully! 🎉', 'success');
        if (window.Auth) window.Auth.updateUserUI(res.user);
        if (window.Dashboard) window.Dashboard.updateStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  }
};

window.Profile = Profile;
