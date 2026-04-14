<script setup>
import { computed } from "vue";

const props = defineProps(["menus", "selectedCategory"]);
const emit = defineEmits(["changeCategory"]);

const category = computed(() => {
  const map = new Map();

  props.menus.forEach((menu) => {
    if (menu.category) {
      map.set(menu.category.category_id, menu.category);
    }
  });

  return Array.from(map.values());
});
</script>

<template>
  <div
    class="flex overflow-x-auto overflow-hidden px-2 py-4 gap-3 text-on-primary-container font-semibold md:justify-center shadow-l-"
  >
    <button
      :class="[
        'px-6 py-1 rounded-full whitespace-nowrap flex shrink-0 text-sm md:text-lg shadow-dinein-card transition active:scale-95',
        props.selectedCategory === cat.category_id ? 'bg-accent-dinein' : 'bg-secondary-dinein',
      ]"
      v-for="cat in category"
      :key="cat.category_id"
      @click="emit('changeCategory', cat.category_id)"
    >
      {{ cat.category_name }}
    </button>
  </div>
</template>
