<script setup>
const PPNtax = 1000;

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const formatPrice = (price) => {
  if (price === undefined || price === null) return "0";
  return new Intl.NumberFormat("id-ID").format(price);
};
</script>

<template>
  <div class="px-6">
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
      <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">
        Order Summary
      </h2>

      <div class="flex flex-col gap-2 text-sm text-gray-600 border-b border-gray-200 pb-4 mb-4">
        <div class="flex justify-between items-center">
          <span>Biaya Area Tempat</span>
          <span
            :class="[
              'font-semibold text-gray-800',
              isLoading ? 'animate-pulse bg-gray-200 text-transparent rounded' : '',
            ]"
          >
            Rp{{ formatPrice(summary.areaPrice) }}
          </span>
        </div>

        <div v-if="summary.menuSubtotal > 0" class="flex justify-between items-center">
          <span>Subtotal Menu</span>
          <span
            :class="[
              'font-semibold text-gray-800',
              isLoading ? 'animate-pulse bg-gray-200 text-transparent rounded' : '',
            ]"
          >
            Rp{{ formatPrice(summary.menuSubtotal) }}
          </span>
        </div>

        <div class="flex justify-between items-center text-red-500" v-if="summary.discount > 0">
          <span>Diskon</span>
          <span
            :class="[
              'font-semibold',
              isLoading ? 'animate-pulse bg-red-200 text-transparent rounded' : '',
            ]"
          >
            -Rp{{ formatPrice(summary.discount) }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span>PPN</span>
          <span class="font-semibold text-gray-800">Rp{{ formatPrice(PPNtax) }}</span>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <span class="font-bold text-lg text-gray-800">Total</span>
        <span
          :class="[
            'font-black text-xl text-accent-reservation',
            isLoading ? 'animate-pulse bg-accent-reservation/20 text-transparent rounded' : '',
          ]"
        >
          Rp{{ formatPrice((summary.total || 0) + PPNtax) }}
        </span>
      </div>
    </div>
  </div>
</template>
