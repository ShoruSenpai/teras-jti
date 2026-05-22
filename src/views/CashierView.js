import Sidebar from '../components/Sidebar.js';
import CashierPopup from '../components/CashierPopup.js';
import { menuApi } from '../api/menuApi.js';
import { orderApi } from '../api/orderApi.js';
import { store, actions, subscribe } from '../stores/index.js';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';

export default function CashierView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let menuItems = [];
  let dynamicCategories = ['All Items'];
  let currentCategory = 'All Items';
  let searchQuery = '';
  let unsubscribe;

  let currentOrderType = 'dine-in';
  let currentToken = '';
  let isOnlineOrder = false;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  // Format: ABCDEF-DDMM
  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${randomStr}-${day}${month}`;
  };

  const init = async () => {
    currentToken = generateToken();

    // 1. Render UI Utama (Shell) terlebih dahulu
    renderShell();

    // 2. Tampilkan Loading hanya di area produk
    renderProducts(true);

    unsubscribe = subscribe((prop) => {
      if (prop === 'cart') renderCart();
    });

    try {
      // 3. Tarik data dari API
      menuItems = await menuApi.getMenu();

      // 4. Ekstrak Kategori secara Dinamis dari Database
      const cats = menuItems.map((item) => item.category);
      dynamicCategories = ['All Items', ...new Set(cats)];

      // 5. Render ulang Tab Kategori dan Grid Menu
      renderCategoryTabs();
      renderProducts(false);
    } catch (error) {
      console.error(error);
      container.querySelector('#product-grid').innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-status-danger-text">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p class="font-medium">Gagal memuat menu. Periksa koneksi internet.</p>
        </div>`;
    }
  };

  const renderShell = () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>
      
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
    <header
      class="bg-main pt-8 px-8 pb-4 flex-col justify-start items-start flex-shrink-0 z-10"
    >
      <!-- container -->
      <div class="flex justify-between">
        <h1 class="text-3xl font-bold text-text-title mb-1">New Order</h1>
        <!-- search & scan -->
        <div class="flex items-center gap-3">
          <div class="relative w-64">
            <span class="absolute left-3 top-2.5 text-text-body"
              ><i class="fas fa-search"></i
            ></span>
            <input
              type="text"
              id="search-input"
              placeholder="Search menu..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card bg-surface transition"
            />
          </div>
          <button
            id="scan-btn"
            class="h-full px-5 py-2.5 bg-brand-500 text-white rounded-xl shadow-card hover:bg-brand-600 transition flex items-center justify-center gap-2"
            title="Scan QR / Input Token"
          >
            <i class="fas fa-qrcode text-lg"></i>
            <span class="font-bold">Scan</span>
          </button>
        </div>
      </div>

      <div
        class="flex space-x-2 mt-4 overflow-x-auto pb-2 custom-scrollbar"
        id="category-tabs"
      ></div>
    </header>

        <div class="flex-1 overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" id="product-grid"></div>
        </div>
      </main>

      <aside class="w-[350px] bg-surface border-l border-border-base h-screen flex flex-col flex-shrink-0 shadow-modal relative z-20">
        <div class="p-6 border-b border-border-base flex justify-between items-center bg-surface">
          <div>
            <h2 class="text-xl font-bold text-text-title">Order Summary</h2>
            <p class="text-sm text-text-body">Token: <span id="display-token" class="font-bold text-brand-500">${currentToken}</span></p>
          </div>
          <button id="clear-cart-btn" class="text-brand-500 hover:bg-red-50 p-2 rounded-lg transition" title="Clear Cart">
            <i class="far fa-trash-alt text-lg"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" id="cart-items"></div>

        <div class="p-6 border-t border-border-base bg-surface">
          <div id="cart-totals"></div>
          
          <div class="flex space-x-3 mb-4">
            <button id="btn-dine-in" class="type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition ${currentOrderType === 'dine-in' ? 'border-brand-500 text-brand-500 bg-brand-50/50' : 'border-gray-200 text-text-body hover:border-gray-300'}">
              Dine In
            </button>
            <button id="btn-take-away" class="type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition ${currentOrderType === 'take-away' ? 'border-brand-500 text-brand-500 bg-brand-50/50' : 'border-gray-200 text-text-body hover:border-gray-300'}">
              Take Away
            </button>
          </div>
          
          <button id="place-order-btn" class="w-full py-4 rounded-xl bg-brand-500 text-white font-bold text-lg hover:bg-brand-600 shadow-button transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-money-bill-wave mr-2"></i> Place Order
          </button>
        </div>
      </aside>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachEvents();
    renderCart();
  };

  const renderCategoryTabs = () => {
    const tabsContainer = container.querySelector('#category-tabs');
    tabsContainer.innerHTML = dynamicCategories
      .map(
        (cat) => `
      <button data-cat="${cat}" class="cat-btn px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition shadow-sm border 
        ${currentCategory === cat ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface text-text-body border-border-base hover:bg-gray-50'}">
        ${cat}
      </button>
    `,
      )
      .join('');

    // Attach click events for new tabs
    tabsContainer.querySelectorAll('.cat-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        currentCategory = e.target.dataset.cat;
        renderCategoryTabs(); // Re-render to update active styling
        renderProducts();
      });
    });
  };

  const renderProducts = (isLoading = false) => {
    const grid = container.querySelector('#product-grid');

    if (isLoading) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-32 text-brand-500">
          <i class="fas fa-spinner fa-spin text-5xl mb-4"></i>
          <p class="font-medium text-text-body">Memuat Menu Database...</p>
        </div>`;
      return;
    }

    let filteredItems = menuItems;
    if (currentCategory !== 'All Items') {
      filteredItems = filteredItems.filter(
        (item) => item.category === currentCategory,
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter((item) =>
        (item.name || '').toLowerCase().includes(q),
      );
    }

    if (filteredItems.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-24 text-text-muted">
          <i class="fas fa-search text-6xl mb-4 opacity-50"></i>
          <p class="font-bold text-lg text-text-title">Menu tidak ditemukan</p>
          <p class="text-sm">Coba cari dengan kata kunci lain atau pilih kategori berbeda.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filteredItems
      .map((item) => {
        const cartItem = store.cart.find((i) => i.id === item.id);
        const isSelected = !!cartItem;
        const qtyBadge = isSelected
          ? `<div class="absolute top-2 right-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-card z-10">${cartItem.qty} Selected</div>`
          : '';

        const disabledClass =
          item.status === 'available'
            ? ''
            : 'opacity-50 grayscale cursor-not-allowed pointer-events-none';

        return `
        <div class="bg-surface rounded-2xl overflow-hidden shadow-card border border-border-base hover:shadow-modal transition cursor-pointer group flex flex-col h-full product-card relative ${isSelected ? 'ring-2 ring-brand-500' : ''} ${disabledClass}" data-id="${item.id}">
          ${qtyBadge}
          <div class="h-30 overflow-hidden relative bg-gray-100">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div class="p-4 flex flex-col flex-1">
            <div class="flex flex-col justify-between h-full items-start mb-1 gap-4">
              <h3 class="font-bold text-text-title flex-1 leading-tight text-xs">${item.name}</h3>
              <div class="flex justify-between items-center w-full">
                <i class="fa-solid fa-cart-shopping text-xs"></i>
                <span class="font-semibold text-right  text-brand-500 text-xs shrink-0">${formatCurrency(item.price)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    grid.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const item = menuItems.find((i) => i.id === id);
        if (item && item.status === 'available') actions.addToCart(item);
      });
    });
  };

  const renderCart = () => {
    const cartContainer = container.querySelector('#cart-items');
    const totalsContainer = container.querySelector('#cart-totals');
    const placeOrderBtn = container.querySelector('#place-order-btn');

    if (store.cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-text-body opacity-50">
          <i class="fas fa-shopping-basket text-5xl mb-4"></i>
          <p class="font-medium">Cart is empty</p>
        </div>
      `;
      totalsContainer.innerHTML = '';
      placeOrderBtn.disabled = true;
      if (container.querySelector('#product-grid')) renderProducts();
      return;
    }

    placeOrderBtn.disabled = false;

    cartContainer.innerHTML = store.cart
      .map(
        (item) => `
      <div class="flex items-center gap-3 bg-surface p-2 rounded-lg border border-transparent hover:border-gray-100 transition">
        <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover bg-gray-100 shadow-card border border-border-base">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm text-text-title truncate">${item.name}</h4>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button class="w-6 h-6 flex items-center justify-center bg-surface rounded shadow-card text-text-title hover:text-brand-500 transition qty-btn" data-id="${item.id}" data-delta="-1">
                <i class="fas fa-minus text-[10px]"></i>
              </button>
              <span class="text-sm font-bold w-4 text-center text-text-title">${item.qty}</span>
              <button class="w-6 h-6 flex items-center justify-center bg-surface rounded shadow-card text-text-title hover:text-brand-500 transition qty-btn" data-id="${item.id}" data-delta="1">
                <i class="fas fa-plus text-[10px]"></i>
              </button>
            </div>
            <span class="text-sm font-bold text-text-title">${formatCurrency(item.price * item.qty)}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join('');

    cartContainer.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        actions.updateCartQty(
          parseInt(btn.dataset.id),
          parseInt(btn.dataset.delta),
        );
      });
    });

    const subtotal = store.cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const tax = 1000; // tax 1k rupiah
    const total = subtotal + tax;

    totalsContainer.innerHTML = `
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm text-text-body font-medium">
          <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="flex justify-between text-sm text-text-body font-medium">
          <span>Tax</span><span>${formatCurrency(tax)}</span>
        </div>
      </div>
      <div class="flex justify-between items-end mb-6 pt-4 border-t border-border-base border-dashed">
        <span class="font-bold text-text-title">Total Amount</span>
        <span class="text-2xl font-bold text-brand-500 leading-none">${formatCurrency(total)}</span>
      </div>
    `;

    if (container.querySelector('#product-grid')) renderProducts();
  };

  const updateTypeButtonsUI = () => {
    const btnDineIn = container.querySelector('#btn-dine-in');
    const btnTakeAway = container.querySelector('#btn-take-away');

    btnDineIn.className =
      'type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition border-gray-200 text-text-body hover:border-gray-300';
    btnTakeAway.className =
      'type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition border-gray-200 text-text-body hover:border-gray-300';

    if (currentOrderType === 'dine-in') {
      btnDineIn.className =
        'type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition border-brand-500 text-brand-500 bg-brand-50/50';
    } else {
      btnTakeAway.className =
        'type-btn flex-1 py-2.5 rounded-xl border-2 font-bold transition border-brand-500 text-brand-500 bg-brand-50/50';
    }
  };

  // ... (blok kode init dan render biarkan sama) ...

  const attachEvents = () => {
    // Event: Fitur Pencarian (Search)
    container.querySelector('#search-input').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });

    // Event: Tombol Tipe Pesanan
    container.querySelector('#btn-dine-in').addEventListener('click', () => {
      currentOrderType = 'dine-in';
      updateTypeButtonsUI();
    });

    container.querySelector('#btn-take-away').addEventListener('click', () => {
      currentOrderType = 'take-away';
      updateTypeButtonsUI();
    });

    container.querySelector('#clear-cart-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the cart?'))
        actions.clearCart();
    });

    // =========================================================================
    // EVENT DIPERBAIKI: Tombol Scan QR / Masukkan Token dengan UI & Izin yang Lebih Baik
    // =========================================================================
    container.querySelector('#scan-btn').addEventListener('click', () => {
      let html5QrCode; // Siapkan variabel untuk objek pemindai inti

      Swal.fire({
        title: 'Scan QR / Enter Token',
        // HTML Kustom yang Ditingkatkan: Pemindai di atas, input manual di bawah
        html: `
          <div class="mb-5">
            <div id="qr-reader-core" class="mx-auto rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2" style="width: 100%; max-width: 320px; aspect-ratio: 1 / 1;">
               <div id="qr-reader-placeholder" class="text-center text-text-muted">
                 <i class="fas fa-qrcode text-5xl mb-3 opacity-60"></i>
                 <p class="text-xs">Sedang memuat kamera...</p>
                 <p class="text-[10px]">Pastikan izin kamera diberikan.</p>
               </div>
            </div>
          </div>
          <div class="relative px-2">
            <p class="text-xs text-text-body mb-2 text-left font-semibold">Atau ketik manual:</p>
            <input type="text" id="manual-token-input" class="w-full px-4 py-3 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-center font-bold tracking-widest uppercase" placeholder="ABCDEF-DDMM">
          </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        customClass: {
          confirmButton:
            'flex-1 h-12 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition',
          cancelButton:
            'flex-1 h-12 rounded-xl border border-border-base text-text-title hover:bg-gray-50 transition',
        },
        buttonsStyling: false,
        allowOutsideClick: false,

        didOpen: () => {
          Swal.update({
            showConfirmButton: true,
            confirmButtonText: '<i class="fas fa-search"></i> Proses',
          });

          html5QrCode = new Html5Qrcode('qr-reader-core');
          const placeholder = document.getElementById('qr-reader-placeholder');
          const manualInput = document.getElementById('manual-token-input');

          const onScanSuccess = (decodedText, decodedResult) => {
            manualInput.value = decodedText;
            html5QrCode
              .stop()
              .then(() => {
                placeholder.classList.remove('hidden');
                Swal.clickConfirm();
              })
              .catch((err) => console.error('Gagal menghentikan kamera:', err));
          };

          Html5Qrcode.getCameras()
            .then((cameras) => {
              if (cameras && cameras.length > 0) {
                const cameraId = cameras[0].id;

                placeholder.classList.add('hidden');

                html5QrCode
                  .start(
                    cameraId,
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    onScanSuccess,
                    (errorMessage) => {},
                  )
                  .catch((err) => {
                    console.error('Gagal memulai kamera:', err);
                    placeholder.classList.remove('hidden');
                    placeholder.innerHTML = `
                         <i class="fas fa-exclamation-triangle text-3xl text-status-danger-text mb-2"></i>
                         <p class="text-xs">Gagal mengakses kamera.</p>
                         <p class="text-[10px]">Cek izin browser atau ketik token.</p>
                      `;
                    manualInput.focus();
                  });
              } else {
                placeholder.classList.remove('hidden');
                placeholder.innerHTML = `<i class="fas fa-camera-slash text-2xl text-status-danger-text mb-2"></i><p class="text-xs">Kamera tidak ditemukan.</p><p class="text-[10px]">Gunakan input manual.</p>`;
                manualInput.focus();
              }
            })
            .catch((err) => {
              console.error('Gagal mendapatkan kamera:', err);
              placeholder.classList.remove('hidden');
              placeholder.innerHTML = `<i class="fas fa-user-shield text-2xl text-status-danger-text mb-2"></i><p class="text-xs">Akses kamera diblokir.</p><p class="text-[10px]">Gunakan input manual.</p>`;
              manualInput.focus();
            });
        },

        willClose: () => {
          if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode
              .stop()
              .catch((error) =>
                console.error('Gagal melepaskan kamera:', error),
              );
          }
        },

        preConfirm: () => {
          const tokenInput = document.getElementById('manual-token-input');
          const token = tokenInput.value;
          if (!token) {
            Swal.showValidationMessage('Token tidak boleh kosong!');
            return false;
          }
          return token;
        },
      }).then((result) => {
        if (result.isDismissed || result.isDenied) {
          isOnlineOrder = false;
        }

        if (result.isConfirmed && result.value) {
          processToken(result.value);
        }
      });
    });

    container
      .querySelector('#place-order-btn')
      .addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const originalBtnText = btn.innerHTML;

        const subtotal = store.cart.reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        );
        const tax = 1000; // tax 1k rupiah
        const total = subtotal + tax;

        const orderData = {
          token: currentToken,
          order_type: currentOrderType,
          order_method: isOnlineOrder ? 'online' : 'offline',
          items: store.cart.map((item) => ({
            id: item.id,
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
          subtotal,
          tax,
          total,
        };

        try {
          btn.disabled = true;
          btn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

          const result = await orderApi.placeOrder(orderData);

          if (result.success) {
            const popup = CashierPopup(orderData, () => {
              actions.clearCart();
              currentToken = generateToken();
              container.querySelector('#display-token').textContent =
                currentToken;
              isOnlineOrder = false;
            });
            document.body.appendChild(popup);
          }
        } catch (error) {
          Swal.fire(
            'Gagal',
            error.message || 'Terjadi kesalahan saat memproses pesanan.',
            'error',
          );
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalBtnText;
        }
      });
  };

  const processToken = async (tokenString) => {
    Swal.fire({
      title: 'Mencari pesanan...',
      didOpen: () => Swal.showLoading(),
      customClass: { container: 'z-[99999]' },
    });

    try {
      const orderData = await orderApi.getOrderByToken(
        tokenString.toUpperCase(),
      );

      currentToken = orderData.token;
      container.querySelector('#display-token').textContent = currentToken;

      isOnlineOrder = true;
      currentOrderType = 'dine-in';
      updateTypeButtonsUI();

      actions.clearCart();

      orderData.items.forEach((item) => {
        const menuObj = menuItems.find((m) => m.id === item.id);
        if (menuObj) {
          for (let i = 0; i < item.qty; i++) {
            actions.addToCart(menuObj);
          }
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pesanan pelanggan berhasil dimuat ke keranjang kasir.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { container: 'z-[99999]' },
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || 'Token pesanan tidak ditemukan atau kadaluarsa.',
        confirmButtonColor: '#E74C3C',
        customClass: { container: 'z-[99999]' },
      });
      isOnlineOrder = false;
    }
  };

  const observer = new MutationObserver((mutations) => {
    if (!document.body.contains(container) && unsubscribe) {
      unsubscribe();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  init();
  return container;
}
