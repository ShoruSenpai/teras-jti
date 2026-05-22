import Sidebar from '../components/Sidebar';
import { adminAuthStore } from '../stores/adminAuth.js';
import { ApiService } from '../services/api';
import { router } from '../router';

export default function SettingsView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';
  
  const render = () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-y-auto p-8 relative">
        <header class="mb-8 max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-text-title mb-1">User Settings</h1>
          <p class="text-text-body">Manage your profile and security preferences.</p>
        </header>

        <div class="max-w-4xl mx-auto space-y-6">
          <!-- Profile Settings Card -->
          <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden">
            <div class="p-6 border-b border-border-base bg-surface">
              <h2 class="text-lg font-bold text-text-title">Profile Information</h2>
              <p class="text-sm text-text-body">Update your account's profile information and email address.</p>
            </div>
            <div class="p-6 bg-surface">
              <form id="profile-form" class="space-y-4 max-w-xl">
                <div>
                  <label class="block text-sm font-semibold text-text-title mb-2">Full Name</label>
                  <input type="text" id="profile-name" value="${adminAuthStore.user?.name || ''}" class="w-full px-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-title mb-2">Email Address</label>
                  <input type="email" id="profile-email" value="${adminAuthStore.user?.email || ''}" class="w-full px-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
                </div>
                <div class="pt-2 flex items-center gap-4">
                  <button type="submit" id="btn-save-profile" class="px-6 py-2.5 bg-brand-500 text-white font-semibold rounded-lg shadow-button hover:bg-brand-600 transition flex items-center justify-center min-w-[120px]">
                    Save Changes
                  </button>
                  <span id="profile-msg" class="text-sm font-medium opacity-0 transition-opacity"></span>
                </div>
              </form>
            </div>
          </div>

          <!-- Password Settings Card -->
          <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden">
            <div class="p-6 border-b border-border-base bg-surface">
              <h2 class="text-lg font-bold text-text-title">Update Password</h2>
              <p class="text-sm text-text-body">Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <div class="p-6 bg-surface">
              <form id="password-form" class="space-y-4 max-w-xl">
                <div>
                  <label class="block text-sm font-semibold text-text-title mb-2">Current Password</label>
                  <input type="password" id="current-password" class="w-full px-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-title mb-2">New Password</label>
                  <input type="password" id="new-password" class="w-full px-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-title mb-2">Confirm Password</label>
                  <input type="password" id="confirm-password" class="w-full px-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
                </div>
                <div class="pt-2 flex items-center gap-4">
                  <button type="submit" id="btn-save-password" class="px-6 py-2.5 bg-text-title text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition flex items-center justify-center min-w-[120px]">
                    Update Password
                  </button>
                  <span id="password-msg" class="text-sm font-medium opacity-0 transition-opacity"></span>
                </div>
              </form>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-status-danger-bg/30 rounded-2xl shadow-card border border-status-danger-text/20 overflow-hidden">
            <div class="p-6 border-b border-status-danger-text/20 bg-transparent">
              <h2 class="text-lg font-bold text-status-danger-text">Danger Zone</h2>
            </div>
            <div class="p-6 bg-transparent flex items-center justify-between">
              <div>
                <h3 class="font-bold text-text-title mb-1">Log out of your account</h3>
                <p class="text-sm text-text-body">You will be securely logged out of the dashboard.</p>
              </div>
              <button id="btn-logout" class="px-6 py-2.5 border-2 border-status-danger-text text-status-danger-text font-semibold rounded-lg hover:bg-status-danger-text hover:text-white transition flex items-center">
                <i class="fas fa-sign-out-alt mr-2"></i> Logout Now
              </button>
            </div>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachEvents();
  };

  const attachEvents = () => {
    // Profile Update
    const profileForm = container.querySelector('#profile-form');
    const btnSaveProfile = container.querySelector('#btn-save-profile');
    const profileMsg = container.querySelector('#profile-msg');

    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      btnSaveProfile.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btnSaveProfile.disabled = true;

      const newName = container.querySelector('#profile-name').value;
      const newEmail = container.querySelector('#profile-email').value;

      try {
        const updatedUser = await ApiService.updateProfile({ ...adminAuthStore.user, name: newName, email: newEmail });
        adminAuthStore.loginSuccess(adminAuthStore.token, updatedUser); // Update stored user
        
        profileMsg.textContent = 'Saved.';
        profileMsg.className = 'text-sm font-medium text-status-success-text opacity-100 transition-opacity';
        setTimeout(() => profileMsg.classList.replace('opacity-100', 'opacity-0'), 3000);
      } catch (error) {
        profileMsg.textContent = 'Failed to save.';
        profileMsg.className = 'text-sm font-medium text-status-danger-text opacity-100 transition-opacity';
      } finally {
        btnSaveProfile.innerHTML = 'Save Changes';
        btnSaveProfile.disabled = false;
      }
    });

    // Password Update
    const passwordForm = container.querySelector('#password-form');
    const btnSavePassword = container.querySelector('#btn-save-password');
    const passwordMsg = container.querySelector('#password-msg');

    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const current = container.querySelector('#current-password').value;
      const newPass = container.querySelector('#new-password').value;
      const confirmPass = container.querySelector('#confirm-password').value;

      if (newPass !== confirmPass) {
        passwordMsg.textContent = 'New passwords do not match.';
        passwordMsg.className = 'text-sm font-medium text-status-danger-text opacity-100 transition-opacity';
        return;
      }

      btnSavePassword.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btnSavePassword.disabled = true;

      try {
        await ApiService.changePassword(current, newPass);
        passwordMsg.textContent = 'Password updated.';
        passwordMsg.className = 'text-sm font-medium text-status-success-text opacity-100 transition-opacity';
        passwordForm.reset();
        setTimeout(() => passwordMsg.classList.replace('opacity-100', 'opacity-0'), 3000);
      } catch (error) {
        passwordMsg.textContent = error.message;
        passwordMsg.className = 'text-sm font-medium text-status-danger-text opacity-100 transition-opacity';
      } finally {
        btnSavePassword.innerHTML = 'Update Password';
        btnSavePassword.disabled = false;
      }
    });

    // Logout
    container.querySelector('#btn-logout').addEventListener('click', () => {
      if(confirm('Are you sure you want to log out?')) {
        adminAuthStore.logout();
        router.navigate('/login');
      }
    });
  };

  render();
  return container;
}
