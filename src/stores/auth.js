import { defineStore } from "pinia";
import { getCookie, removeCookie } from "@/utils/cookie";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    sessionType: null,
  }),
  actions: {
    initializeAuth(type) {
      this.sessionType = type;
      const cookieName = `session_${type}`;
      this.token = getCookie(cookieName);

      const otherType = type === "dine-in" ? "reservation" : "dine-in";
      removeCookie(`session_${otherType}`);
    },
    setToken(newToken, type) {
      this.token = newToken;
      this.sessionType = type;
    },
    logout() {
      removeCookie(`session_${this.sessionType}`);
      this.token = null;
      this.sessionType = null;
    },
  },
});
