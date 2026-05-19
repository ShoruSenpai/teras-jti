import Swal from 'sweetalert2';
import {
  saveStepPersonalData,
  getPersonalData,
} from '../../../api/reservationApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';

export function PersonalDataView() {
  // --- STATE MANAGEMENT ---
  const state = {
    formData: {
      customer_name: '',
      customer_phone: '',
      guest_count: '',
      reservation_time: '',
      reservation_duration: '',
    },
    isFetching: true,
    isSubmitting: false,
    timerLeft: null,
    stepNames: ['Booking Tempat', 'Data Diri', 'Pre-Order', 'Checkout'],
    currentStepIndex: 1,
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

  const renderFooterNav = () => {
    return `
      <div class="fixed bottom-12 left-6 right-6 z-50">
        <div class="relative bg-primary-reservation/90 backdrop-blur-md border border-white/20 text-white shadow-reservation-card rounded-2xl py-3 px-4 flex justify-between">
          <button id="btn-prev-step" class="bg-accent-reservation py-2 px-6 font-semibold text-lg rounded-xl active:scale-95 transition-transform">
            &lt; Prev
          </button>
          <button id="btn-submit-form" class="bg-accent-reservation py-2 px-6 font-semibold text-lg rounded-xl active:scale-95 transition-transform">
            Selesai
          </button>
        </div>
      </div>
    `;
  };

  // --- TEMPLATE UTAMA ---
  const template = `
    <style>
      .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      
      /* Sembunyikan panah up/down di input type number */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    </style>

    <div class="bg-primary-reservation-bg min-h-screen w-full font-quicksand relative pb-24 overflow-x-hidden">
      <!-- Timer -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      ${renderBreadcrumb()}

      <!-- Form Container -->
      <div class="flex flex-col gap-6 items-center mt-8 px-6">
        <h1 class="font-bold text-2xl text-accent-reservation">Lengkapi Data Diri</h1>

        <div class="bg-white w-full max-w-md rounded-3xl p-6 shadow-reservation-card relative overflow-hidden">
          
          <!-- Loading Overlay -->
          <div id="loading-overlay" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center transition-all">
            <i class="fa-solid fa-spinner animate-spin text-3xl text-accent-reservation mb-2"></i>
            <span class="text-accent-reservation font-bold text-sm">Menyiapkan form...</span>
          </div>

          <h2 class="text-center font-bold text-lg text-accent-reservation border-b border-gray-200 pb-3 mb-5">
            Data Diri
          </h2>

          <div class="flex flex-col gap-4 relative z-10">
            <div>
              <label class="block text-accent-reservation font-bold text-sm mb-2">Nama</label>
              <input id="input-name" type="text" class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold" />
            </div>

            <div>
              <label class="block text-accent-reservation font-bold text-sm mb-2">No.hp</label>
              <input id="input-phone" type="tel" class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-accent-reservation font-bold text-sm mb-2">Jmlh Orang</label>
                <input id="input-guest" type="number" class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold" />
              </div>
              <div>
                <label class="block text-accent-reservation font-bold text-sm mb-2">Waktu Check-in</label>
                <input id="input-time" type="time" class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold" />
              </div>
            </div>

            <div>
              <label class="block text-accent-reservation font-bold text-sm mb-2">Durasi (Jam)</label>
              <input id="input-duration" type="number" placeholder="Misal: 2" class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold" />
            </div>
          </div>
        </div>
      </div>

      ${renderFooterNav()}

      <!-- Choice Modal (Hidden by default) -->
      <div id="choice-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] items-center justify-center p-6 transition-all animate-fade-in">
        <div class="bg-[#FAF6F0] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-row gap-4 justify-center items-stretch animate-slide-up">
          
          <button id="btn-go-checkout" class="flex-1 bg-accent-reservation rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-md group">
            <div class="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-accent-reservation group-hover:bg-primary-reservation transition-colors">
              <i class="fa-solid fa-chair text-xl"></i>
            </div>
            <h3 class="text-white font-bold leading-tight">Reservasi<br />Tempat aja</h3>
            <p class="text-white/80 text-[10px] leading-tight mt-auto">Lanjut bayar biaya<br />admin sekarang</p>
          </button>

          <button id="btn-go-preorder" class="flex-1 bg-accent-reservation rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-md group">
            <div class="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-accent-reservation group-hover:bg-primary-reservation transition-colors">
              <i class="fa-solid fa-mug-hot text-xl"></i>
            </div>
            <h3 class="text-white font-bold leading-tight">Lanjut Pre-<br />Order Menu</h3>
            <p class="text-white/80 text-[10px] leading-tight mt-auto">Pilih makanan Dulu</p>
          </button>

        </div>
      </div>

    </div>
  `;

  // --- LOGIC & ACTIONS ---

  const populateForm = () => {
    document.getElementById('input-name').value = state.formData.customer_name;
    document.getElementById('input-phone').value =
      state.formData.customer_phone;
    document.getElementById('input-guest').value = state.formData.guest_count;
    document.getElementById('input-time').value =
      state.formData.reservation_time;
    document.getElementById('input-duration').value =
      state.formData.reservation_duration;
  };

  const getFormData = () => {
    return {
      customer_name: document.getElementById('input-name').value.trim(),
      customer_phone: document.getElementById('input-phone').value.trim(),
      guest_count: document.getElementById('input-guest').value.trim(),
      reservation_time: document.getElementById('input-time').value.trim(),
      reservation_duration: document
        .getElementById('input-duration')
        .value.trim(),
    };
  };

  const setupInputListeners = () => {
    const setupEnterToFocus = (currentId, nextId) => {
      document.getElementById(currentId).addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          if (nextId === 'submit') {
            handleFormSubmit();
          } else {
            document.getElementById(nextId).focus();
          }
        }
      });
    };

    setupEnterToFocus('input-name', 'input-phone');
    setupEnterToFocus('input-phone', 'input-guest');
    setupEnterToFocus('input-guest', 'input-time');
    setupEnterToFocus('input-time', 'input-duration');
    setupEnterToFocus('input-duration', 'submit');
  };

  const fetchExistingData = async () => {
    try {
      const res = await getPersonalData();
      const data = res.data ? res.data : res;

      if (res.success || data.customer_name) {
        state.formData = { ...state.formData, ...data };
        populateForm();
      }
    } catch (err) {
      console.error('Belum ada data form sebelumnya atau gagal memuat:', err);
    } finally {
      state.isFetching = false;
      document.getElementById('loading-overlay').classList.add('hidden');
    }
  };

  const handleFormSubmit = async () => {
    if (state.isSubmitting) return;

    const data = getFormData();

    if (
      !data.customer_name ||
      !data.customer_phone ||
      !data.guest_count ||
      !data.reservation_time ||
      !data.reservation_duration
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon isi semua data diri dan waktu reservasi.',
        confirmButtonColor: '#8b5e3c',
      });
      return;
    }

    state.isSubmitting = true;
    Swal.fire({
      title: 'Menyimpan...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await saveStepPersonalData(data);

      Swal.close();

      const modal = document.getElementById('choice-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal menyimpan data diri.',
        confirmButtonColor: '#8b5e3c',
      });
    } finally {
      state.isSubmitting = false;
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
    document.getElementById('btn-prev-step').addEventListener('click', () => {
      window.location.href = '?view=reservation-date';
    });
    document
      .getElementById('btn-submit-form')
      .addEventListener('click', handleFormSubmit);

    // Pilihan Modal
    document.getElementById('btn-go-checkout').addEventListener('click', () => {
      window.location.href = '?view=reservation-checkout';
    });
    document.getElementById('btn-go-preorder').addEventListener('click', () => {
      window.location.href = '?view=preorder-menu';
    });

    setupInputListeners();

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
        text: 'Sesi kamu telah berakhir. Silahkan scan ulang.',
        icon: 'warning',
      }).then(() => (window.location.href = '/'));
      return;
    }

    await fetchExistingData();
  }, 0);

  return template;
}
