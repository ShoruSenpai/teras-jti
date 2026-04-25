import { isMobile } from "@/utils/deviceDetect";
import { getCookie } from "@/utils/cookie";

const MASTER_TOKENS = ["MASTER-DEV-DN", "MASTER-DEV-RST"];

export function setupGuard(router) {
  router.beforeEach((to, from, next) => {
    const mobile = isMobile();
    const isDesktopRoute = to.path.startsWith("/desktop");
    const isMobileRoute = !isDesktopRoute;

    // if (mobile && isMobileRoute) return next();
    // if (!mobile && isDesktopRoute) return next();

    if (mobile && isDesktopRoute) {
      return next({
        path: "/",
        replace: true,
      });
    }

    if (!mobile && isMobileRoute) {
      return next({
        path: "/desktop",
        replace: true,
      });
    }

    if (to.meta.requiresToken) {
      const urlToken = to.params.token;
      const isReservation = to.path.includes("reservation");
      const cookieName = isReservation ? "session_reservation" : "session_dine-in";
      const cookieToken = getCookie(cookieName);

      // console.log("GUARD CHECK - URL:", urlToken, "Cookie:", cookieToken);

      if (MASTER_TOKENS.includes(urlToken)) return next();

      if (!urlToken || urlToken !== cookieToken) {
        console.warn("Akses ditolak: Token tidak valid atau tidak cocok.");

        // const redirectPath = to.path.includes("reservation") ? "/reservation" : "/dine-in";

        return next({
          path: "/",
          query: {
            session: "expired",
          },
          replace: true,
        });
      }
    }

    next();
  });
}
