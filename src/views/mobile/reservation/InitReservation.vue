<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { initSession } from "@/composables/useSession";
// import { removeCookie } from "@/utils/cookie";

const router = useRouter();
const errorMessage = ref("");
const isValidating = ref(true);

const startReservation = async () => {
  isValidating.value = true;
  errorMessage.value = "";

  const result = await initSession("reservation");

  if (result.success) {
    router.push(`/reservation/${result.token}/select-date`);
  } else {
    errorMessage.value = result.message;
    isValidating.value = false;
  }
};

onMounted(async () => {
  startReservation();
});

const retry = () => {
  startReservation();
};
</script>

<template>
  <div
    class="h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein to-accent-dinein overflow-hidden"
  >
    <div class="h-full w-full flex flex-col items-center justify-center relative">
      <img
        src="/assets/images/logo.webp"
        alt="teras logo"
        :class="[
          'h-36 transition-all duration-700',
          isValidating ? 'animate-pulse scale-110' : 'scale-100',
        ]"
      />

      <div
        v-if="errorMessage"
        class="absolute inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fade-in"
      >
        <div
          class="bg-primary-dinein-bg w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all scale-100"
        >
          <div
            class="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
          >
            <font-awesome-icon icon="fa-solid fa-location-dot" />
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p class="text-gray-600 mb-8 leading-relaxed">
            {{ errorMessage }}
          </p>

          <div class="flex flex-col gap-4">
            <button
              @click="retry"
              class="w-full py-2 md:py-4 bg-primary-dinein text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
            <RouterLink
              to="/"
              class="w-full py-2 md:py-4 bg-primary-dinein text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Kembali ke Halaman Utama
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
