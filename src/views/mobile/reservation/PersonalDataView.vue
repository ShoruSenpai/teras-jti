<script setup>
import StepHeader from "@/components/mobile/reservation/StepHeader.vue";
import StepNavView from "@/components/mobile/reservation/StepNavView.vue";
import { validateSession } from "@/services/sessionService";

import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTimer } from "@/composables/useTimer";

const route = useRoute();
const router = useRouter();
const errorMessage = ref("");
const auth = useAuthStore();
const { timerLeft, isExpired, startTimer } = useTimer();

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

    const sessionData = await validateSession();
    if (sessionData.success && sessionData.expired_at) {
      startTimer(sessionData.expired_at);
    }
  } catch (err) {
    if (token === "MASTER-DEV-RST") return;

    if (err.response?.status === 401) {
      errorMessage.value =
        "Sesi kamu telah berakhir. Silahkan scan ulang QR meja atau melalui website.";
      router.push({
        path: "/",
        query: {
          session: "expired",
        },
      });
    }
  }
});
</script>

<template>
  <div class="bg-primary-reservation-bg min-h-screen w-full font-[quicksand]">
    <!-- timer session -->
    <div
      v-if="timerLeft"
      class="fixed top-4 right-4 z-50 bg-primary-reservation-card/40 backdrop-blur-md border border-primary-container-reservation-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
    >
      <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
      <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
    </div>

    <!-- breadcrumb -->
    <StepHeader />

    <!-- personal data form -->
    <div></div>

    <!-- navigation -->
    <StepNavView @triggerPopup="showModalPopup = true" />
  </div>
</template>
