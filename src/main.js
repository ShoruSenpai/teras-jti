import './style.css';
import { router } from './router';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import Views
import LoginView from './views/LoginView.js';
import ReportsView from './views/ReportsView.js';
import CashierView from './views/CashierView.js';
import DineInView from './views/DineInView.js';
import ReservationView from './views/ReservationView.js';
import MenuView from './views/MenuView.js';
import SettingsView from './views/SettingsView.js';
import AccountsView from './views/AccountsView.js';
import BannerView from './views/BannerView.js';

// Setup Routes
// login
router.addRoute('/login', LoginView);

// main page
router.addRoute('/reports', ReportsView);
router.addRoute('/dinein', DineInView);
router.addRoute('/reservation', ReservationView);
router.addRoute('/menu', MenuView);
router.addRoute('/banner', BannerView);
router.addRoute('/cashier', CashierView);
router.addRoute('/accounts', AccountsView);

// settings page
router.addRoute('/settings', SettingsView);

// Initialize Router and mount to #app
document.addEventListener('DOMContentLoaded', () => {
  router.init('app');
});
