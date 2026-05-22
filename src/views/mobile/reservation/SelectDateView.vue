<script setup>
import StepHeader from "@/components/mobile/reservation/StepHeader.vue";
import CalendarDays from "@/components/mobile/reservation/CalendarDays.vue";
import StepNavView from "@/components/mobile/reservation/StepNavView.vue";

import { useTimer } from "@/composables/useTimer";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { validateSession } from "@/services/sessionService";
import { useAuthStore } from "@/stores/auth";
import { getAreaAvailability, saveStepArea } from "@/api/reservation";
import Swal from "sweetalert2";

const { timerLeft, isExpired, startTimer } = useTimer();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const errorMessage = ref("");

const showAreaModal = ref(false);
const selectedDate = ref("");
const availableAreas = ref([]);
const isSubmittingArea = ref(false);

watch(isExpired, (expired) => {
  if (expired) {
    router.push({
      path: "/",
      query: {
        session: "expired",
      },
    });
  }
});

onMounted(async () => {
  const token = route.params.token;
  try {
    auth.setToken(token, "reservation");

    const sessionData = await validateSession(token);
    if (sessionData.success && sessionData.expired_at) {
      startTimer(sessionData.expired_at);
    }
  } catch (err) {
    if (token === "MASTER-DEV-RST") return;
    if (err.response?.status === 401) {
      errorMessage.value = "Sesi kamu telah berakhir. Silahkan scan ulang.";
      router.push({
        path: "/",
        query: {
          session: "expired",
        },
      });
    }
  }
});

const handleDateSelect = async (dateStr) => {
  selectedDate.value = dateStr;

  try {
    const res = await getAreaAvailability(dateStr);
    if (res.success) {
      availableAreas.value = res.data;
      showAreaModal.value = true;
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err.response?.data?.message || "Gagal mengecek ketersediaan area.",
    });
  }
};

const confirmAreaSelection = async (areaId) => {
  isSubmittingArea.value = true;

  try {
    const res = await saveStepArea(selectedDate.value, areaId);

    if (res.success) {
      showAreaModal.value = false;
      router.push({ name: "reservation-personal-data", params: { token: route.params.token } });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.response?.data?.message || "Gagal menyimpan area pilihanmu.",
    });
  } finally {
    isSubmittingArea.value = false;
  }
};
</script>

<template>
  <div class="bg-primary-reservation-bg min-h-screen w-full font-[quicksand] relative">
    <div
      v-if="timerLeft"
      class="fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
    >
      <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
      <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
    </div>

    <StepHeader />

    <div class="flex flex-col gap-6 items-center mt-8 px-4 pb-24">
      <h1 class="font-bold text-2xl text-accent-reservation">Pilih Tanggal Reservasi</h1>

      <CalendarDays @select-date="handleDateSelect" />
    </div>

    <div
      v-if="showAreaModal"
      @click.self="showAreaModal = false"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 transition-all"
    >
      <div class="bg-secondary-reservation-bg w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button
          @click="showAreaModal = false"
          class="absolute top-4 right-4 text-accent-reservation text-xl font-bold opacity-70 p-2"
        >
          ✕
        </button>

        <h2 class="text-xl font-bold text-accent-reservation mb-1">Pilih Area Tempat</h2>
        <p class="text-sm text-accent-reservation/80 mb-6">Tanggal: {{ selectedDate }}</p>

        <div class="flex flex-col gap-3">
          <button
            v-for="area in availableAreas"
            :key="area.area_id"
            @click="confirmAreaSelection(area.area_id)"
            :disabled="!area.isAvailable || isSubmittingArea"
            :class="[
              'p-4 rounded-2xl flex justify-between items-center transition-all border-2 text-left',
              area.isAvailable
                ? 'border-accent-reservation text-accent-reservation hover:bg-accent-reservation hover:text-secondary-reservation-bg active:scale-95'
                : 'border-accent-reservation/20 bg-accent-reservation/5 text-accent-reservation/40 cursor-not-allowed',
            ]"
          >
            <div>
              <div class="font-bold text-lg">{{ area.area_name }}</div>
              <div class="text-xs font-semibold opacity-80" v-if="area.price > 0">
                + Rp {{ new Intl.NumberFormat("id-ID").format(area.price) }}
              </div>
              <div class="text-xs opacity-80" v-else>Gratis Biaya Area</div>
            </div>

            <div
              v-if="!area.isAvailable"
              class="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20"
            >
              PENUH
            </div>
          </button>
        </div>
      </div>
    </div>

    <StepNavView />
  </div>
</template>
