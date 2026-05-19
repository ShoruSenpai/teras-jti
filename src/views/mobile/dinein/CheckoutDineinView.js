import Swal from 'sweetalert2';
import { getCart, updateCartQty, checkoutCart } from '../../../api/cartApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';

export function CheckoutDineinView() {
  // --- STATE MANAGEMENT ---
  const state = {
    cart: null,
    isLoading: true,
    isProcessing: false,
    timerLeft: null,
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const getTotalPrice = () => {
    if (!state.cart || !state.cart.items) return 0;
    return state.cart.items.reduce(
      (sum, item) => sum + parseInt(item.subtotal),
      0,
    );
  };

  // --- TEMPLATE UTAMA ---
  const template = `
    <style>
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
    </style>

    <div class="h-screen w-full font-quicksand bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col overflow-hidden">
      
      <!-- Bagian Atas & Timer -->
      <div class="flex-none flex flex-col items-center pt-6 pb-4 relative">
        <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
          <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
          <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
        </div>
        <img src="/assets/images/logo.webp" alt="teras-logo" class="h-16 object-contain" />
      </div>

      <!-- Wadah Putih Utama -->
      <div class="flex-1 bg-primary-dinein-bg rounded-t-[2.5rem] shadow-dinein-hard flex flex-col overflow-hidden">
        
        <!-- Header Halaman -->
        <div class="flex-none p-6 pb-2 border-b border-gray-100">
          <button id="btn-back" class="text-primary-dinein flex items-center gap-2 text-sm font-bold mb-4 active:scale-95 transition-transform">
            <i class="fa-solid fa-arrow-left"></i>
            Kembali pilih menu
          </button>
          <div class="flex items-center justify-between">
            <h1 class="font-bold text-xl text-gray-800">Order List</h1>
            <span id="cart-item-count" class="text-xs text-gray-400 font-medium">0 Items</span>
          </div>
        </div>

        <!-- Area Scroll Keranjang -->
        <div id="cart-content" class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-gray-50/30">
          <!-- Item keranjang dirender ke sini oleh JS -->
        </div>

        <!-- Footer / Total / Checkout Button -->
        <div id="checkout-footer" class="hidden flex-none p-6 bg-white border-t border-gray-100 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
          <div class="flex flex-col gap-2 mb-4">
            <div class="flex justify-between items-center text-gray-400 text-xs">
              <span>Subtotal</span>
              <span id="subtotal-text">Rp0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-700">Total Pembayaran</span>
              <span id="total-text" class="text-xl font-black text-primary-dinein">Rp0</span>
            </div>
          </div>

          <button id="btn-final-checkout" class="w-full bg-primary-dinein text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-dinein/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
            <span id="checkout-btn-text">Pesan Sekarang</span>
            <i id="checkout-btn-icon" class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

      </div>
    </div>
  `;

  const renderCart = () => {
    const container = document.getElementById('cart-content');
    const footer = document.getElementById('checkout-footer');
    const countText = document.getElementById('cart-item-count');

    // Kondisi Loading
    if (state.isLoading) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-accent-dinein/40 gap-4">
          <i class="fa-solid fa-spinner text-3xl animate-spin text-primary-dinein"></i>
          <p class="text-sm font-bold">Memuat pesanan...</p>
        </div>
      `;
      footer.classList.add('hidden');
      return;
    }

    // Kondisi Kosong
    if (!state.cart || !state.cart.items || state.cart.items.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-gray-400">
          <i class="fa-solid fa-cart-shopping text-5xl mb-4 opacity-10"></i>
          <p class="font-bold">Keranjangmu kosong</p>
        </div>
      `;
      countText.innerText = '0 Items';
      footer.classList.add('hidden');
      return;
    }

    // Kondisi Ada Isi
    countText.innerText = `${state.cart.items.length} Items`;
    container.innerHTML =
      `<div class="flex flex-col gap-4">` +
      state.cart.items
        .map(
          (item) => `
      <div class="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-gray-100">
        <img 
          src="${item.menu.menu_image || '/assets/images/teras-menu-template.webp'}" 
          onerror="this.src='/assets/images/teras-menu-template.webp'"
          class="w-20 h-20 object-cover rounded-xl shrink-0" 
        />
        <div class="flex flex-col flex-1 justify-between min-w-0">
          <div>
            <h2 class="font-bold text-sm text-gray-800 truncate">${item.menu.menu_name}</h2>
            <div class="flex flex-wrap gap-1 mt-1">
              ${
                item.options
                  ? item.options
                      .map(
                        (opt) => `
                <span class="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                  ${opt.option_value?.option_value || ''}
                </span>
              `,
                      )
                      .join('')
                  : ''
              }
            </div>
          </div>
          <div class="flex justify-between items-center">
            <p class="font-bold text-primary-dinein text-sm">Rp${formatPrice(item.price)}</p>
            <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
              <button data-id="${item.cart_item_id}" data-action="minus" class="btn-qty w-6 h-6 flex items-center justify-center active:scale-90 transition-all">
                <i class="${item.qty > 1 ? 'fa-solid fa-minus' : 'fa-solid fa-trash'} text-[10px] text-red-400"></i>
              </button>
              <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
              <button data-id="${item.cart_item_id}" data-action="add" class="btn-qty w-6 h-6 flex items-center justify-center bg-primary-dinein text-white rounded-md shadow-sm active:scale-90 transition-all">
                <i class="fa-solid fa-plus text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
        )
        .join('') +
      `</div>`;

    // Render ulang total dan munculkan footer
    const total = getTotalPrice();
    document.getElementById('subtotal-text').innerText =
      `Rp${formatPrice(total)}`;
    document.getElementById('total-text').innerText = `Rp${formatPrice(total)}`;
    footer.classList.remove('hidden');

    // Event Listener untuk tombol plus/minus
    document.querySelectorAll('.btn-qty').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        const action = e.currentTarget.getAttribute('data-action');
        executeQtyUpdate(itemId, action);
      });
    });
  };

  const updateCheckoutButtonUI = () => {
    const btn = document.getElementById('btn-final-checkout');
    const text = document.getElementById('checkout-btn-text');
    const icon = document.getElementById('checkout-btn-icon');

    if (state.isProcessing) {
      btn.disabled = true;
      btn.classList.add('opacity-50', 'pointer-events-none');
      text.innerText = 'Memproses...';
      icon.className = 'fa-solid fa-spinner animate-spin';
    } else {
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'pointer-events-none');
      text.innerText = 'Pesan Sekarang';
      icon.className = 'fa-solid fa-chevron-right text-xs';
    }
  };

  // --- FUNGSI API & AKSI ---
  const fetchCartData = async () => {
    state.isLoading = true;
    renderCart();
    try {
      const res = await getCart();
      state.cart = res;
    } catch (err) {
      console.error(err);
    } finally {
      state.isLoading = false;
      renderCart();
    }
  };

  const executeQtyUpdate = async (itemId, action) => {
    try {
      await updateCartQty(itemId, action);
      await fetchCartData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Oops',
        icon: 'error',
        text: 'Gagal merubah kuantitas.',
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const processFinalCheckout = async () => {
    if (state.isProcessing) return;

    state.isProcessing = true;
    updateCheckoutButtonUI();

    try {
      const res = await checkoutCart();

      const responseData = res.data ? res.data : res;
      if (responseData.success || responseData.order_token) {
        // Alihkan ke halaman QR Code Order Token
        const orderToken = responseData.order_token;
        window.location.href = `?view=dinein-qrcode&order_token=${orderToken}`;
      }
    } catch (err) {
      Swal.fire({
        title: 'Waduh!',
        icon: 'error',
        text: err.response?.data?.message || 'Gagal memproses pesanan.',
        showConfirmButton: false,
        iconColor: '#f4f9fc',
        background: '#2bb3e6',
        width: '280px',
        position: 'top-end',
        timer: 5000,
        customClass: {
          popup: 'rounded-4xl shadow-lg',
          title: 'text-sm font-bold text-white',
          htmlContainer: 'text-xs text-white opacity-90',
        },
      });
    } finally {
      state.isProcessing = false;
      updateCheckoutButtonUI();
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
    // Tombol Kembali
    document.getElementById('btn-back').addEventListener('click', () => {
      // Kembali ke tampilan Menu menggunakan vanilla router query string
      window.location.href = `?view=dinein-menu`;
    });

    // Tombol Checkout
    document
      .getElementById('btn-final-checkout')
      .addEventListener('click', processFinalCheckout);

    // Otentikasi & Mulai Fetch
    try {
      authStore.initializeAuth('dine-in'); // Baca cookie

      if (!authStore.token) {
        throw new Error('Token tidak ditemukan.');
      }

      if (authStore.token !== 'MASTER-DEV-DN') {
        const sessionData = await validateSession();
        if (sessionData && sessionData.expired_at) {
          startTimer(sessionData.expired_at);
        }
      }
    } catch (err) {
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Sesi kamu telah berakhir. Silahkan scan ulang QR.',
        icon: 'warning',
      }).then(() => {
        window.location.href = '/';
      });
      return;
    }

    // Eksekusi pengambilan data keranjang setelah lolos autentikasi
    await fetchCartData();
  }, 0);

  return template;
}
