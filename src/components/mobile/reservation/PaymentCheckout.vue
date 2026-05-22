<script setup></script>

<template>
  <div class="px-6">
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-24">
      <h2 class="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">
        Payment Options
      </h2>

      <div class="flex flex-col gap-4">
        <div
          class="flex items-center gap-3 bg-accent-reservation/5 p-3 rounded-xl border border-accent-reservation/20"
        >
          <font-awesome-icon icon="fa-solid fa-qrcode" class="text-accent-reservation text-2xl" />
          <div>
            <span class="block text-gray-800 font-bold">QRIS / E-Wallet / Bank Transfer</span>
            <span class="block text-xs text-gray-500">Pembayaran aman via Midtrans</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
