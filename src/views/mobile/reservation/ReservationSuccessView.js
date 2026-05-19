import { getCookie } from '../../../utils/cookie';

export function ReservationSuccessView() {
  const urlParams = new URLSearchParams(window.location.search);
  const token =
    urlParams.get('token') ||
    getCookie('session_reservation') ||
    'TOKEN-TIDAK-DITEMUKAN';

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = today.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token)}`;

  const template = `
    <div class="min-h-screen w-full bg-primary-reservation-bg font-quicksand flex flex-col items-center py-10 px-6 relative">
      
      <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-5xl mb-6 shadow-lg animate-bounce">
        <i class="fa-solid fa-check"></i>
      </div>

      <h1 class="text-3xl font-black text-accent-reservation text-center leading-tight mb-2">
        Pembayaran<br/>Berhasil!
      </h1>
      <p class="text-accent-reservation/70 text-center font-medium mb-8">
        Terima kasih! Pesanan dan meja kamu sudah diamankan.
      </p>

      <div id="ticket-container" class="bg-white w-full max-w-sm rounded-3xl shadow-reservation-card p-6 relative overflow-hidden flex flex-col items-center border border-gray-100">
        
        <div class="absolute w-8 h-8 bg-primary-reservation-bg rounded-full -left-4 top-1/2 -translate-y-1/2"></div>
        <div class="absolute w-8 h-8 bg-primary-reservation-bg rounded-full -right-4 top-1/2 -translate-y-1/2"></div>
        
        <h2 class="font-bold text-gray-800 text-lg border-b border-dashed border-gray-300 pb-4 mb-4 w-full text-center tracking-widest uppercase">
          Teras JTI Pass
        </h2>

        <img src="${qrCodeUrl}" alt="QR Code Token" class="w-48 h-48 mb-4 border-4 border-white shadow-sm rounded-lg" crossorigin="anonymous" />
        
        <p class="text-[10px] text-gray-400 font-mono tracking-widest mb-6">TOKEN: ${token}</p>

        <div class="w-full text-sm text-gray-600 flex flex-col gap-2">
          <div class="flex justify-between">
            <span class="text-gray-400">Tanggal</span>
            <span class="font-bold text-gray-800 text-right">${dateStr}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Waktu Pembayaran</span>
            <span class="font-bold text-gray-800">${timeStr} WIB</span>
          </div>
          <div class="flex justify-between mt-2 pt-2 border-t border-gray-100">
            <span class="text-gray-400">Status</span>
            <span class="font-bold text-green-500 bg-green-50 px-2 py-1 rounded">LUNAS</span>
          </div>
        </div>

        <p class="text-[10px] text-center text-gray-400 mt-6 mt-auto">
          Tunjukkan QR Code ini kepada kasir/barista saat kamu tiba di lokasi.
        </p>
      </div>

      <div class="w-full max-w-sm flex flex-col gap-3 mt-8">
        <button id="btn-download" class="w-full bg-accent-reservation text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <i class="fa-solid fa-download"></i> Simpan Tiket (Download)
        </button>
        <button id="btn-home" class="w-full bg-white text-accent-reservation py-4 rounded-xl font-bold shadow-sm border border-gray-200 active:scale-95 transition-transform">
          Kembali ke Beranda
        </button>
      </div>

    </div>
  `;

  setTimeout(() => {
    document
      .getElementById('btn-download')
      .addEventListener('click', async () => {
        const btn = document.getElementById('btn-download');
        const originalText = btn.innerHTML;
        btn.innerHTML =
          '<i class="fa-solid fa-spinner animate-spin"></i> Memproses...';
        btn.disabled = true;

        try {
          if (typeof htmlToImage === 'undefined') {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src =
                'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const ticket = document.getElementById('ticket-container');

          const imgUrl = await htmlToImage.toPng(ticket, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
          });

          // Otomatis download
          const link = document.createElement('a');
          link.download = `Tiket-Reservasi-TerasJTI-${token}.png`;
          link.href = imgUrl;
          link.click();

          btn.innerHTML =
            '<i class="fa-solid fa-check"></i> Berhasil Disimpan!';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        } catch (err) {
          console.error('Gagal download tiket:', err);
          btn.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i> Gagal, Coba Lagi';
          btn.disabled = false;
        }
      });

    document.getElementById('btn-home').addEventListener('click', () => {
      window.location.href = '?view=home';
    });
  }, 0);

  return template;
}
