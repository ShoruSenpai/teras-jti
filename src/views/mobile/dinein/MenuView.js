import Swal from 'sweetalert2';
import { getMenus } from '../../../api/menuApi.js';
import { addToCart, getCartSummary } from '../../../api/cartApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';
import { setCookie } from '../../../utils/cookie.js';
// Pastikan path ini sesuai dengan struktur folder kamu
import { getbanners } from '../../../api/bannerApi.js';

export function MenuView() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  // --- STATE MANAGEMENT ---
  const state = {
    menus: [],
    categories: [],
    selectedCategory: null,
    banners: [],
    cartCount: 0,
    cartTotal: 0,
    isSubmitting: false,
    selectedMenu: null,
    selectedOptions: {},
    timerLeft: null,
    carouselInterval: null,
    currentSlide: 0,
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const template = `
    <div class="min-h-screen w-full font-quicksand bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col items-center pb-24 relative overflow-x-hidden">
      
      <!-- Timer Session -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      <!-- Header / Logo -->
      <div class="mx-auto py-6 sm:py-8 md:py-12">
        <img src="/assets/images/logo.webp" alt="teras-logo" class="h-20 sm:h-28 md:h-34" />
      </div>

      <!-- Wadah Konten Utama -->
      <div class="bg-primary-dinein-bg py-10 px-6 w-full flex flex-col rounded-t-4xl gap-6 shadow-dinein-hard flex-1">
        
        <!-- Banners -->
        <div id="banner-container" class="w-full max-w-lg mx-auto sm:w-md md:w-lg"></div>

        <!-- Categories -->
        <div id="category-container" class="flex overflow-x-auto overflow-hidden px-2 py-4 gap-3 text-on-primary-container font-semibold md:justify-center"></div>

        <!-- Menu List -->
        <div id="menu-container" class="flex flex-col gap-10 pb-10">
          <p class="text-center text-gray-500">Memuat menu...</p>
        </div>

      </div>

      <!-- Checkout Button -->
      <div id="checkout-container" class="hidden fixed bottom-6 left-6 right-6 z-50 animate-bounce-in">
        <div class="bg-primary-dinein/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 flex justify-between items-center">
          <div class="flex flex-col text-white">
            <span id="cart-count" class="text-[10px] uppercase font-bold tracking-wider opacity-80">0 Pesanan</span>
            <span id="cart-total" class="text-lg font-bold">Rp0,00</span>
          </div>
          <button id="btn-checkout" class="bg-white text-primary-dinein px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform">
            Checkout <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Modal Options -->
      <div id="modal-overlay" class="hidden fixed inset-0 bg-black/50 z-[100] items-center justify-center p-6">
        <div class="relative bg-white w-full rounded-3xl p-6 animate-slide-up max-w-md mx-auto">
          <h2 id="modal-title" class="text-xl font-bold mb-4"></h2>
          <button id="btn-close-modal" class="absolute right-6 top-6 w-8 h-8 flex items-center justify-center text-accent-dinein/60 rounded-full active:scale-90 transition-transform">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div id="modal-options-container" class="max-h-[60vh] overflow-y-auto mb-4"></div>
          <button id="btn-confirm-add" class="w-full bg-primary-dinein text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform">
            Tambahkan ke Keranjang
          </button>
        </div>
      </div>

    </div>
  `;

  // --- RENDER FUNCTIONS ---

  const renderBanners = () => {
    const container = document.getElementById('banner-container');
    if (state.banners.length === 0) {
      container.innerHTML = '';
      return;
    }

    const slidesHtml = state.banners
      .map(
        (banner) => `
      <div class="w-full shrink-0 h-full">
        <a href="${banner.link || '#'}">
          <img src="${banner.image}" loading="lazy" class="w-full h-full object-cover pointer-events-none" />
        </a>
      </div>
    `,
      )
      .join('');

    const dotsHtml = state.banners
      .map(
        (_, index) => `
      <button data-index="${index}" class="dot-btn w-2.5 h-2.5 rounded-full transition-all ${state.currentSlide === index ? 'bg-on-primary-container' : 'bg-on-primary-container/50'}"></button>
    `,
      )
      .join('');

    container.innerHTML = `
      <div class="group relative w-full aspect-[2.5/1] rounded-2xl overflow-hidden shadow-dinein-semi border border-accent-dinein/40">
        <div id="carousel-track" class="flex transition-transform duration-300 ease-in-out h-full" style="transform: translateX(-${state.currentSlide * 100}%)">
          ${slidesHtml}
        </div>
        <button id="btn-prev-slide" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-on-primary-container flex items-center justify-center p-2 rounded-full transition-all duration-300 z-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
          <i class="fa-solid fa-left-long text-xs"></i>
        </button>
        <button id="btn-next-slide" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-on-primary-container flex items-center justify-center p-2 rounded-full transition-all duration-300 z-10 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
          <i class="fa-solid fa-right-long text-xs"></i>
        </button>
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          ${dotsHtml}
        </div>
      </div>
    `;

    // Banner Listeners
    document.getElementById('btn-next-slide').onclick = () => moveSlide(1);
    document.getElementById('btn-prev-slide').onclick = () => moveSlide(-1);
    document.querySelectorAll('.dot-btn').forEach((btn) => {
      btn.onclick = (e) => {
        state.currentSlide = parseInt(e.target.getAttribute('data-index'));
        renderBanners(); // re-render to update dots & track
      };
    });
  };

  const moveSlide = (dir) => {
    state.currentSlide =
      (state.currentSlide + dir + state.banners.length) % state.banners.length;
    renderBanners();
  };

  const renderCategories = () => {
    const container = document.getElementById('category-container');
    container.innerHTML = state.categories
      .map(
        (cat) => `
      <button data-id="${cat.category_id}" class="category-btn px-6 py-1 rounded-full whitespace-nowrap flex shrink-0 text-sm md:text-lg shadow-dinein-card transition active:scale-95 ${state.selectedCategory === cat.category_id ? 'bg-accent-dinein text-white' : 'bg-secondary-dinein text-white/80'}">
        ${cat.category_name}
      </button>
    `,
      )
      .join('');

    // Attach listener
    document.querySelectorAll('.category-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        state.selectedCategory = parseInt(e.target.getAttribute('data-id'));
        renderCategories(); // Re-render to update active styling
        renderMenus(); // Re-render menu list
      });
    });
  };

  const renderMenus = () => {
    const container = document.getElementById('menu-container');
    const baseMenus = state.selectedCategory
      ? state.menus.filter((m) => m.category_id === state.selectedCategory)
      : state.menus;

    const groups = [
      {
        label: 'Menu Baru!',
        items: baseMenus.filter((m) => m.is_new && m.status === 'available'),
      },
      {
        label: 'Menu Paling Rekomendasi!',
        items: baseMenus.filter(
          (m) => m.is_recommended && m.status === 'available',
        ),
      },
      {
        label: 'Menu',
        items: baseMenus.filter(
          (m) => !m.is_new && !m.is_recommended && m.status === 'available',
        ),
      },
      {
        label: 'Menu Habis',
        items: baseMenus.filter((m) => m.status === 'sold_out'),
      },
    ].filter((g) => g.items.length > 0);

    if (groups.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 font-semibold py-10">Tidak ada menu di kategori ini.</p>`;
      return;
    }

    container.innerHTML = groups
      .map(
        (group) => `
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-4 text-accent-dinein/60 px-2">
          <div class="h-px flex-1 bg-accent-dinein/30"></div>
          <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">${group.label}</span>
          <div class="h-px flex-1 bg-accent-dinein/30"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-accent-dinein">
          ${group.items
            .map(
              (menu) => `
            <div class="bg-primary-container-dinein-bg rounded-2xl shadow-dinein-card p-3 flex gap-4 items-center border border-primary-dinein/10 relative overflow-hidden transition-all ${menu.status === 'sold_out' ? 'opacity-80 grayscale-[0.5]' : 'active:scale-95'}">
              <img src="${menu.menu_image || '/assets/images/teras-menu-template.webp'}" onerror="this.src='/assets/images/teras-menu-template.webp'" loading="lazy" class="w-28 h-28 sm:h-30 sm:w-30 md:h-35 md:w-35 object-cover rounded-xl shadow-dinein-soft border border-accent-dinein/30" />
              <div class="flex flex-col flex-1 gap-2 h-full justify-between py-2">
                <div class="flex flex-col gap-1 md:pr-4">
                  <h1 class="font-semibold text-sm sm:text-lg md:text-xl">${menu.menu_name}</h1>
                  <p class="text-xs sm:text-md md:text-md opacity-70 line-clamp-2">${menu.menu_description || ''}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="h-px bg-accent-dinein/20 my-1"></div>
                  <div class="flex justify-between items-center">
                    <p class="font-semibold text-xs sm:text-md md:text-lg">Rp${formatPrice(menu.menu_price)},00</p>
                    ${menu.status === 'available' ? `<i data-id="${menu.menu_id}" class="btn-add-cart fa-solid fa-shopping-cart text-md text-primary-dinein cursor-pointer p-2 transition-transform active:scale-125"></i>` : ''}
                  </div>
                </div>
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

    // Attach Add to Cart Listeners
    document.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const menuId = parseInt(e.target.getAttribute('data-id'));
        const menu = state.menus.find((m) => m.menu_id === menuId);
        handleAddToCartClick(menu);
      });
    });
  };

  const updateCartUI = async () => {
    try {
      const res = await getCartSummary();
      state.cartCount = res.total_items || 0;
      state.cartTotal = res.total_price || 0;

      const container = document.getElementById('checkout-container');
      const countEl = document.getElementById('cart-count');
      const totalEl = document.getElementById('cart-total');

      if (state.cartCount > 0) {
        container.classList.remove('hidden');
        countEl.innerText = state.isSubmitting
          ? 'Memproses...'
          : `${state.cartCount} Pesanan`;
        totalEl.innerText = `Rp${formatPrice(state.cartTotal)},00`;
      } else {
        container.classList.add('hidden');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- LOGIC ACTIONS ---

  const handleAddToCartClick = (menu) => {
    if (menu.option_group && menu.option_group.length > 0) {
      state.selectedMenu = menu;
      state.selectedOptions = {};
      renderModalOptions();
      document.getElementById('modal-overlay').classList.remove('hidden');
      document.getElementById('modal-overlay').classList.add('flex');
    } else {
      executeAddToCart(menu.menu_id, []);
    }
  };

  const renderModalOptions = () => {
    document.getElementById('modal-title').innerText =
      state.selectedMenu.menu_name;
    const container = document.getElementById('modal-options-container');

    container.innerHTML = state.selectedMenu.option_group
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
              <button data-group="${group.option_group_id}" data-option="${opt.option_value_id}" class="opt-btn px-4 py-2 rounded-xl border transition-all text-sm ${isSelected ? 'bg-primary-dinein text-white border-primary-dinein shadow-lg scale-105' : 'border-gray-200 text-gray-600 bg-gray-50'}">
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

    // Attach Option Listeners
    document.querySelectorAll('.opt-btn').forEach((btn) => {
      btn.onclick = (e) => {
        const target = e.currentTarget;
        const groupId = parseInt(target.getAttribute('data-group'));
        const optionId = parseInt(target.getAttribute('data-option'));
        state.selectedOptions[groupId] = optionId;
        renderModalOptions(); // Re-render to show selected styling
      };
    });
  };

  const executeAddToCart = async (menuId, optionsArray) => {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    updateCartUI(); // Show loading text

    try {
      await addToCart(menuId, optionsArray);
      document.getElementById('modal-overlay').classList.add('hidden');
      document.getElementById('modal-overlay').classList.remove('flex');
      await updateCartUI();
    } catch (err) {
      Swal.fire({
        title: 'Oops...',
        icon: 'error',
        text: err.message || err || 'Gagal menambahkan pesanan.',
        showConfirmButton: false,
        iconColor: '#f4f9fc',
        background: '#2bb3e6',
        timer: 3000,
        position: 'top',
      });
    } finally {
      state.isSubmitting = false;
      updateCartUI();
    }
  };

  const startTimer = (expiredAt) => {
    const timerContainer = document.getElementById('timer-container');
    const timerText = document.getElementById('timer-text');
    timerContainer.classList.remove('hidden');
    timerContainer.classList.add('flex');

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(expiredAt).getTime() - now;

      if (distance < 0) {
        window.location.href = '/?session=expired';
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      timerText.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  // --- INITIALIZATION ---

  setTimeout(async () => {
    // 1. Auth Handling
    try {
      if (urlToken) {
        setCookie('session_dine-in', urlToken, 120);
        authStore.setToken(urlToken, 'dine-in');
      } else {
        authStore.initializeAuth('dine-in');
      }

      if (!authStore.token) throw new Error('Token sesi tidak ditemukan.');

      if (authStore.token !== 'MASTER-DEV-DN') {
        const sessionData = await validateSession();
        if (sessionData && sessionData.expired_at) {
          startTimer(sessionData.expired_at);
        }
      }
    } catch (err) {
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Silahkan scan ulang QR meja.',
        icon: 'warning',
      }).then(() => {
        window.location.href = '/';
      });
      return;
    }

    // 2. Fetch Data (Banners & Menus) parallel
    try {
      const [bannerRes, menuRes] = await Promise.all([
        getbanners().catch(() => ({ data: [] })),
        getMenus(),
      ]);

      state.banners = bannerRes.data || [];
      if (state.banners.length > 0) {
        state.carouselInterval = setInterval(() => moveSlide(1), 3000);
        renderBanners();
      }

      const menuData = menuRes.data || menuRes;
      state.menus = Array.isArray(menuData) ? menuData : [];

      if (state.menus.length > 0) {
        // Extract Categories using Map (like in Vue)
        const map = new Map();
        state.menus.forEach((m) => {
          if (m.category) map.set(m.category.category_id, m.category);
        });
        state.categories = Array.from(map.values());
        state.selectedCategory =
          state.categories.length > 0 ? state.categories[0].category_id : null;

        renderCategories();
        renderMenus();
      } else {
        document.getElementById('menu-container').innerHTML =
          `<p class="text-center text-gray-500">Tidak ada menu tersedia.</p>`;
      }
    } catch (err) {
      document.getElementById('menu-container').innerHTML =
        `<p class="text-red-500 text-center">Gagal memuat menu</p>`;
    }

    // 3. Initialize Cart
    await updateCartUI();

    // 4. Global Event Listeners
    document.getElementById('btn-close-modal').onclick = () => {
      document.getElementById('modal-overlay').classList.add('hidden');
      document.getElementById('modal-overlay').classList.remove('flex');
    };

    document.getElementById('btn-confirm-add').onclick = () => {
      const optionArray = Object.values(state.selectedOptions);
      executeAddToCart(state.selectedMenu.menu_id, optionArray);
    };

    document.getElementById('btn-checkout').onclick = () => {
      window.location.href = `?view=checkout`;
    };
  }, 0);

  return template;
}
