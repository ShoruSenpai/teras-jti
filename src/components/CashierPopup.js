export default function CashierPopup(orderData, onClose) {
  const overlay = document.createElement('div');

  // KUNCI UTAMA: Kita paksa pakai inline style agar 100% muncul di atas segalanya
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease-in-out;
  `;

  // Inject keyframes untuk animasi
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val || 0);

  // Ambil data dengan aman
  const token = orderData?.token || 'UNKNOWN';
  // Sesuaikan dengan format strip (-) dari database kamu
  const orderTypeDisplay =
    orderData?.order_type === 'take-away' ? 'Take Away' : 'Dine In';

  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render daftar item dari keranjang dengan aman
  const itemsHtml = (orderData?.items || [])
    .map(
      (item) => `
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm font-bold text-gray-800">${item.name || 'Menu Item'}</p>
        <p class="text-xs text-gray-500">Qty: ${item.qty || 1}</p>
      </div>
      <p class="text-sm font-bold text-gray-800">${formatCurrency((item.price || 0) * (item.qty || 1))}</p>
    </div>
  `,
    )
    .join('');

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style="animation: slideUp 0.4s ease-out; max-height: 90vh; display: flex; flex-direction: column;">
      
      <div class="p-6 text-center border-b border-gray-100 bg-white">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
          <i class="fas fa-utensils"></i>
        </div>
        <h2 class="text-xl font-bold text-blue-600 mb-1">Teras JTI</h2>
        <p class="text-xs font-bold bg-blue-50 text-blue-600 inline-block px-3 py-1 rounded-full mt-1 uppercase tracking-wider">${orderTypeDisplay}</p>
      </div>
      
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 text-center">
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Token</p>
        <div class="text-2xl font-bold text-gray-800 tracking-[0.3em] bg-white rounded-lg py-2 border border-gray-200 shadow-inner">
          ${token}
        </div>
      </div>

      <div class="p-6 flex-1 overflow-y-auto bg-white">
        <div class="flex justify-between text-xs font-semibold text-gray-500 mb-6">
          <span>Date: ${date}</span>
          <span>Time: ${time}</span>
        </div>

        <div class="space-y-4 mb-6">
          ${itemsHtml}
        </div>

        <div class="border-t border-gray-200 border-dashed pt-4 mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2 font-medium">
            <span>Subtotal</span>
            <span>${formatCurrency(orderData?.subtotal)}</span>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mb-4 font-medium">
            <span>Tax (PB1)</span>
            <span>${formatCurrency(orderData?.tax)}</span>
          </div>
          <div class="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200 border-dashed">
            <span>Total</span>
            <span class="text-blue-600">${formatCurrency(orderData?.total)}</span>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-gray-100 bg-white space-y-3">
        <div class="flex space-x-3">
          <button class="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md flex items-center justify-center">
            <i class="fas fa-print mr-2"></i> Print Struk
          </button>
        </div>
        <button id="close-modal-btn" class="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
          Tutup & Pesanan Baru
        </button>
      </div>
    </div>
  `;

  // Logika untuk menutup popup
  setTimeout(() => {
    overlay.querySelector('#close-modal-btn').addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        if (onClose) onClose(); // Ini akan memicu keranjang kosong & token baru!
      }, 300);
    });
  }, 0);

  return overlay;
}
