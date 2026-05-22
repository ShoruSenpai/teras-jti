import { adminAuthStore } from '../stores/adminAuth.js';
import { router } from '../router';

export default function Sidebar() {
  const container = document.createElement('aside');
  container.className = 'w-64 bg-sidebar border-r border-border-base h-screen flex flex-col sticky top-0';

  // Render function to update active states
  const render = () => {
    const currentPath = window.location.hash.slice(1) || '/reports';
    
    const role = adminAuthStore.user?.role || 'kasir';
    const isOwner = role === 'owner';
    const isAdminOrOwner = role === 'admin' || role === 'owner';

    let navItemsHtml = '';
    
    if (isAdminOrOwner) {
      navItemsHtml += `
        <li>
          <a href="#/reports" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/reports' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="fas fa-chart-pie w-6 text-center mr-2"></i>
            Reports
          </a>
        </li>
        <li>
          <a href="#/dinein" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/dinein' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="fas fa-utensils w-6 text-center mr-2"></i>
            Dine In
          </a>
        </li>
        <li>
          <a href="#/reservation" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/reservation' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="far fa-calendar-check w-6 text-center mr-2"></i>
            Reservation
          </a>
        </li>
        <li>
          <a href="#/menu" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/menu' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="fas fa-book-open w-6 text-center mr-2"></i>
            Menu
          </a>
        </li>
        <li>
          <a href="#/banner" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/banner' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="far fa-images w-6 text-center mr-2"></i>
            Banner
          </a>
        </li>
      `;
    }
    
    // Everyone gets Cashier
    navItemsHtml += `
      <li>
        <a href="#/cashier" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/cashier' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
          <i class="fas fa-cash-register w-6 text-center mr-2"></i>
          Cashier
        </a>
      </li>
    `;

    // Only Owner gets Accounts
    if (isOwner) {
      navItemsHtml += `
        <li>
          <a href="#/accounts" class="flex items-center px-4 py-3 rounded-xl transition-all ${currentPath === '/accounts' ? 'bg-brand-50 text-brand-500 font-bold shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-title font-medium'}">
            <i class="fas fa-users-cog w-6 text-center mr-2"></i>
            Accounts
          </a>
        </li>
      `;
    }

    container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center font-bold text-xl text-text-title">
          <div class="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center mr-3 shadow-button">
            TJ
          </div>
          <div>
            <h1 class="text-brand-500 leading-none">Teras JTI</h1>
            <p class="text-[10px] text-text-body font-medium mt-1">Restaurant Management</p>
          </div>
        </div>
      </div>
      
      <nav class="flex-1 px-4 py-2 overflow-y-auto space-y-2">
        <ul class="space-y-1">
          ${navItemsHtml}
        </ul>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-border-base space-y-4">
        <button id="logout-btn" class="flex items-center text-text-body hover:text-brand-500 transition-colors w-full px-4 py-2 font-medium">
          <i class="fas fa-sign-out-alt w-6 text-center mr-2"></i>
          Logout
        </button>
        
        <a href="#/settings" class="flex items-center px-4 hover:bg-gray-50 p-2 rounded-lg transition group">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(adminAuthStore.user?.name || 'User')}&background=d14d33&color=fff" alt="User Avatar" class="w-10 h-10 rounded-full mr-3 shadow-sm border border-border-base group-hover:border-brand-500 transition">
          <div class="overflow-hidden">
            <p class="text-sm font-bold text-text-title truncate group-hover:text-brand-500 transition">${adminAuthStore.user?.name || 'Admin User'}</p>
            <p class="text-xs text-text-body truncate">${adminAuthStore.user?.email || ''}</p>
          </div>
        </a>
      </div>
    `;

    // Attach event listener for logout
    setTimeout(() => {
      const logoutBtn = container.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          adminAuthStore.logout();
          router.navigate('/login');
        });
      }
    }, 0);
  };

  // Listen to hash change to re-render active states
  window.addEventListener('hashchange', render);
  
  // Initial render
  render();

  return container;
}
