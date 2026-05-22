<script setup>
import { ref, onMounted } from "vue";
import { saveStepPersonalData, getPersonalData } from "@/api/reservation";
import Swal from "sweetalert2";

const emit = defineEmits(["submit-success"]);

const isFetching = ref(true);

const formData = ref({
  customer_name: "",
  customer_phone: "",
  guest_count: "",
  reservation_time: "",
  reservation_duration: "",
});

const nameInput = ref(null);
const phoneInput = ref(null);
const guestInput = ref(null);
const timeInput = ref(null);
const durationInput = ref(null);

onMounted(async () => {
  try {
    const res = await getPersonalData();
    if (res.success && res.data) {
      formData.value = res.data;
    }
  } catch (err) {
    console.error("Gagal memuat data sebelumnya", err);
  } finally {
    isFetching.value = false;
  }
});

const focusNext = (nextElementRef) => {
  if (nextElementRef) {
    nextElementRef.focus();
  }
};

const submitForm = async () => {
  if (
    !formData.value.customer_name ||
    !formData.value.customer_phone ||
    !formData.value.reservation_time ||
    !formData.value.guest_count ||
    !formData.value.reservation_duration
  ) {
    Swal.fire({
      icon: "warning",
      title: "Data Belum Lengkap",
      text: "Mohon isi semua data diri dan waktu reservasi.",
    });
    return;
  }

  Swal.fire({
    title: "Menyimpan...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const res = await saveStepPersonalData(formData.value);

    if (res.success) {
      Swal.close();
      emit("submit-success");
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.response?.data?.message || "Gagal menyimpan data diri.",
    });
  }
};

defineExpose({
  submitForm,
});
</script>

<template>
  <div class="flex flex-col gap-6 items-center mt-8 px-6">
    <h1 class="font-bold text-2xl text-accent-reservation">Lengkapi Data Diri</h1>

    <div
      class="bg-white w-full max-w-md rounded-3xl p-6 shadow-reservation-card relative overflow-hidden"
    >
      <div
        v-if="isFetching"
        class="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center transition-all"
      >
        <font-awesome-icon
          icon="fa-solid fa-spinner"
          class="animate-spin text-3xl text-accent-reservation mb-2"
        />
        <span class="text-accent-reservation font-bold text-sm">Menyiapkan form...</span>
      </div>

      <h2
        class="text-center font-bold text-lg text-accent-reservation border-b border-gray-200 pb-3 mb-5"
      >
        Data Diri
      </h2>

      <div class="flex flex-col gap-4 relative z-10">
        <div>
          <label class="block text-accent-reservation font-bold text-sm mb-2">Nama</label>
          <input
            v-model="formData.customer_name"
            ref="nameInput"
            @keyup.enter="focusNext(phoneInput)"
            type="text"
            class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold"
          />
        </div>

        <div>
          <label class="block text-accent-reservation font-bold text-sm mb-2">No.hp</label>
          <input
            v-model="formData.customer_phone"
            ref="phoneInput"
            @keyup.enter="focusNext(guestInput)"
            type="tel"
            class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-accent-reservation font-bold text-sm mb-2">Jmlh Orang</label>
            <input
              v-model="formData.guest_count"
              ref="guestInput"
              @keyup.enter="focusNext(timeInput)"
              type="number"
              class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold"
            />
          </div>
          <div>
            <label class="block text-accent-reservation font-bold text-sm mb-2"
              >Waktu Check-in</label
            >
            <input
              v-model="formData.reservation_time"
              ref="timeInput"
              @keyup.enter="focusNext(durationInput)"
              type="time"
              class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold"
            />
          </div>
        </div>

        <div>
          <label class="block text-accent-reservation font-bold text-sm mb-2">Durasi (Jam)</label>
          <input
            v-model="formData.reservation_duration"
            ref="durationInput"
            @keyup.enter="submitForm"
            type="number"
            placeholder="Misal: 2"
            class="w-full bg-[#F5EBE1] text-accent-reservation px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-reservation/50 transition-all font-semibold"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
