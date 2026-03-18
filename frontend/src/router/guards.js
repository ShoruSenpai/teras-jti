import { isMobile } from "@/utils/deviceDetect";

export function setupGuard(router) {
  router.beforeEach((to, from, next) => {
    const mobile = isMobile();

    const isDesktopRoute = to.path.startsWith("/desktop");
    const isMobileRoute = !isDesktopRoute;

    if (mobile && isMobileRoute) return next();
    if (!mobile && isDesktopRoute) return next();

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

    next();
  });
}
