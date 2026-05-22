<script setup>
import StepHeader from "@/components/mobile/reservation/StepHeader.vue";
import OrderListCheckout from "@/components/mobile/reservation/OrderListCheckout.vue";
import OrderSummaryCheckout from "@/components/mobile/reservation/OrderSummaryCheckout.vue";
import PaymentCheckout from "@/components/mobile/reservation/PaymentCheckout.vue";

import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateSession } from "@/services/sessionService";
import { useTimer } from "@/composables/useTimer";
import {
  getPreorderCart,
  getReservationSummary,
  updatePreorderMenuQty,
  processReservationCheckout,
} from "@/api/reservation";
import Swal from "sweetalert2";

const { timerLeft, isExpired, startTimer } = useTimer();
const router = useRouter();
const route = useRoute();

const preOrderItems = ref([]);
const orderSummary = ref({});
const isLoading = ref(true);
const PPNtax = 1000;

watch(isExpired, (expired) => {
  if (expired) {
    router.push({ path: "/", query: { session: "expired" } });
  }
});

const fetchCheckoutData = async () => {
  try {
    const [cartRes, summaryRes] = await Promise.all([getPreorderCart(), getReservationSummary()]);

    if (cartRes.success) {
      preOrderItems.value = cartRes.data.map((item) => ({
        id: item.reservation_menu_id,
        name: item.menu ? item.menu.menu_name : "Menu Dihapus",
        price: item.menu ? item.menu.menu_price : 0,
        qty: item.qty,
        image: item.menu ? item.menu.menu_image : null,
        stock: item.menu ? item.menu.menu_stock : 99,
      }));
    }

    if (summaryRes.success) {
      orderSummary.value = {
        areaPrice: summaryRes.data.billing_info.area_total,
        menuSubtotal: summaryRes.data.total - summaryRes.data.billing_info.area_total,
        total: summaryRes.data.total,
        payNow: summaryRes.data.payNow,
        minDp: summaryRes.data.minDp,
      };
    }
  } catch (err) {
    console.error("Gagal load data", err);
  }
};

onMounted(async () => {
  const token = route.params.token;

  // SUNTIK SCRIPT MIDTRANS
  const script = document.createElement("script");
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
  document.head.appendChild(script);

  try {
    const sessionData = await validateSession(token);
    if (sessionData.success && sessionData.expired_at) {
      startTimer(sessionData.expired_at);
    }

    await fetchCheckoutData();
  } catch (err) {
    if (token === "MASTER-DEV-RST") return;
    if (err.response?.status === 401) {
      router.push({
        path: "/",
        query: { session: "expired" },
      });
    } else {
      Swal.fire("Error", "Gagal memuat rincian pesanan", "error");
    }
  } finally {
    isLoading.value = false;
  }
});

const handleUpdateQty = async (id, action) => {
  isLoading.value = true;
  try {
    const res = await updatePreorderMenuQty(id, action);
    if (res.success) {
      await fetchCheckoutData();
    }
  } catch (error) {
    Swal.fire("Gagal", "Tidak dapat mengubah pesanan", "error");
  } finally {
    isLoading.value = false;
  }
};

const processPayment = async () => {
  if (typeof window.snap === "undefined") {
    Swal.fire(
      "Sistem Belum Siap",
      "Modul pembayaran sedang dimuat, coba beberapa detik lagi.",
      "warning",
    );
    return;
  }

  Swal.fire({
    title: "Memproses Pembayaran...",
    text: "Mohon tunggu sebentar",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const res = await processReservationCheckout();

    if (res.success && res.snap_token) {
      Swal.close();

      window.snap.pay(res.snap_token, {
        onSuccess: function (result) {
          Swal.fire("Berhasil", "Pembayaran Diterima!", "success").then(() => {
            router.push({
              name: "home",
            }); // Ganti rute sukses
          });
        },
        onPending: function (result) {
          Swal.fire("Menunggu", "Selesaikan pembayaran Anda di aplikasi bank/wallet.", "info");
        },
        onError: function (result) {
          Swal.fire("Gagal", "Pembayaran ditolak.", "error");
        },
        onClose: function () {
          Swal.fire("Dibatalkan", "Anda menutup popup pembayaran.", "warning");
        },
      });
    } else {
      Swal.fire("Gagal", res.message || "Gagal mendapatkan token pembayaran", "error");
    }
  } catch (err) {
    Swal.fire("Error", `Sistem pembayaran sedang gangguan. ${err}`, "error");
  }
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

    <div class="w-full my-6 mx-auto">
      <h1 class="font-bold text-2xl text-accent-reservation mb-6 text-center">Checkout</h1>
    </div>

    <OrderListCheckout
      v-if="preOrderItems.length > 0"
      :items="preOrderItems"
      :isLoading="isLoading"
      @update-qty="handleUpdateQty"
    />

    <OrderSummaryCheckout :summary="orderSummary" :isLoading="isLoading" />

    <PaymentCheckout />

    <div class="fixed bottom-0 left-0 right-0 p-6 border-t border-gray-100 z-50">
      <button
        @click="processPayment"
        :disabled="isLoading"
        :class="[
          'w-full text-white py-4 rounded-xl font-bold text-lg shadow-reservation-card flex justify-between px-6 transition-all',
          isLoading
            ? 'bg-accent-reservation/60 cursor-not-allowed'
            : 'bg-accent-reservation active:scale-95',
        ]"
      >
        <span>Confirm Order</span>
        <span class="bg-white/20 px-3 py-1 rounded-lg">
          <font-awesome-icon v-if="isLoading" icon="fa-solid fa-spinner" class="animate-spin" />
          <span v-else
            >Rp{{
              new Intl.NumberFormat("id-ID").format((orderSummary.payNow || 0) + PPNtax)
            }}</span
          >
        </span>
      </button>
    </div>
  </div>
</template>
