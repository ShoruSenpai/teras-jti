<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";
import { useTimer } from "@/composables/useTimer";
import { validateSession } from "@/services/sessionService";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const token = route.params.token;
const { timerLeft, isExpired, startTimer } = useTimer();

const cart = ref(null);
const isLoading = ref(true);
const isProcessing = ref(false);
const errorMessage = ref("");

const fetchCart = async () => {
  try {
    const res = await apiClient.get("/cart", {
      headers: {
        "X-Session-Token": token,
      },
    });

    cart.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const updateQty = async (itemId, action) => {
  try {
    await apiClient.post(
      `/cart/update/${itemId}`,
      {
        action,
      },
      {
        headers: {
          "X-Session-Token": token,
        },
      },
    );
    await fetchCart();
  } catch (err) {
    console.error(err);
  }
};

const totalPrice = computed(() => {
  if (!cart.value || !cart.value.items) return 0;

  return cart.value.items.reduce((sum, item) => sum + parseInt(item.subtotal), 0);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const handleFinalCheckout = async () => {
  isProcessing.value = true;
  try {
    const res = await apiClient.post(
      "/cart/checkout",
      {},
      {
        headers: {
          "X-Session-Token": token,
        },
      },
    );

    if (res.data.success) {
      router.push({
        name: "dinein-qrcode",
        params: {
          token: token,
        },
        query: {
          order_token: res.data.order_token,
        },
      });
    }
  } catch (err) {
    Swal.fire({
      title: "Waduh!",
      icon: "error",
      text: err.response?.data?.message || "Gagal memproses pesanan.",
      showConfirmButton: false,
      iconColor: "#f4f9fc",
      background: "#2bb3e6",
      width: "280px",
      position: "top-end",
      timer: 5000,
      customClass: {
        popup: "rounded-4xl shadow-lg",
        title: "text-sm font-bold text-white",
        htmlContainer: "text-xs text-white opacity-90",
      },
    });
  } finally {
    isProcessing.value = false;
  }
};

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

  await fetchCart();
});
</script>

<template>
  <div
    class="h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col overflow-hidden"
  >
    <div class="flex-none flex flex-col items-center pt-6 pb-4 relative">
      <!-- timer session -->
      <div
        v-if="timerLeft"
        class="fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
      >
        <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
        <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
      </div>
      <img src="/assets/images/logo.webp" alt="teras-logo" class="h-16 object-contain" />
    </div>

    <div
      class="flex-1 bg-primary-dinein-bg rounded-t-[2.5rem] shadow-dinein-hard flex flex-col overflow-hidden"
    >
      <div class="flex-none p-6 pb-2 border-b border-gray-100">
        <button
          @click="router.back()"
          class="text-primary-dinein flex items-center gap-2 text-sm font-bold mb-4"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" />
          Kembali pilih menu
        </button>
        <div class="flex items-center justify-between">
          <h1 class="font-bold text-xl text-gray-800">Order List</h1>
          <span class="text-xs text-gray-400 font-medium"
            >{{ cart?.items?.length || 0 }} Items</span
          >
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-gray-50/30">
        <div
          v-if="isLoading"
          class="h-full flex flex-col items-center justify-center text-accent-dinein/40 gap-4"
        >
          <font-awesome-icon
            icon="fa-solid fa-spinner"
            class="text-3xl animate-spin text-primary-dinein"
          />
          <p class="text-sm font-bold">Memuat pesanan...</p>
        </div>

        <div
          v-else-if="!cart?.items?.length"
          class="h-full flex flex-col items-center justify-center text-gray-400"
        >
          <font-awesome-icon icon="fa-solid fa-cart-shopping" class="text-5xl mb-4 opacity-10" />
          <p class="font-bold">Keranjangmu kosong</p>
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="item in cart.items"
            :key="item.cart_item_id"
            class="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-gray-100"
          >
            <img
              :src="item.menu.menu_image || '/assets/images/teras-menu-template.webp'"
              class="w-20 h-20 object-cover rounded-xl shrink-0"
            />
            <div class="flex flex-col flex-1 justify-between min-w-0">
              <div>
                <h2 class="font-bold text-sm text-gray-800 truncate">{{ item.menu.menu_name }}</h2>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="opt in item.options"
                    :key="opt.detail_option_id"
                    class="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500"
                  >
                    {{ opt.option_value.option_value }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <p class="font-bold text-primary-dinein text-sm">Rp{{ formatPrice(item.price) }}</p>
                <div
                  class="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100"
                >
                  <button
                    @click="updateQty(item.cart_item_id, 'minus')"
                    class="w-6 h-6 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <font-awesome-icon
                      :icon="item.qty > 1 ? 'fa-solid fa-minus' : 'fa-solid fa-trash'"
                      class="text-[10px] text-red-400"
                    />
                  </button>
                  <span class="text-xs font-bold w-4 text-center">{{ item.qty }}</span>
                  <button
                    @click="updateQty(item.cart_item_id, 'add')"
                    class="w-6 h-6 flex items-center justify-center bg-primary-dinein text-white rounded-md shadow-sm active:scale-90 transition-all"
                  >
                    <font-awesome-icon icon="fa-solid fa-plus" class="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="cart?.items?.length > 0"
        class="flex-none p-6 bg-white border-t border-gray-100 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]"
      >
        <div class="flex flex-col gap-2 mb-4">
          <div class="flex justify-between items-center text-gray-400 text-xs">
            <span>Subtotal</span>
            <span>Rp{{ formatPrice(totalPrice) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-700">Total Pembayaran</span>
            <span class="text-xl font-black text-primary-dinein"
              >Rp{{ formatPrice(totalPrice) }}</span
            >
          </div>
        </div>

        <button
          @click="handleFinalCheckout"
          :disabled="isProcessing"
          class="w-full bg-primary-dinein text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-dinein/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
        >
          <font-awesome-icon v-if="isProcessing" icon="fa-solid fa-spinner" class="animate-spin" />
          <span>{{ isProcessing ? "Memproses..." : "Pesan Sekarang" }}</span>
          <font-awesome-icon
            v-if="!isProcessing"
            icon="fa-solid fa-chevron-right"
            class="text-xs"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar mini di sisi kanan agar user tahu area tersebut bisa di-scroll */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px; /* Sangat tipis */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0; /* Warna abu muda (gray-200) */
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1; /* Sedikit lebih gelap saat di-hover */
}

/* Untuk Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
</style>
