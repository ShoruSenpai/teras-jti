<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const breadcrumbs = computed(() => {
  return route.meta.stepName || "Teras JTI";
});
</script>

<template>
  <div
    class="p-4 w-full flex items-center flex-wrap gap-2 text-sm font-medium text-primary-reservation-bg bg-primary-reservation"
  >
    <div
      v-for="(step, index) in breadcrumbs"
      :key="index"
      class="flex mt-4 items-center gap-2 text-xs"
    >
      <span class="opacity-70">/</span>
      <span
        :class="{
          'font-semibold opacity-100': index === breadcrumbs.length - 1,
          'opacity-70': index !== breadcrumbs.length - 1,
        }"
        >{{ step }}</span
      >
    </div>
  </div>
</template>
