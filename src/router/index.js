import { adminAuthStore } from '../stores/adminAuth.js';

const routes = {};

export const router = {
  addRoute: (path, component) => {
    routes[path] = component;
  },

  navigate: (path) => {
    window.location.hash = path;
  },

  init: (rootElementId) => {
    const root = document.getElementById(rootElementId);

    // Initialize auth from persisted cookie/localStorage on app start
    adminAuthStore.initializeAuth();

    const handleRoute = () => {
      const path = window.location.hash.slice(1) || '/';
      let targetPath = path === '/' ? '/reports' : path;

      // ─── Guard 1: Authentication ───────────────────────────────────────
      // Check both token AND user object must exist
      const isAuthenticated = !!(adminAuthStore.token && adminAuthStore.user);

      if (targetPath !== '/login' && !isAuthenticated) {
        window.location.hash = '#/login';
        return;
      }

      if (targetPath === '/login' && isAuthenticated) {
        // Already logged in — redirect to appropriate landing
        const role = adminAuthStore.user.role;
        window.location.hash = '#' + (role === 'kasir' ? '/cashier' : '/reports');
        return;
      }

      if (path === '/') {
        const role = adminAuthStore.user?.role;
        window.location.hash = '#' + (role === 'kasir' ? '/cashier' : '/reports');
        return;
      }

      // ─── Guard 2: Authorization (Role) ─────────────────────────────────
      if (isAuthenticated) {
        const role = adminAuthStore.user.role;

        if (role === 'kasir') {
          // Kasir: only cashier + settings
          if (targetPath !== '/cashier' && targetPath !== '/settings') {
            window.location.hash = '#/cashier';
            return;
          }
        } else if (role === 'admin') {
          // Admin: everything except /accounts
          if (targetPath === '/accounts') {
            window.location.hash = '#/reports';
            return;
          }
        }
        // owner: unrestricted
      }

      // ─── Render Component ──────────────────────────────────────────────
      const component = routes[path] || routes['/404'];

      if (component) {
        root.innerHTML = '';
        root.appendChild(component());
      } else {
        root.innerHTML = '<div class="flex items-center justify-center h-screen w-full text-2xl font-bold text-text-title">404 — Page Not Found</div>';
      }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }
};
