import Swal from 'sweetalert2';
import { getMenus } from '../../../api/menuApi.js';
import {
  addPreorderMenu,
  getReservationSummary,
} from '../../../api/reservationApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';

export function PreOrderView() {
  // --- STATE MANAGEMENT ---
  const state = {
    menus: [],
    cartTotal: 0,
    cartCount: 0,
    isSubmitting: false,
    isLoading: true,
    selectedMenu: null,
    selectedOptions: {},
    timerLeft: null,
    stepNames: ['Booking Tempat', 'Data Diri', 'Pre-Order', 'Checkout'],
    currentStepIndex: 2, // Index 2 = Pre-Order
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
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

  const renderMenus = () => {
    const container = document.getElementById('menu-list-container');

    if (state.isLoading) {
      container.innerHTML = `<div class="w-full py-10 flex flex-col items-center justify-center text-accent-reservation/50"><i class="fa-solid fa-spinner animate-spin text-3xl mb-2"></i><p>Memuat menu...</p></div>`;
      return;
    }

    const groups = [
      {
        label: 'Menu Baru!',
        items: state.menus.filter((m) => m.is_new && m.status === 'available'),
      },
      {
        label: 'Menu Paling Rekomendasi!',
        items: state.menus.filter(
          (m) => m.is_recommended && m.status === 'available',
        ),
      },
      {
        label: 'Menu',
        items: state.menus.filter(
          (m) => !m.is_new && !m.is_recommended && m.status === 'available',
        ),
      },
      {
        label: 'Menu Habis',
        items: state.menus.filter((m) => m.status === 'sold_out'),
      },
    ].filter((group) => group.items.length > 0);

    if (groups.length === 0) {
      container.innerHTML = `<p class="text-center text-accent-reservation py-10">Belum ada menu yang tersedia.</p>`;
      return;
    }

    container.innerHTML = groups
      .map(
        (group) => `
      <div class="flex flex-col gap-6 mb-10">
        <div class="flex items-center gap-4 text-accent-reservation/60 px-2">
          <div class="h-px flex-1 bg-accent-reservation/30"></div>
          <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">${group.label}</span>
          <div class="h-px flex-1 bg-accent-reservation/30"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-accent-reservation">
          ${group.items
            .map(
              (menu) => `
            <div class="bg-primary-container-reservation-bg rounded-2xl shadow-reservation-card p-3 flex flex-col gap-2 items-center border border-primary-reservation/10 relative overflow-hidden transition-all ${menu.status === 'sold_out' ? 'opacity-80 grayscale-[0.5]' : ''}">
              <img src="${menu.menu_image || '/assets/images/teras-menu-template.webp'}" onerror="this.src='/assets/images/teras-menu-template.webp'" loading="lazy" class="w-full object-cover aspect-square rounded-xl shadow-dinein-soft border border-accent-reservation/30" />
              <div class="flex flex-col flex-1 gap-2 h-full w-full ml-2 mb-2 justify-start items-start py-2">
                <h1 class="font-semibold text-md sm:text-lg md:text-xl">${menu.menu_name}</h1>
                <p class="font-semibold mt-auto text-sm sm:text-md md:text-lg">Rp${formatPrice(menu.menu_price)},00</p>
                ${menu.status === 'available' ? `<i data-id="${menu.menu_id}" class="btn-add-cart fa-solid fa-shopping-cart text-md absolute bottom-3 right-3 text-primary-reservation cursor-pointer p-2 transition-transform ${state.isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-125'}"></i>` : ''}
              </div>
              ${
                menu.status === 'sold_out'
                  ? `
                <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 pointer-events-auto">
                  <div class="border-2 border-white/40 px-4 py-1 rounded-full rotate-[-10deg] shadow-xl">
                    <span class="text-white font-black italic uppercase tracking-widest text-lg md:text-2xl">Sold Out</span>
                  </div>
                  <p class="text-white/60 text-[10px] mt-2 font-medium">Menu sedang tidak tersedia</p>
                </div>
              `
                  : ''
              }
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `,
      )
      .join('');

    // Attach Listeners ke Tombol Cart
    document.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.onclick = (e) => {
        if (state.isSubmitting) return;
        const menuId = parseInt(e.currentTarget.getAttribute('data-id'));
        const menu = state.menus.find((m) => m.menu_id === menuId);
        handleAddToCart(menu);
      };
    });
  };

  const renderCheckoutBar = () => {
    const bar = document.getElementById('checkout-bar');
    if (state.cartCount > 0) {
      bar.innerHTML = `
        <div class="bg-primary-reservation/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 flex justify-between items-center">
          <div class="flex flex-col text-white">
            <span class="text-[10px] uppercase font-bold tracking-wider opacity-80">${state.isSubmitting ? '<i class="fa-solid fa-spinner animate-spin"></i> Memproses' : `${state.cartCount} Pesanan`}</span>
            <span class="text-lg font-bold">Rp${formatPrice(state.cartTotal)},00</span>
          </div>
          <button id="btn-go-checkout" class="bg-white text-primary-reservation px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform" ${state.isSubmitting ? 'disabled' : ''}>
            Checkout <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      `;
      bar.classList.remove('hidden');
      document.getElementById('btn-go-checkout').onclick = () =>
        (window.location.href = '?view=reservation-checkout');
    } else {
      bar.classList.add('hidden');
    }
  };

  const renderModalOptions = () => {
    const modal = document.getElementById('options-modal');

    let optionsHtml = state.selectedMenu.option_group
      .map(
        (group) => `
      <div class="mb-4">
        <p class="font-semibold text-gray-700 mb-2">${group.option_group_name}</p>
        <div class="flex flex-wrap gap-2">
          ${group.options
            .map((opt) => {
              const isSelected =
                state.selectedOptions[group.option_group_id] ===
                opt.option_value_id;
              return `
              <button data-group="${group.option_group_id}" data-opt="${opt.option_value_id}" class="btn-option px-4 py-2 rounded-xl border transition-all text-sm ${isSelected ? 'bg-primary-reservation text-white border-primary-reservation shadow-lg scale-105' : 'border-gray-200 text-gray-600 bg-gray-50'}">
                ${opt.option_value}
                ${opt.extra_price > 0 ? `<span class="text-[10px] block opacity-80">+Rp${formatPrice(opt.extra_price)}</span>` : ''}
              </button>
            `;
            })
            .join('')}
        </div>
      </div>
    `,
      )
      .join('');

    modal.innerHTML = `
      <div id="modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-6">
        <div class="relative bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up">
          <h2 class="text-xl font-bold mb-4">${state.selectedMenu.menu_name}</h2>
          <button id="btn-close-modal" class="absolute right-6 top-6 w-8 h-8 flex items-center justify-center text-accent-reservation/60 rounded-full active:scale-90 transition-transform">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="max-h-[50vh] overflow-y-auto mb-4 custom-scrollbar">
            ${optionsHtml}
          </div>

          <button id="btn-confirm-add" class="w-full bg-primary-reservation text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform" ${state.isSubmitting ? 'disabled' : ''}>
            ${state.isSubmitting ? 'Menambahkan...' : 'Tambahkan ke Keranjang'}
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    // Modal Listeners
    document.getElementById('btn-close-modal').onclick = () =>
      modal.classList.add('hidden');
    document.getElementById('modal-backdrop').onclick = (e) => {
      if (e.target.id === 'modal-backdrop') modal.classList.add('hidden');
    };

    document.querySelectorAll('.btn-option').forEach((btn) => {
      btn.onclick = (e) => {
        const groupId = parseInt(e.currentTarget.getAttribute('data-group'));
        const optId = parseInt(e.currentTarget.getAttribute('data-opt'));
        state.selectedOptions[groupId] = optId;
        renderModalOptions(); // Re-render untuk merubah warna tombol
      };
    });

    document.getElementById('btn-confirm-add').onclick = () => {
      const optionArray = Object.values(state.selectedOptions);
      executeAddToCart(state.selectedMenu.menu_id, optionArray);
    };
  };

  // --- TEMPLATE UTAMA ---
  const template = `
    <style>
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
    </style>

    <div class="min-h-screen w-full font-quicksand bg-primary-reservation-bg flex flex-col items-center pb-24 relative overflow-x-hidden">
      <!-- Timer -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      ${renderBreadcrumb()}

      <!-- Kontainer List Menu -->
      <div id="menu-list-container" class="py-10 px-6 w-full flex flex-col shadow-reservation-hard flex-1">
        <!-- Render menu masuk ke sini -->
      </div>

      <!-- Checkout Bar Bawah -->
      <div id="checkout-bar" class="hidden fixed bottom-6 left-6 right-6 z-50 animate-bounce-in"></div>

      <!-- Wadah Modal Options -->
      <div id="options-modal" class="hidden fixed inset-0 z-[100]"></div>
    </div>
  `;

  // --- LOGIC & ACTIONS ---
  const handleAddToCart = (menu) => {
    if (menu.option_group && menu.option_group.length > 0) {
      state.selectedMenu = menu;
      state.selectedOptions = {};
      renderModalOptions();
    } else {
      executeAddToCart(menu.menu_id, []);
    }
  };

  const executeAddToCart = async (menuId, options = []) => {
    if (state.isSubmitting) return;
    state.isSubmitting = true;

    // Sembunyikan modal jika terbuka & ubah state tombol jadi loading
    document.getElementById('options-modal').classList.add('hidden');
    renderMenus();
    renderCheckoutBar();

    try {
      await addPreorderMenu(menuId, options);
      // Panggil preview cart setelah berhasil menambah data
      await getCartPreview();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Oops...',
        icon: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan pesanan.',
        showConfirmButton: false,
        timer: 3000,
        position: 'top',
        color: '#ffffff',
        background: '#6f4e37',
      });
    } finally {
      state.isSubmitting = false;
      renderMenus(); // Kembalikan tombol add cart
      renderCheckoutBar(); // Kembalikan angka cart tanpa icon loading
    }
  };

  const getCartPreview = async () => {
    try {
      const res = await getReservationSummary();
      console.log('Response Cart:', res);

      const items =
        parseInt(res.total_items) || parseInt(res.data?.total_items) || 0;
      const price =
        parseInt(res.total_price) || parseInt(res.data?.total_price) || 0;

      state.cartCount = items;
      state.cartTotal = price;

      console.log('Jumlah Item di State:', state.cartCount);

      renderCheckoutBar();
    } catch (err) {
      console.error('Gagal get summary cart:', err);
    }
  };

  const fetchData = async () => {
    state.isLoading = true;
    renderMenus();
    try {
      const res = await getMenus();
      const result = res.data || res;
      state.menus = Array.isArray(result) ? result : [];
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memuat daftar menu.',
      });
    } finally {
      state.isLoading = false;
      renderMenus();
      await getCartPreview();
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

    fetchData();
  }, 0);

  return template;
}
