import { createRouter, createWebHistory } from "vue-router";

import DesktopLayout from "@/layouts/DesktopLayout.vue";
import MobileLayout from "@/layouts/MobileLayout.vue";
import { setupGuard } from "./guards";

const routes = [
  {
    path: "/",
    component: MobileLayout,
    children: [
      {
        name: "home",
        path: "",
        component: () => import("@/views/mobile/home/MobileHomePage.vue"),
        meta: {
          title: "Teras JTI | Home",
        },
      },
      {
        name: "dinein-init",
        path: "dine-in",
        component: () => import("@/views/mobile/dinein/InitDinein.vue"),
        meta: {
          title: "Teras JTI | Init Session",
        },
      },
      {
        name: "dinein-menu",
        path: "dine-in/menu",
        component: () => import("@/views/mobile/dinein/MenuView.vue"),
        meta: {
          title: "Teras JTI | Menu Dine In",
        },
      },
      {
        name: "reservation-init",
        path: "reservation",
        component: () => import("@/views/mobile/reservation/InitReservation.vue"),
        meta: {
          title: "Teras JTI | Init Session",
        },
      },
      {
        name: "reservation-date",
        path: "reservation/:token/select-date",
        component: () => import("@/views/mobile/reservation/SelectDateView.vue"),
        meta: {
          title: "Teras JTI | Select Date Reservation",
        },
      },
    ],
  },

  {
    path: "/desktop",
    component: DesktopLayout,
    children: [
      {
        name: "desktop home",
        path: "",
        component: () => import("@/views/desktop/DesktopHomePage.vue"),
        meta: {
          title: "Teras JTI | Profile",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.meta.fullscreen) {
      return { top: 0 };
    }

    return {
      top: 0,
      behavior: "instant",
    };
  },
});

setupGuard(router);

router.afterEach((to) => {
  document.title = to.meta.title || "Teras JTI";
});

export default router;
