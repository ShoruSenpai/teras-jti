<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMenus } from "@/api/menuApi";
import { useTimer } from "@/composables/useTimer";
import { validateSession } from "@/services/sessionService";
import { addToCart, getCartSummary } from "@/api/cart";

import BannerCarousel from "@/components/mobile/BannerCarousel.vue";
import CategorySlider from "@/components/mobile/CategorySlider.vue";
import MenuList from "@/components/mobile/MenuList.vue";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const { timerLeft, isExpired, startTimer } = useTimer();

const errorMessage = ref("");
const menus = ref([]);
const selectedCategory = ref(null);
const showModal = ref(false);
const selectedMenu = ref(null);
const selectedOptions = ref({});
const cartTotal = ref(0);
const cartCount = ref(0);
const auth = useAuthStore();
const isSubmiting = ref(false);
const isLoading = ref(false);

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const handleAddToCart = (menu) => {
  if (menu.option_group && menu.option_group.length > 0) {
    selectedMenu.value = menu;
    selectedOptions.value = {};
    showModal.value = true;
  } else {
    executeAddToCart(menu.menu_id, []);
  }
};

const selectOption = (groupId, optionId) => {
  selectedOptions.value[groupId] = optionId;
};

const confirmAdd = () => {
  const optionArray = Object.values(selectedOptions.value);
  executeAddToCart(selectedMenu.value.menu_id, optionArray);
};

const executeAddToCart = async (menuId, options = []) => {
  if (isSubmiting.value) return;

  isSubmiting.value = true;
  try {
    await addToCart(menuId, options);

    showModal.value = false;
    isLoading.value = true;
    await getCartPreview();
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Oops...",
      icon: "error",
      text: err || "Gagal menambahkan pesanan.",
      showConfirmButton: false,
      iconColor: "#f4f9fc",
      background: "#2bb3e6",
      timer: 5000,
      position: "top",
    });
  } finally {
    isSubmiting.value = false;
    isLoading.value = false;
  }
};

const getCartPreview = async () => {
  try {
    const res = await getCartSummary();

    cartCount.value = res.total_items || 0;
    cartTotal.value = res.total_price || 0;
  } catch (err) {
    console.error(err);
  }
};

const goToCheckout = () => {
  router.push(`/dine-in/${route.params.token}/menu/checkout`);
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
    auth.setToken(token, "dine-in");

    const sessionData = await validateSession();
    if (sessionData.success && sessionData.expired_at) {
      startTimer(sessionData.expired_at);
    }

    const data = await getMenus();
    const result = data.data || data;
    menus.value = Array.isArray(result) ? result : [];
    if (menus.value.length > 0) {
      selectedCategory.value = menus.value[0].category_id;
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

  await getCartPreview();
});
</script>

<template>
  <div
    class="min-h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col items-center"
  >
    <!-- timer session -->
    <div
      v-if="timerLeft"
      class="fixed top-4 right-4 z-50 bg-primary-dinein-card/40 backdrop-blur-md border border-primary-container-dinein-bg/50 px-4 py-2 rounded-full text-on-primary-container shadow-lg flex items-center gap-2"
    >
      <span class="text-xs uppercase font-semibold opacity-80 md:text-md">Sisa Waktu:</span>
      <span class="text-sm font-bold md:text-lg">{{ timerLeft }}</span>
    </div>

    <!-- logo -->
    <div class="mx-auto py-6 sm:py-8 md:py-12">
      <img src="/assets/images/logo.webp" alt="teras-logo" class="h-20 sm:h-28 md:h-34" />
    </div>

    <!-- content -->
    <div
      class="bg-primary-dinein-bg py-10 px-6 w-full flex flex-col rounded-t-4xl gap-6 shadow-dinein-hard flex-1"
    >
      <BannerCarousel />
      <CategorySlider
        :menus="menus"
        :selectedCategory="selectedCategory"
        @changeCategory="selectedCategory = $event"
      />
      <MenuList
        :menus="menus"
        :selectedCategory="selectedCategory"
        :isLoading="isSubmiting"
        @add-cart="handleAddToCart"
      />
    </div>

    <!-- checkout button -->
    <div v-if="cartCount > 0" class="fixed bottom-6 left-6 right-6 z-50 animate-bounce-in">
      <div
        class="bg-primary-dinein/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 flex justify-between items-center"
      >
        <div class="flex flex-col text-white">
          <span v-if="!isLoading" class="text-[10px] uppercase font-bold tracking-wider opacity-80"
            >{{ cartCount }} Pesanan</span
          >
          <span v-else class="text-[10px] uppercase font-bold tracking-wider opacity-80">
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
          </span>
          <span class="text-lg font-bold">Rp{{ formatPrice(cartTotal) }},00</span>
        </div>

        <button
          @click="goToCheckout"
          class="bg-white text-primary-dinein px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform"
        >
          Checkout
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-xs" />
        </button>
      </div>
    </div>

    <!-- modal -->
    <div
      v-if="showModal"
      @click.self="showModal = false"
      class="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-6"
    >
      <div class="relative bg-white w-full rounded-3xl p-6 animate-slide-up">
        <h2 class="text-xl font-bold mb-4">{{ selectedMenu.menu_name }}</h2>
        <button
          @click="showModal = false"
          class="absolute right-6 top-6 w-8 h-8 flex items-center justify-center text-accent-dinein/60 rounded-full active:scale-90 transition-transform"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>

        <div v-for="group in selectedMenu.option_group" :key="group.option_group_id" class="mb-4">
          <p class="font-semibold text-gray-700 mb-2">{{ group.option_group_name }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in group.options"
              :key="opt.option_value_id"
              @click="selectOption(group.option_group_id, opt.option_value_id)"
              :class="[
                'px-4 py-2 rounded-xl border transition-all text-sm',
                selectedOptions[group.option_group_id] === opt.option_value_id
                  ? 'bg-primary-dinein text-white border-primary-dinein shadow-lg scale-105'
                  : 'border-gray-200 text-gray-600 bg-gray-50',
              ]"
            >
              {{ opt.option_value }}
              <span v-if="opt.extra_price > 0" class="text-[10px] block opacity-80">
                +Rp{{ opt.extra_price }}
              </span>
            </button>
          </div>
        </div>

        <button
          @click="confirmAdd"
          :disabled="isSubmiting"
          class="w-full bg-primary-dinein text-white py-4 rounded-2xl font-bold"
        >
          {{ isSubmiting ? "Menambahkan..." : "Tambahkan ke Keranjang" }}
        </button>
      </div>
    </div>
  </div>
</template>
