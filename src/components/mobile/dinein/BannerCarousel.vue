<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { getbanners } from "@/api/bannerApi";

const current = ref(0);
const startX = ref(0);
const isDragging = ref(false);
const isInteracting = ref(false);
const banners = ref([]);
const isLoading = ref(true);
let interval = null;
let manualTimeout = null;

// get banners data
const loadBanners = async () => {
  try {
    const response = await getbanners();
    banners.value = response.data || [];
    // console.log(response);
    // console.log(banners.value);

    if (banners.value.length > 0) {
      startAutoSlide();
    }
  } catch (err) {
    console.error("Failed to fetch banners", err);
  } finally {
    isLoading.value = false;
  }
};

const next = () => {
  if (banners.value.length === 0) return;
  current.value = (current.value + 1) % banners.value.length;
};

const prev = () => {
  if (banners.value.length === 0) return;
  current.value = (current.value - 1 + banners.value.length) % banners.value.length;
};

// slide controls
const startAutoSlide = () => {
  stopAutoSlide();

  interval = setInterval(() => {
    if (!isInteracting.value) {
      next();
    }
  }, 3000);
};

const stopAutoSlide = () => {
  if (interval) clearInterval(interval);
  if (manualTimeout) clearInterval(manualTimeout);
};

// interaction handlers

const handleMouseEnter = () => {
  isInteracting.value = true;
  stopAutoSlide();
};

const handleMouseLeave = () => {
  isInteracting.value = false;
  startAutoSlide();
};

const handleManualInteraction = () => {
  stopAutoSlide();

  manualTimeout = setTimeout(() => {
    if (!isInteracting.value) startAutoSlide();
  }, 5000);
};

// Swipe handlers
const handleTouchStart = (e) => {
  startX.value = e.touches[0].clientX;
  isDragging.value = true;
};

const handleTouchEnd = (e) => {
  if (!isDragging.value) return;

  const endX = e.changedTouches[0].clientX;
  const diff = startX.value - endX;

  if (diff > 50) next();
  if (diff < -50) prev();

  isDragging.value = false;
};

// load function
onMounted(() => {
  loadBanners();
});

onBeforeMount(() => {
  stopAutoSlide();
});
</script>

<template>
  <div class="w-full max-w-lg mx-auto sm:w-md md:w-lg">
    <div
      class="group relative w-full aspect-2.5/1 rounded-2xl overflow-hidden shadow-dinein-semi border border-accent-dinein/40"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- SLIDES -->
      <div
        class="flex transition-transform duration-300 ease-in-out h-full"
        :style="{ transform: `translateX(-${current * 100}%)` }"
      >
        <div v-for="banner in banners" :key="banner.id" class="w-full shrink-0 h-full">
          <a :href="banner.link">
            <img
              :src="banner.image"
              loading="lazy"
              class="w-full h-full object-cover pointer-events-none"
            />
          </a>
        </div>
      </div>

      <!-- ARROW LEFT -->
      <button
        @click="
          prev();
          handleManualInteraction();
        "
        :class="[
          'absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-on-primary-container flex items-center justify-center p-2 rounded-full transition-all duration-300 z-10',
          isInteracting ? 'opacity-100 translate-x-0' : '',
          !isInteracting
            ? 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
            : '',
        ]"
      >
        <font-awesome-icon icon="fa-solid fa-left-long" class="text-xs" />
      </button>

      <!-- ARROW RIGHT -->
      <button
        @click="
          next();
          handleManualInteraction();
        "
        :class="[
          'absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-on-primary-container flex items-center justify-center p-2 rounded-full transition-all duration-300 z-10',
          isInteracting ? 'opacity-100 translate-x-0' : '',
          !isInteracting
            ? 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
            : '',
        ]"
      >
        <font-awesome-icon icon="fa-solid fa-right-long" class="text-xs" />
      </button>

      <!-- DOTS -->
      <div
        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2"
        @click="handleManualInteraction"
      >
        <button
          v-for="(b, index) in banners"
          :key="b.id"
          @click="current = index"
          class="w-2.5 h-2.5 rounded-full transition-all"
          :class="current === index ? 'bg-on-primary-container' : 'bg-on-primary-container/50'"
        />
      </div>
    </div>
  </div>
</template>

<!-- Kualitas	Ukuran
Minimum	1000 x 400
Ideal	1250 x 500
HD	1500 x 600 -->
