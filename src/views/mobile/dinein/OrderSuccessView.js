import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';

export function OrderSuccessView() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderToken = urlParams.get('order_token') || 'TOKEN-TIDAK-VALID';

  const template = `
    <div class="min-h-screen w-full bg-linear-to-b from-primary-dinein to-accent-dinein flex flex-col items-center p-6 font-quicksand">
      
      <!-- Timer Session -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      <!-- Icon Sukses & Pesan -->
      <div class="mt-12 mb-8 text-center animate-slide-up">
        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-check text-3xl text-white"></i>
        </div>
        <h1 class="text-2xl font-black text-white">Pesanan Terkirim!</h1>
        <p class="text-white/80 text-sm mt-2 px-6">
          Silahkan tunjukkan QR Code ini ke kasir Teras JTI untuk pembayaran.
        </p>
      </div>

      <!-- Kartu QR Code -->
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center animate-bounce-in">
        <div class="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
          <!-- Canvas tempat QR Code akan digambar -->
          <canvas id="qrcode-canvas" class="mx-auto"></canvas>
        </div>

        <div class="mt-6 text-center">
          <span class="text-xs text-gray-400 uppercase tracking-widest font-bold">Kode Pesanan</span>
          <p class="text-2xl font-black text-primary-dinein tracking-tighter">${orderToken}</p>
        </div>

        <div class="w-full h-px bg-gray-100 my-6"></div>

        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Status</span>
            <span class="font-bold text-orange-500 italic">Menunggu Pembayaran</span>
          </div>
        </div>
      </div>

      <!-- Tombol Kembali -->
      <button id="btn-back-to-menu" class="mt-8 text-white/70 font-bold text-sm border-b border-white/30 pb-1 active:scale-95 transition-all">
        <i class="fa-solid fa-pen-to-square mr-2"></i>
        Ubah Pesanan (Kembali ke Menu)
      </button>

    </div>
  `;

  // --- LOGIKA & INIT ---
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

  setTimeout(async () => {
    // Tombol Kembali ke Menu
    document
      .getElementById('btn-back-to-menu')
      .addEventListener('click', () => {
        window.location.href = '?view=dinein-menu';
      });

    // Generate QR Code ke dalam Canvas
    const canvas = document.getElementById('qrcode-canvas');
    if (orderToken !== 'TOKEN-TIDAK-VALID') {
      QRCode.toCanvas(
        canvas,
        orderToken,
        {
          width: 250,
          errorCorrectionLevel: 'H',
          margin: 1,
          color: {
            dark: '#0f4c75',
            light: '#ffffff',
          },
        },
        function (error) {
          if (error) console.error('Gagal membuat QR Code:', error);
        },
      );
    }

    // Otentikasi & Validasi Sesi
    try {
      authStore.initializeAuth('dine-in');

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
    }
  }, 0);

  return template;
}
