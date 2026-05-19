import { initSession } from '../../../composables/useSession.js';
import { removeCookie } from '../../../utils/cookie.js';

export function InitReservation() {
  const template = `
    <div class="h-screen w-full font-quicksand bg-linear-to-b from-primary-dinein to-accent-dinein overflow-hidden">
      <div class="h-full w-full flex flex-col items-center justify-center relative">
        
        <!-- Logo Loading -->
        <img 
          id="loading-logo"
          src="/assets/images/logo.webp" 
          alt="teras logo" 
          class="h-36 transition-all duration-700 animate-pulse scale-110" 
        />

        <!-- Error Overlay (Hidden by default) -->
        <div 
          id="error-overlay"
          class="hidden absolute inset-0 bg-black/60 flex items-center justify-center p-6 z-50"
        >
          <div class="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
            <div class="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
            <p id="error-message" class="text-gray-600 mb-8 leading-relaxed"></p>

            <div class="flex flex-col gap-4">
              <button id="btn-retry" class="w-full py-3 bg-primary-dinein text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                Coba Lagi
              </button>
              <button id="btn-home" class="w-full py-3 bg-primary-dinein text-gray-700 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  setTimeout(() => {
    let retryCount = 0;

    const showError = (message) => {
      document
        .getElementById('loading-logo')
        .classList.remove('animate-pulse', 'scale-110');
      document.getElementById('error-message').innerText = message;
      document.getElementById('error-overlay').classList.remove('hidden');
    };

    const startProcess = async () => {
      document.getElementById('error-overlay').classList.add('hidden');
      document
        .getElementById('loading-logo')
        .classList.add('animate-pulse', 'scale-110');

      const result = await initSession('reservation');

      if (result.success) {
        window.location.href = `?view=select-date&token=${result.token}`;
      } else {
        if (result.message.toLowerCase().includes('waktu') && retryCount < 1) {
          console.log('timeout. Menghapus Cookie Reservation...');
          removeCookie('session_reservation');
          retryCount++;
          startProcess();
        } else {
          showError(result.message);
        }
      }
    };

    document
      .getElementById('btn-retry')
      .addEventListener('click', startProcess);
    document.getElementById('btn-home').addEventListener('click', () => {
      window.location.href = '/';
    });

    startProcess();
  }, 0);

  return template;
}
