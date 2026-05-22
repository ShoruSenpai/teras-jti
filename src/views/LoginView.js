import { authApi } from '../api/authApi.js';
import { adminAuthStore } from '../stores/adminAuth.js';
import { router } from '../router';

export default function LoginView() {
  const container = document.createElement('div');
  container.className =
    'w-full h-screen flex items-center justify-center bg-main relative overflow-hidden';

  const decor1 = document.createElement('div');
  decor1.className =
    'absolute -top-20 -left-20 w-96 h-96 bg-brand-100 opacity-20 rounded-full blur-3xl';

  const decor2 = document.createElement('div');
  decor2.className =
    'absolute -bottom-20 -right-20 w-96 h-96 bg-brand-100 opacity-20 rounded-full blur-3xl';

  const formCard = document.createElement('div');
  formCard.className =
    'bg-surface p-10 rounded-2xl shadow-modal w-full max-w-md z-10 border border-border-base flex flex-col items-center';

  formCard.innerHTML = `
    <div class="w-16 h-16 bg-brand-500 text-white flex items-center justify-center text-3xl font-bold rounded-xl mb-4 shadow-modal">
      TJ
    </div>
    <h1 class="text-2xl font-bold text-text-title mb-2">Welcome Back</h1>
    <p class="text-text-body mb-8 text-center text-sm">Sign in to Teras JTI Restaurant Management System.</p>
    
    <form id="login-form" class="w-full">
      <div class="mb-5">
        <label class="block text-sm font-semibold text-text-title mb-2">Email Address</label>
        <div class="relative">
          <span class="absolute left-3 top-3 text-text-body"><i class="fas fa-envelope"></i></span>
          <input type="email" id="email" autocomplete="off" class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" placeholder="your admin email..." required>
        </div>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-semibold text-text-title mb-2">Password</label>
        <div class="relative">
          <span class="absolute left-3 top-3 text-text-body"><i class="fas fa-lock"></i></span>
          <input type="password" id="password" class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" placeholder="••••••••" required>
        </div>
      </div>
      
      <div id="error-msg" class="text-brand-500 text-sm mb-4 hidden text-center font-medium"></div>
      
      <button type="submit" id="submit-btn" class="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-lg shadow-button transition duration-200 flex justify-center items-center">
        <span>Sign In</span>
      </button>
    </form>
  `;

  container.appendChild(decor1);
  container.appendChild(decor2);
  container.appendChild(formCard);

  setTimeout(() => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('submit-btn');

    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        passwordInput.focus();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!emailInput.value || !passwordInput.value) return;

      errorMsg.classList.add('hidden');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;

      try {
        await authApi.login(emailInput.value, passwordInput.value);

        const role = adminAuthStore.user?.role;
        const redirectPath = role === 'kasir' ? '/cashier' : '/reports';
        router.navigate(redirectPath);
      } catch (error) {
        let message = 'Invalid email or password.';

        if (error && error.message) {
          message = error.message;
        }

        if (error && error.errors) {
          const firstError = Object.values(error.errors)[0];
          message = Array.isArray(firstError) ? firstError[0] : firstError;
        }

        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
        submitBtn.innerHTML = '<span>Sign In</span>';
        submitBtn.disabled = false;
      }
    });
  }, 0);

  return container;
}
