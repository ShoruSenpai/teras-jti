<script setup>
import { computed } from "vue";

const props = defineProps(["menus", "selectedCategory", "isLoading"]);

const groupedMenus = computed(() => {
  if (!props.selectedCategory) return props.menus;

  const baseMenus = props.menus.filter((menu) => menu.category_id === props.selectedCategory);

  const groups = [
    {
      label: "Menu Baru!",
      items: baseMenus.filter((m) => m.is_new && m.status === "available"),
    },
    {
      label: "Menu Paling Rekomendasi!",
      items: baseMenus.filter((m) => m.is_recommended && m.status === "available"),
    },
    {
      label: "Menu",
      items: baseMenus.filter((m) => !m.is_new && !m.is_recommended && m.status === "available"),
    },
    {
      label: "Menu Habis",
      items: baseMenus.filter((m) => m.status === "sold_out"),
    },
  ];

  return groups.filter((groups) => groups.items.length > 0);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};
</script>

<template>
  <div class="flex flex-col gap-10 pb-10">
    <div v-for="group in groupedMenus" :key="group.label" class="flex flex-col gap-6">
      <div class="flex items-center gap-4 text-accent-dinein/60 px-2">
        <div class="h-px flex-1 bg-accent-dinein/30"></div>
        <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">
          {{ group.label }}
        </span>
        <div class="h-px flex-1 bg-accent-dinein/30"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-accent-dinein">
        <div
          v-for="menu in group.items"
          :key="menu.menu_id"
          :class="[
            'bg-primary-container-dinein-bg rounded-2xl shadow-dinein-card p-3 flex gap-4 items-center border border-primary-dinein/10 relative overflow-hidden transition-all',
            menu.status === 'sold_out' ? 'opacity-80 grayscale-[0.5]' : 'active:scale-95',
          ]"
        >
          <img
            :src="menu.menu_image || '/assets/images/teras-menu-template.webp'"
            @error="(e) => (e.target.src = '/assets/images/teras-menu-template.webp')"
            loading="lazy"
            class="w-28 h-28 sm:h-30 sm:w-30 md:h-35 md:w-35 object-cover rounded-xl shadow-dinein-soft border border-accent-dinein/30"
          />

          <div class="flex flex-col flex-1 gap-2 h-full justify-between py-2">
            <div class="flex flex-col gap-1 md:pr-4">
              <h1 class="font-semibold text-sm sm:text-lg md:text-xl">
                {{ menu.menu_name }}
              </h1>
              <p class="text-xs sm:text-md md:text-md opacity-70 line-clamp-2">
                {{ menu.menu_description }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="h-px bg-accent-dinein/20 my-1"></div>
              <div class="flex justify-between items-center">
                <p class="font-semibold text-xs sm:text-md md:text-lg">
                  Rp{{ formatPrice(menu.menu_price) }},00
                </p>
                <font-awesome-icon
                  @click="!isLoading && $emit('addCart', menu)"
                  v-if="menu.status === 'available'"
                  icon="fa-solid fa-shopping-cart"
                  :class="[
                    'text-md text-primary-dinein cursor-pointer p-2  transition-transform',
                    isLoading ? ' opacity-50 cursor-not-allowed' : 'active:scale-125',
                  ]"
                />
              </div>
            </div>
          </div>

          <div
            v-if="menu.status === 'sold_out'"
            class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 pointer-events-auto"
          >
            <div class="border-2 border-white/40 px-4 py-1 rounded-full rotate-[-10deg] shadow-xl">
              <span
                class="text-white font-black italic uppercase tracking-widest text-lg md:text-2xl"
              >
                Sold Out
              </span>
            </div>
            <p class="text-white/60 text-[10px] mt-2 font-medium">Menu sedang tidak tersedia</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
