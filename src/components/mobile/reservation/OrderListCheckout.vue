<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update-qty"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};
</script>

<template>
  <div class="px-6">
    <div
      :class="[
        'bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 transition-opacity duration-300',
        isLoading ? 'opacity-50 pointer-events-none' : '',
      ]"
    >
      <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">Order List</h2>

      <div class="flex flex-col gap-4">
        <div v-for="item in items" :key="item.id" class="flex items-center gap-4">
          <img
            :src="item.image || '/assets/images/teras-menu-template.webp'"
            class="w-16 h-16 object-cover rounded-xl shrink-0 border border-gray-100"
            alt="Menu Image"
          />

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-800 text-sm truncate">{{ item.name }}</h3>
            <p class="font-bold text-accent-reservation text-sm mt-1">
              Rp{{ formatPrice(item.price) }}
            </p>
          </div>

          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
            <button
              @click="emit('update-qty', item.id, 'minus')"
              :disabled="isLoading"
              class="w-8 h-full bg-accent-reservation/20 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors font-bold disabled:opacity-50"
            >
              <font-awesome-icon
                v-if="item.qty === 1"
                icon="fa-solid fa-trash"
                class="text-[10px] text-red-800"
              />
              <span v-else>-</span>
            </button>

            <div class="w-8 h-full flex items-center justify-center font-bold text-sm bg-white">
              <font-awesome-icon
                v-if="isLoading"
                icon="fa-solid fa-spinner"
                class="animate-spin text-[10px] text-gray-400"
              />
              <span v-else>{{ item.qty }}</span>
            </div>

            <button
              @click="emit('update-qty', item.id, 'plus')"
              :disabled="item.qty >= item.stock || isLoading"
              :class="[
                'w-8 h-full flex items-center justify-center font-bold transition-colors',
                item.qty >= item.stock || isLoading
                  ? 'bg-accent-reservation/10 text-gray-400 cursor-not-allowed'
                  : 'bg-accent-reservation/20 text-gray-600 hover:bg-gray-100 active:bg-gray-200',
              ]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
