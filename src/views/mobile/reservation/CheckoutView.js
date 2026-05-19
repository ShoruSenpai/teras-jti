import Swal from 'sweetalert2';
import {
  getPreorderCart,
  getReservationSummary,
  updatePreorderMenuQty,
  processReservationCheckout,
} from '../../../api/reservationApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';

export function CheckoutView() {
  // --- STATE MANAGEMENT ---
  const state = {
    preOrderItems: [],
    orderSummary: {
      areaPrice: 0,
      menuSubtotal: 0,
      total: 0,
      payNow: 0,
      minDp: 0,
    },
    isLoading: true,
    isProcessingPayment: false,
    timerLeft: null,
    PPNtax: 1000,
    stepNames: ['Booking Tempat', 'Data Diri', 'Pre-Order', 'Checkout'],
    currentStepIndex: 3, // Index 3 = Checkout
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) return '0';
    return new Intl.NumberFormat('id-ID').format(price);
  };

  // --- SUNTIK SCRIPT MIDTRANS ---
  const injectMidtrans = () => {
    if (!document.getElementById('midtrans-script')) {
      const script = document.createElement('script');
      script.id = 'midtrans-script';
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute(
        'data-client-key',
        import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
      );
      document.head.appendChild(script);
    }
  };

  // --- KOMPONEN HELPER ---
  const renderBreadcrumb = () => {
    return `
      <div class="p-4 w-full flex items-center flex-wrap gap-2 text-sm font-medium text-primary-reservation-bg bg-primary-reservation">
        ${state.stepNames
          .map(
            (step, index) => `
          <div class="flex mt-12 items-center gap-2 text-xs">
            ${index > 0 ? `<span class="opacity-70">/</span>` : ''}
            <span class="${index === state.currentStepIndex ? 'font-semibold opacity-100' : 'opacity-70'}">${step}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  };

  const renderOrderList = () => {
    const container = document.getElementById('order-list-container');
    if (state.preOrderItems.length === 0) {
      container.innerHTML = '';
      return;
    }

    const itemsHtml = state.preOrderItems
      .map(
        (item) => `
      <div class="flex items-center gap-4">
        <img src="${item.image || '/assets/images/teras-menu-template.webp'}" onerror="this.src='/assets/images/teras-menu-template.webp'" class="w-16 h-16 object-cover rounded-xl shrink-0 border border-gray-100" />
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-800 text-sm truncate">${item.name}</h3>
          <p class="font-bold text-accent-reservation text-sm mt-1">Rp${formatPrice(item.price)}</p>
        </div>
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
          <button data-id="${item.id}" data-action="minus" class="btn-update-qty w-8 h-full bg-accent-reservation/20 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors font-bold disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>
            ${item.qty === 1 ? '<i class="fa-solid fa-trash text-[10px] text-red-800"></i>' : '-'}
          </button>
          <div class="w-8 h-full flex items-center justify-center font-bold text-sm bg-white">
            ${state.isLoading ? '<i class="fa-solid fa-spinner animate-spin text-[10px] text-gray-400"></i>' : item.qty}
          </div>
          <button data-id="${item.id}" data-action="plus" class="btn-update-qty w-8 h-full flex items-center justify-center font-bold transition-colors ${item.qty >= item.stock || state.isLoading ? 'bg-accent-reservation/10 text-gray-400 cursor-not-allowed' : 'bg-accent-reservation/20 text-gray-600 hover:bg-gray-100 active:bg-gray-200'}" ${item.qty >= item.stock || state.isLoading ? 'disabled' : ''}>
            +
          </button>
        </div>
      </div>
    `,
      )
      .join('');

    container.innerHTML = `
      <div class="px-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 transition-opacity duration-300 ${state.isLoading ? 'opacity-50 pointer-events-none' : ''}">
          <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">Order List</h2>
          <div class="flex flex-col gap-4">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;

    // Event Listener Update Qty
    document.querySelectorAll('.btn-update-qty').forEach((btn) => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const action = e.currentTarget.getAttribute('data-action');
        handleUpdateQty(id, action);
      };
    });
  };

  const renderOrderSummary = () => {
    const container = document.getElementById('order-summary-container');
    const sum = state.orderSummary;

    container.innerHTML = `
      <div class="px-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">Order Summary</h2>
          <div class="flex flex-col gap-2 text-sm text-gray-600 border-b border-gray-200 pb-4 mb-4">
            
            <div class="flex justify-between items-center">
              <span>Biaya Area Tempat</span>
              <span class="font-semibold text-gray-800 ${state.isLoading ? 'animate-pulse bg-gray-200 text-transparent rounded' : ''}">
                Rp${formatPrice(sum.areaPrice)}
              </span>
            </div>

            ${
              sum.menuSubtotal > 0
                ? `
              <div class="flex justify-between items-center">
                <span>Subtotal Menu</span>
                <span class="font-semibold text-gray-800 ${state.isLoading ? 'animate-pulse bg-gray-200 text-transparent rounded' : ''}">
                  Rp${formatPrice(sum.menuSubtotal)}
                </span>
              </div>
            `
                : ''
            }

            <div class="flex justify-between items-center">
              <span>PPN</span>
              <span class="font-semibold text-gray-800">Rp${formatPrice(state.PPNtax)}</span>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg text-gray-800">Total Pembayaran</span>
            <span class="font-black text-xl text-accent-reservation ${state.isLoading ? 'animate-pulse bg-accent-reservation/20 text-transparent rounded' : ''}">
              Rp${formatPrice((sum.payNow || 0) + state.PPNtax)}
            </span>
          </div>
        </div>
      </div>
    `;
  };

  const renderPaymentInfo = () => {
    return `
      <div class="px-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-28">
          <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">Payment Options</h2>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 bg-accent-reservation/5 p-3 rounded-xl border border-accent-reservation/20">
              <i class="fa-solid fa-qrcode text-accent-reservation text-2xl"></i>
              <div>
                <span class="block text-gray-800 font-bold text-sm">QRIS / E-Wallet / Bank</span>
                <span class="block text-xs text-gray-500">Pembayaran aman via Midtrans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderBottomBar = () => {
    const container = document.getElementById('bottom-bar-container');
    const totalPay = (state.orderSummary.payNow || 0) + state.PPNtax;
    const isDisable = state.isLoading || state.isProcessingPayment;

    container.innerHTML = `
      <div class="fixed bottom-0 left-0 right-0 p-6 border-t border-gray-100  z-50">
        <button id="btn-process-payment" class="w-full text-white py-4 rounded-xl font-bold text-lg shadow-reservation-card flex justify-between px-6 transition-all ${isDisable ? 'bg-accent-reservation/60 cursor-not-allowed' : 'bg-accent-reservation active:scale-95'}" ${isDisable ? 'disabled' : ''}>
          <span>Confirm Order</span>
          <span class="bg-white/20 px-3 py-1 rounded-lg">
            ${isDisable ? '<i class="fa-solid fa-spinner animate-spin"></i>' : `Rp${formatPrice(totalPay)}`}
          </span>
        </button>
      </div>
    `;

    document.getElementById('btn-process-payment').onclick = processPayment;
  };

  const updateAllUI = () => {
    renderOrderList();
    renderOrderSummary();
    renderBottomBar();
  };

  // --- TEMPLATE UTAMA ---
  const template = `
    <div class="bg-primary-reservation-bg min-h-screen w-full font-quicksand relative pb-24 overflow-x-hidden">
      
      <!-- Timer -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      ${renderBreadcrumb()}

      <div class="w-full my-6 mx-auto">
        <h1 class="font-bold text-2xl text-accent-reservation text-center">Checkout</h1>
      </div>

      <!-- Wadah Komponen Dinamis -->
      <div id="order-list-container"></div>
      <div id="order-summary-container"></div>
      ${renderPaymentInfo()}
      <div id="bottom-bar-container"></div>

    </div>
  `;

  // --- LOGIC & ACTIONS ---
  const fetchCheckoutData = async () => {
    state.isLoading = true;
    updateAllUI();

    try {
      const [cartRes, summaryRes] = await Promise.all([
        getPreorderCart(),
        getReservationSummary(),
      ]);

      let extractedCart = [];
      if (Array.isArray(cartRes)) {
        extractedCart = cartRes;
      } else if (cartRes?.data && Array.isArray(cartRes.data)) {
        extractedCart = cartRes.data;
      } else if (cartRes?.data?.data && Array.isArray(cartRes.data.data)) {
        extractedCart = cartRes.data.data;
      } else if (cartRes?.items && Array.isArray(cartRes.items)) {
        extractedCart = cartRes.items;
      }

      state.preOrderItems = extractedCart.map((item) => ({
        id: item.reservation_menu_id || item.cart_item_id || item.id,
        name: item.menu ? item.menu.menu_name : 'Menu Dihapus',
        price: item.menu ? item.menu.menu_price : 0,
        qty: item.qty || 1,
        image: item.menu ? item.menu.menu_image : null,
        stock: item.menu ? item.menu.menu_stock : 99,
      }));

      const resSum = summaryRes;
      const rootData = resSum.data ? resSum.data : resSum;
      const billing = resSum.billing_info || rootData.billing_info || {};

      const areaTotal =
        parseInt(billing.area_total) || parseInt(billing.areaPrice) || 0;

      const grandTotal =
        parseInt(rootData.total) || parseInt(resSum.total_price) || 0;

      const menuTotal = grandTotal - areaTotal;

      state.orderSummary = {
        areaPrice: areaTotal,
        menuSubtotal: menuTotal > 0 ? menuTotal : 0,
        total: grandTotal,
        payNow:
          parseInt(rootData.payNow) || parseInt(rootData.pay_now) || grandTotal,
        minDp: parseInt(rootData.minDp) || parseInt(rootData.min_dp) || 0,
      };
    } catch (err) {
      console.error('Gagal load data checkout', err);
    } finally {
      state.isLoading = false;
      updateAllUI();
    }
  };

  const handleUpdateQty = async (id, action) => {
    state.isLoading = true;
    updateAllUI(); // Trigger efek blur loading
    try {
      await updatePreorderMenuQty(id, action);
      await fetchCheckoutData();
    } catch (error) {
      Swal.fire('Gagal', 'Tidak dapat mengubah pesanan', 'error');
      state.isLoading = false;
      updateAllUI();
    }
  };

  const processPayment = async () => {
    // Cek apakah script Midtrans sudah beres di-load
    if (typeof window.snap === 'undefined') {
      Swal.fire(
        'Sistem Belum Siap',
        'Modul pembayaran sedang dimuat, coba beberapa detik lagi.',
        'warning',
      );
      return;
    }

    state.isProcessingPayment = true;
    updateAllUI();

    Swal.fire({
      title: 'Memproses Pembayaran...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await processReservationCheckout();
      const responseData = res.data ? res.data : res;

      if (res.success || responseData.snap_token) {
        Swal.close();

        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        // Panggil Midtrans Snap
        window.snap.pay(responseData.snap_token, {
          onSuccess: function (result) {
            Swal.fire({
              title: 'Berhasil',
              text: 'Pembayaran Diterima! Menyiapkan tiket...',
              icon: 'success',
              allowOutsideClick: false,
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              window.location.href = '?view=reservation-success';
            });
          },
          onPending: function (result) {
            Swal.fire(
              'Menunggu',
              'Selesaikan pembayaran Anda di aplikasi bank/wallet.',
              'info',
            );
          },
          onError: function (result) {
            Swal.fire('Gagal', 'Pembayaran ditolak/gagal.', 'error');
          },
          onClose: function () {
            Swal.fire(
              'Dibatalkan',
              'Anda menutup popup pembayaran.',
              'warning',
            );
          },
        });
      } else {
        throw new Error(
          responseData.message || 'Gagal mendapatkan token pembayaran',
        );
      }
    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message ||
          err.message ||
          'Sistem pembayaran sedang gangguan.',
        'error',
      );
    } finally {
      state.isProcessingPayment = false;
      updateAllUI();
    }
  };

  let timerInterval;

  const startTimer = (expiredAt) => {
    const timerContainer = document.getElementById('timer-container');
    const timerText = document.getElementById('timer-text');

    if (timerContainer) {
      timerContainer.classList.remove('hidden');
      timerContainer.classList.add('flex');
    }

    const target = new Date(expiredAt).getTime();

    if (timerInterval) clearInterval(timerInterval);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timerInterval);
        if (timerText) timerText.innerText = '00:00';
        window.location.href = '/?session=expired';
        return;
      }

      const msPerSecond = 1000;
      const msPerMinute = msPerSecond * 60;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerMonth = msPerDay * 30;
      const msPerYear = msPerDay * 365;

      const years = Math.floor(distance / msPerYear);
      const months = Math.floor((distance % msPerYear) / msPerMonth);
      const days = Math.floor((distance % msPerMonth) / msPerDay);
      const hours = Math.floor((distance % msPerDay) / msPerHour);
      const minute = Math.floor((distance % msPerHour) / msPerMinute);
      const second = Math.floor((distance % msPerMinute) / msPerSecond);

      const hh = hours.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');
      const ss = second.toString().padStart(2, '0');

      if (timerText) {
        if (years > 0) {
          timerText.innerText = `${years} thn ${months} bln ${days} hari ${hh}:${mm}:${ss}`;
        } else if (months > 0) {
          timerText.innerText = `${months} bln ${days} hari ${hh}:${mm}:${ss}`;
        } else if (days > 0) {
          timerText.innerText = `${days} hari ${hh}:${mm}:${ss}`;
        } else if (hours > 0) {
          timerText.innerText = `${hh}:${mm}:${ss}`;
        } else {
          timerText.innerText = `${mm}:${ss}`;
        }
      }
    };

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  };

  // --- INITIALIZATION ---
  setTimeout(async () => {
    injectMidtrans();

    try {
      authStore.initializeAuth('reservation');
      if (!authStore.token) throw new Error('Token tidak ditemukan');

      if (authStore.token !== 'MASTER-DEV-RST') {
        const sessionData = await validateSession();
        if (sessionData && sessionData.expired_at) {
          startTimer(sessionData.expired_at);
        }
      }
    } catch (err) {
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Silahkan mulai ulang.',
        icon: 'warning',
      }).then(() => (window.location.href = '/'));
      return;
    }

    await fetchCheckoutData();
  }, 0);

  return template;
}
