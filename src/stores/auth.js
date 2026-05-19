import { getCookie, removeCookie } from '../utils/cookie.js';

export const authStore = {
  token: null,
  sessionType: null,

  initializeAuth(type) {
    this.sessionType = type;
    const cookieName = `session_${type}`;
    this.token = getCookie(cookieName);

    const otherType = type === 'dine-in' ? 'reservation' : 'dine-in';
    removeCookie(`session_${otherType}`);
  },

  setToken(newToken, type) {
    this.token = newToken;
    this.sessionType = type;
  },

  logout() {
    if (this.sessionType) {
      removeCookie(`session_${this.sessionType}`);
    }
    this.token = null;
    this.sessionType = null;
  },
};
