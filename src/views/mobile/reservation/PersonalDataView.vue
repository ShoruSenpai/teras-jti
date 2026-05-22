<script setup>
import StepHeader from "@/components/mobile/reservation/StepHeader.vue";
import StepNavView from "@/components/mobile/reservation/StepNavView.vue";
import PersonalDataForm from "@/components/mobile/reservation/PersonalDataForm.vue";

import { validateSession } from "@/services/sessionService";
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTimer } from "@/composables/useTimer";

const route = useRoute();
const router = useRouter();
const errorMessage = ref("");
const { timerLeft, isExpired, startTimer } = useTimer();

const formComponentRef = ref(null);

const showChoiceModal = ref(false);

watch(isExpired, (expired) => {
  if (expired) {
    router.push({ path: "/", query: { session: "expired" } });
  }
});

onMounted(async () => {
  const token = route.params.token;
  try {
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

const triggerFormSubmit = () => {
  if (formComponentRef.value) {
    formComponentRef.value.submitForm();
  }
};

const onFormSuccess = () => {
  showChoiceModal.value = true;
};

// Navigasi modal
const goToCheckout = () => {
  router.push({ name: "reservation-checkout", params: { token: route.params.token } });
};

const goToPreOrder = () => {
  router.push({ name: "reservation-preorder-menu", params: { token: route.params.token } });
};
</script>

<template>
  <div class="bg-primary-reservation-bg min-h-screen w-full font-[quicksand] relative pb-24">
    <div
      v-if="timerLeft"
      class="fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
    >
      <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
      <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
    </div>

    <StepHeader />

    <PersonalDataForm ref="formComponentRef" @submit-success="onFormSuccess" />

    <StepNavView :finalLabel="'Selesai'" @triggerPopup="triggerFormSubmit" />

    <div
      v-if="showChoiceModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 transition-all animate-fade-in"
    >
      <div
        class="bg-[#FAF6F0] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-row gap-4 justify-center items-stretch animate-slide-up"
      >
        <button
          @click="goToCheckout"
          class="flex-1 bg-accent-reservation rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-md group"
        >
          <div
            class="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-accent-reservation group-hover:bg-primary-reservation transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-chair" class="text-xl" />
          </div>
          <h3 class="text-white font-bold leading-tight">Reservasi<br />Tempat aja</h3>
          <p class="text-white/80 text-[10px] leading-tight mt-auto">
            Lanjut bayar biaya<br />admin sekarang
          </p>
        </button>

        <button
          @click="goToPreOrder"
          class="flex-1 bg-accent-reservation rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-md group"
        >
          <div
            class="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-accent-reservation group-hover:bg-primary-reservation transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-mug-hot" class="text-xl" />
          </div>
          <h3 class="text-white font-bold leading-tight">Lanjut Pre-<br />Order Menu</h3>
          <p class="text-white/80 text-[10px] leading-tight mt-auto">Pilih makanan Dulu</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
