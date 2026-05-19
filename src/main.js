import './styles/main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { getCookie } from './utils/cookie.js';

// homepage mobile
import { MobileHomePage } from './views/mobile/home/MobileHomePage.js';

// dine-in
import { InitDinein } from './views/mobile/dinein/InitDineinView.js';
import { MenuView } from './views/mobile/dinein/MenuView.js';
import { CheckoutDineinView } from './views/mobile/dinein/CheckoutDineinView.js';
import { OrderSuccessView } from './views/mobile/dinein/OrderSuccessView.js';

// reservation
import { InitReservation } from './views/mobile/reservation/InitReservationView.js';
import { SelectDateView } from './views/mobile/reservation/SelectDateView.js';
import { PersonalDataView } from './views/mobile/reservation/PersonalDataView.js';
import { PreOrderView } from './views/mobile/reservation/PreorderView.js';
import { CheckoutView } from './views/mobile/reservation/CheckoutView.js';
import { ReservationSuccessView } from './views/mobile/reservation/ReservationSuccessView.js';

const app = document.querySelector('#app');
const urlParams = new URLSearchParams(window.location.search);

const currentView = urlParams.get('view') || 'home';

const currentToken =
  urlParams.get('token') ||
  getCookie('session_dine-in') ||
  getCookie('session_reservation');

const routes = {
  home: {
    component: MobileHomePage,
    title: 'Teras JTI | Home',
  },
  // dine-in
  'init-dinein': {
    component: InitDinein,
    title: 'Teras JTI | Init Session',
  },
  'dinein-menu': {
    component: MenuView,
    title: 'Teras JTI | Menu Dine In',
    requiresToken: true,
  },
  checkout: {
    component: CheckoutDineinView,
    title: 'Teras JTI | Checkout',
    requiresToken: true,
  },
  'dinein-qrcode': {
    component: OrderSuccessView,
    title: 'Teras JTI | QR Order',
    requiresToken: true,
  },
  // reservation
  'init-reservation': {
    component: InitReservation,
    title: 'Teras JTI | Init Session',
  },
  'select-date': {
    component: SelectDateView,
    title: 'Teras JTI | Select Date',
    requiresToken: true,
  },
  'personal-data': {
    component: PersonalDataView,
    title: 'Teras JTI | Personal Data',
    requiresToken: true,
  },
  'preorder-menu': {
    component: PreOrderView,
    title: 'Teras JTI | Preorder Menu',
    requiresToken: true,
  },
  'reservation-checkout': {
    component: CheckoutView,
    title: 'Teras JTI | Checkout',
    requiresToken: true,
  },
  'reservation-success': {
    component: ReservationSuccessView,
    title: 'Teras JTI | Payment Success',
    requiresToken: true,
  },
};

function renderPage() {
  const route = routes[currentView];

  if (!route) {
    app.innerHTML = `<h1 class="text-center p-10 font-bold text-red-500">404 - Halaman Tidak Ditemukan</h1>`;
    document.title = '404 Not Found';
    return;
  }

  if (route.requiresToken && !currentToken) {
    window.location.href = '?view=home&session=expired';
    return;
  }

  document.title = route.title || 'Teras JTI';

  window.scrollTo({ top: 0, behavior: 'instant' });

  app.innerHTML = route.component();
}

renderPage();
