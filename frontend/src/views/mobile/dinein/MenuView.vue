<script setup>
import BannerCarousel from "@/components/mobile/BannerCarousel.vue";
import CategorySlider from "@/components/mobile/CategorySlider.vue";
import MenuList from "@/components/mobile/MenuList.vue";
</script>

<template>
  <div
    class="min-h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col items-center"
  >
    <!-- logo -->
    <div class="mx-auto py-6">
      <img src="/assets/images/logo.webp" alt="teras-logo" class="h-20" />
    </div>

    <!-- content -->
    <div
      class="bg-primary-dinein-bg py-10 px-6 w-full flex flex-col rounded-t-4xl gap-6 shadow-dinein-hard flex-1"
    >
      <BannerCarousel />
      <CategorySlider />
      <MenuList />
    </div>
  </div>
</template>
