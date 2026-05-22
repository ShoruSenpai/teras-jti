import { getCookie, setCookie, removeCookie } from '../utils/cookie.js';

export const adminAuthStore = {
  token: null,
  user: null, // Menyimpan objek user { id, name, email, role }

  initializeAuth() {
    this.token = getCookie('session_admin');
    const userData = localStorage.getItem('admin_user_data');

    if (this.token && userData) {
      this.user = JSON.parse(userData);
    } else {
      this.logout();
    }
  },

  loginSuccess(token, userData) {
    this.token = token;
    this.user = userData;

    setCookie('session_admin', token, 1);

    localStorage.setItem('admin_user_data', JSON.stringify(userData));
  },

  logout() {
    this.token = null;
    this.user = null;
    removeCookie('session_admin');
    localStorage.removeItem('admin_user_data');
  },

  hasRole(allowedRoles) {
    if (!this.user) return false;
    return allowedRoles.includes(this.user.role);
  },
};
