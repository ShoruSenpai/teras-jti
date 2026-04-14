<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";
import QrcodeVue from "qrcode.vue";
import { useTimer } from "@/composables/useTimer";
import { validateSession } from "@/services/sessionService";

const route = useRoute();
const router = useRouter();
const orderToken = route.query.order_token;
const { timerLeft, isExpired, startTimer } = useTimer();
const errorMessage = ref("");

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

const backToMenu = () => {
  router.push(`/dine-in/${route.params.token}/menu`);
};

onMounted(async () => {
  try {
    const token = route.params.token;

    const sessionData = await validateSession(token);
    if (sessionData.success && sessionData.expired_at) {
      startTimer(sessionData.expired_at);
    }
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value =
        "Sesi kamu telah berakhir. Silahkan scan ulang QR meja atau melalui website.";
      router.push({
        path: "/",
        query: {
          session: "expired",
        },
      });
    } else {
      errorMessage.value = "Gagal memuat menu. Coba lagi nanti atau hubungi kasir.";
    }
  }
});
</script>

<template>
  <div
    class="min-h-screen w-full bg-linear-to-b from-primary-dinein to-accent-dinein flex flex-col items-center p-6 font-[quicksand]"
  >
    <!-- timer session -->
    <div
      v-if="timerLeft"
      class="fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
    >
      <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
      <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
    </div>

    <div class="mt-12 mb-8 text-center">
      <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <font-awesome-icon icon="fa-solid fa-check" class="text-3xl text-white" />
      </div>
      <h1 class="text-2xl font-black text-white">Pesanan Terkirim!</h1>
      <p class="text-white/80 text-sm mt-2 px-6">
        Silahkan tunjukkan QR Code ini ke kasir Teras JTI untuk pembayaran.
      </p>
    </div>

    <div
      class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center"
    >
      <div class="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
        <qrcode-vue :value="orderToken" :size="250" level="H" />
      </div>

      <div class="mt-6 text-center">
        <span class="text-xs text-gray-400 uppercase tracking-widest font-bold">Kode Pesanan</span>
        <p class="text-2xl font-black text-primary-dinein tracking-tighter">{{ orderToken }}</p>
      </div>

      <div class="w-full h-px bg-gray-100 my-6"></div>

      <div class="flex flex-col gap-2 w-full">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Status</span>
          <span class="font-bold text-orange-500 italic">Menunggu Pembayaran</span>
        </div>
      </div>
    </div>

    <button
      @click="backToMenu"
      class="mt-8 text-white/70 font-bold text-sm border-b border-white/30 pb-1 active:scale-95 transition-all"
    >
      <font-awesome-icon icon="fa-solid fa-pen-to-square" class="mr-2" />
      Ubah Pesanan (Kembali ke Menu)
    </button>
  </div>
</template>
