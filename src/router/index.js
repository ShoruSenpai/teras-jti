import { createRouter, createWebHistory } from "vue-router";

import { setupGuard } from "./guards";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/MobileLayout.vue"),
    children: [
      // home
      {
        name: "home",
        path: "",
        component: () => import("@/views/mobile/home/MobileHomePage.vue"),
        meta: {
          title: "Teras JTI | Home",
        },
      },
      // dinein
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
        path: "dine-in/:token/menu",
        component: () => import("@/views/mobile/dinein/MenuView.vue"),
        meta: {
          title: "Teras JTI | Menu Dine In",
          requiresToken: true,
        },
      },
      {
        name: "dinein-checkout",
        path: "dine-in/:token/menu/checkout",
        component: () => import("@/views/mobile/dinein/CheckoutDineinView.vue"),
        meta: {
          title: "Teras JTI | Checkout",
          requiresToken: true,
        },
      },
      {
        name: "dinein-qrcode",
        path: "dine-in/:token/menu/checkout/qrcode",
        component: () => import("@/views/mobile/dinein/OrderSuccessView.vue"),
        meta: {
          title: "Teras jTI | QR Code",
          requiresToken: true,
        },
      },
      // reservation
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
          stepName: ["Booking Tempat"],
          requiresToken: false,
        },
      },
    ],
  },

  {
    path: "/desktop",
    component: () => import("@/layouts/DesktopLayout.vue"),
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
