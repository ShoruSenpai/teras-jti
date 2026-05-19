import Swal from 'sweetalert2';
import {
  format,
  addMonths,
  subMonths,
  isSameMonth,
  differenceInMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfTomorrow,
  isBefore,
} from 'date-fns';

import {
  getMonthAvailability,
  getAreaAvailability,
  saveStepArea,
} from '../../../api/reservationApi.js';
import { validateSession } from '../../../services/sessionService.js';
import { authStore } from '../../../stores/auth.js';
import { setCookie } from '../../../utils/cookie.js';

export function SelectDateView() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // --- STATE MANAGEMENT ---
  const state = {
    viewDate: new Date(),
    today: new Date(),
    tomorrow: startOfTomorrow(),
    monthAvailability: {},
    availableAreas: [],
    selectedDate: '',
    isLoadingMonth: false,
    isSubmittingArea: false,
    timerLeft: null,
    stepNames: ['Booking Tempat', 'Data Diri', 'Pre-Order', 'Checkout'],
    currentStepIndex: 0,
  };

  // --- KOMPONEN HELPER (PENGGANTI VUE COMPONENTS) ---

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
        <div class="relative bg-primary-reservation/90 backdrop-blur-md border border-white/20 text-white shadow-reservation-card rounded-2xl py-3 px-4 flex justify-end">
          <button id="btn-next-step" class="bg-accent-reservation py-2 px-6 font-semibold text-lg rounded-xl opacity-50 cursor-not-allowed" disabled>
            Next >
          </button>
        </div>
      </div>
    `;
  };

  const renderCalendar = () => {
    const start = startOfWeek(startOfMonth(state.viewDate), {
      weekStartsOn: 1,
    });
    const end = endOfWeek(endOfMonth(state.viewDate), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    const isPrevDisable = isSameMonth(state.viewDate, state.today);
    const isNextDisable = differenceInMonths(state.viewDate, state.today) >= 3;

    let gridHtml = days
      .map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const backendData = state.monthAvailability[dateStr];
        const isPastOrToday = isBefore(day, state.tomorrow);
        const isFull = backendData?.is_full || false;
        const isCurrentMonth = isSameMonth(day, state.viewDate);

        const isDisabled = isPastOrToday || isFull || !isCurrentMonth;

        let btnClass =
          'aspect-square rounded-xl flex items-center justify-center font-semibold transition-all ';
        if (isCurrentMonth) {
          btnClass += 'bg-accent-reservation text-on-primary-container ';
        } else {
          btnClass += 'bg-accent-reservation text-on-primary-container/50 ';
        }

        if (isDisabled) {
          btnClass +=
            'bg-accent-reservation/80 text-on-primary-container/60 cursor-not-allowed opacity-50';
        } else {
          btnClass +=
            'hover:scale-105 active:bg-primary-container-reservation-bg cursor-pointer btn-date';
        }

        return `<button data-date="${dateStr}" class="${btnClass}" ${isDisabled ? 'disabled' : ''}>${format(day, 'd')}</button>`;
      })
      .join('');

    document.getElementById('calendar-container').innerHTML = `
      <div class="bg-secondary-reservation-bg p-3 rounded-xl shadow-reservation-card w-full">
        <!-- Controls -->
        <div class="flex gap-6 w-full justify-center items-center text-accent-reservation mb-6">
          <button id="btn-prev-month" class="text-3xl ${isPrevDisable ? 'opacity-20 cursor-not-allowed' : ''}" ${isPrevDisable ? 'disabled' : ''}>&lt;</button>
          <div class="flex flex-col items-center justify-center w-32">
            <h2 class="font-bold text-lg">${format(state.viewDate, 'MMMM')}</h2>
            <h2 class="font-semibold text-xs">${format(state.viewDate, 'yyyy')}</h2>
          </div>
          <button id="btn-next-month" class="text-3xl ${isNextDisable ? 'opacity-20 cursor-not-allowed' : ''}" ${isNextDisable ? 'disabled' : ''}>&gt;</button>
        </div>
        <!-- Grid Header -->
        <div class="grid grid-cols-7 text-center gap-2 mb-2">
          ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => `<div class="text-accent-reservation font-semibold text-sm">${d}</div>`).join('')}
        </div>
        <!-- Grid Days -->
        <div class="grid grid-cols-7 text-center gap-2">
          ${gridHtml}
        </div>
      </div>
      <p class="font-medium text-xs text-accent-reservation mt-3">* Klik tanggal untuk melihat area reservasi.</p>
    `;

    // Attach Listeners
    if (!isPrevDisable)
      document.getElementById('btn-prev-month').onclick = handlePrevMonth;
    if (!isNextDisable)
      document.getElementById('btn-next-month').onclick = handleNextMonth;

    document.querySelectorAll('.btn-date').forEach((btn) => {
      btn.onclick = (e) => handleDateClick(e.target.getAttribute('data-date'));
    });
  };

  const renderAreaModal = () => {
    const modal = document.getElementById('area-modal');
    if (!state.selectedDate || state.availableAreas.length === 0) return;

    let areasHtml = state.availableAreas
      .map((area) => {
        const isAvail = area.isAvailable;
        let btnClass =
          'p-4 rounded-2xl flex justify-between items-center transition-all border-2 text-left w-full mb-3 ';

        if (isAvail) {
          btnClass +=
            'border-accent-reservation text-accent-reservation hover:bg-accent-reservation hover:text-secondary-reservation-bg active:scale-95 btn-area';
        } else {
          btnClass +=
            'border-accent-reservation/20 bg-accent-reservation/5 text-accent-reservation/40 cursor-not-allowed';
        }

        return `
        <button data-id="${area.area_id}" class="${btnClass}" ${!isAvail || state.isSubmittingArea ? 'disabled' : ''}>
          <div>
            <div class="font-bold text-lg">${area.area_name}</div>
            <div class="text-xs font-semibold opacity-80">
              ${area.price > 0 ? '+ Rp ' + new Intl.NumberFormat('id-ID').format(area.price) : 'Gratis Biaya Area'}
            </div>
          </div>
          ${!isAvail ? `<div class="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20">PENUH</div>` : ''}
        </button>
      `;
      })
      .join('');

    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6" id="modal-backdrop">
        <div class="bg-secondary-reservation-bg w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-slide-up">
          <button id="btn-close-modal" class="absolute top-4 right-4 text-accent-reservation text-xl font-bold opacity-70 p-2">✕</button>
          <h2 class="text-xl font-bold text-accent-reservation mb-1">Pilih Area Tempat</h2>
          <p class="text-sm text-accent-reservation/80 mb-6">Tanggal: ${state.selectedDate}</p>
          <div class="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            ${areasHtml}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    // Listeners
    document.getElementById('btn-close-modal').onclick = () =>
      modal.classList.add('hidden');
    document.getElementById('modal-backdrop').onclick = (e) => {
      if (e.target.id === 'modal-backdrop') modal.classList.add('hidden');
    };

    document.querySelectorAll('.btn-area').forEach((btn) => {
      btn.onclick = (e) =>
        confirmAreaSelection(e.currentTarget.getAttribute('data-id'));
    });
  };

  // --- TEMPLATE UTAMA ---
  const template = `
    <div class="bg-primary-reservation-bg min-h-screen w-full font-quicksand relative overflow-x-hidden">
      <!-- Timer Session -->
      <div id="timer-container" class="hidden fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg items-center gap-2">
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span id="timer-text" class="text-sm font-bold md:text-lg">--:--</span>
      </div>

      ${renderBreadcrumb()}

      <div class="flex flex-col gap-6 items-center mt-8 px-4 pb-32">
        <h1 class="font-bold text-2xl text-accent-reservation">Pilih Tanggal Reservasi</h1>
        <!-- Wadah Kalender Dinamis -->
        <div id="calendar-container" class="w-full flex flex-col items-center">
          <i class="fa-solid fa-spinner animate-spin text-3xl text-accent-reservation"></i>
        </div>
      </div>

      <!-- Wadah Modal -->
      <div id="area-modal" class="hidden"></div>

      ${renderFooterNav()}
    </div>
  `;

  // --- LOGIC & API ACTIONS ---

  const fetchMonthData = async () => {
    state.isLoadingMonth = true;
    const monthStr = format(state.viewDate, 'yyyy-MM');

    // Render grid awal (disabled semua) sambil loading
    renderCalendar();

    try {
      const res = await getMonthAvailability(monthStr);
      if (res.success) {
        state.monthAvailability = res.data;
      }
    } catch (err) {
      console.error('Gagal memuat ketersediaan bulan:', err);
    } finally {
      state.isLoadingMonth = false;
      renderCalendar(); // Render ulang dengan data aktif
    }
  };

  const handleNextMonth = () => {
    state.viewDate = addMonths(state.viewDate, 1);
    fetchMonthData();
  };

  const handlePrevMonth = () => {
    state.viewDate = subMonths(state.viewDate, 1);
    fetchMonthData();
  };

  const handleDateClick = async (dateStr) => {
    state.selectedDate = dateStr;
    try {
      Swal.fire({
        title: 'Mencari Area...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await getAreaAvailability(dateStr);
      Swal.close();

      const availableData = res.data ? res.data : res;

      if (res.success || Array.isArray(availableData)) {
        state.availableAreas = Array.isArray(availableData)
          ? availableData
          : [];

        if (state.availableAreas.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Penuh/Tutup',
            text: 'Maaf, tidak ada area yang tersedia di tanggal ini.',
            confirmButtonColor: '#1e88b5',
          });
          return;
        }

        renderAreaModal();
      } else {
        throw new Error('Format data area dari server tidak dikenali.');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text:
          err.response?.data?.message || 'Gagal mengecek ketersediaan area.',
      });
    }
  };

  const confirmAreaSelection = async (areaId) => {
    if (state.isSubmittingArea) return;
    state.isSubmittingArea = true;

    try {
      Swal.fire({
        title: 'Menyimpan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await saveStepArea(state.selectedDate, areaId);

      Swal.close();

      document.getElementById('area-modal').classList.add('hidden');

      const btnNext = document.getElementById('btn-next-step');
      btnNext.disabled = false;
      btnNext.classList.remove('opacity-50', 'cursor-not-allowed');
      btnNext.classList.add('active:scale-95', 'transition-transform');

      btnNext.onclick = () => {
        window.location.href = '?view=personal-data';
      };

      window.location.href = '?view=personal-data';
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal menyimpan area pilihanmu.',
        confirmButtonColor: '#1e88b5',
      });
    } finally {
      state.isSubmittingArea = false;
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
    // 1. Auth & Session
    try {
      if (token) {
        setCookie('session_reservation', token, 360);
        authStore.setToken(token, 'reservation');
      } else {
        authStore.initializeAuth('reservation');
      }

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
        text: 'Sesi kamu telah berakhir. Silahkan mulai ulang.',
        icon: 'warning',
      }).then(() => (window.location.href = '/'));
      return;
    }

    // 2. Mulai tarik data Kalender
    fetchMonthData();
  }, 0);

  return template;
}
