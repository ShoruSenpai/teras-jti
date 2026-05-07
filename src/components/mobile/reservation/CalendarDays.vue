<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import {
  addMonths,
  subMonths,
  isSameMonth,
  differenceInMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  startOfTomorrow,
} from "date-fns";

const emit = defineEmits(["select-date"]);
const route = useRoute();

const viewDate = ref(new Date());
const today = new Date();
const tomorow = startOfTomorrow();

const monthAvailability = ref({});
const isLoadingMonth = ref(false);

const isPrevDisable = computed(() => {
  return isSameMonth(viewDate.value, today);
});
const isNextDisable = computed(() => {
  return differenceInMonths(viewDate.value, today) >= 3;
});

const fetchMonthData = async () => {
  isLoadingMonth.value = true;
  const monthStr = format(viewDate.value, "yyyy-MM");
};

const handleNext = () => {
  if (!isNextDisable.value) viewDate.value = addMonths(viewDate.value, 1);
};

const handlePrev = () => {
  if (!isPrevDisable.value) viewDate.value = subMonths(viewDate.value, 1);
};

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(viewDate.value), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(viewDate.value), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return days.map((day) => ({
    date: day,
    dateString: format(day, "yyyy-MM-dd"),
    isCurrentMonth: isSameMonth(day, viewDate.value),
    isReserved: reservedDates.value.includes(format(day, "yyyy-MM-dd")),
    isPast: day < today && !isSameMonth(day, today),
  }));
});
</script>

<template>
  <div data-component="calendar-container" class="w-full p-6 flex flex-col gap-3 font-[quicksand]">
    <div class="bg-secondary-reservation-bg p-3 rounded-xl shadow-reservation-card">
      <!-- button handle -->
      <div class="flex gap-6 w-full justify-center items-center text-accent-reservation">
        <button
          @click="handlePrev"
          :disabled="isPrevDisable"
          :class="{ 'opacity-20': isPrevDisable }"
          class="text-3xl"
        >
          &lt;
        </button>
        <div class="flex flex-col items-center justify-center">
          <h2 class="font-bold text-lg">{{ format(viewDate, "MMMM") }}</h2>
          <h2 class="font-semibold text-xs">{{ format(viewDate, "yyyy") }}</h2>
        </div>
        <button
          @click="handleNext"
          :disabled="isNextDisable"
          :class="{ 'opacity-20': isNextDisable }"
          class="text-3xl"
        >
          &gt;
        </button>
      </div>
      <!-- month grid -->
      <div class="grid grid-cols-7 text-center gap-2 mt-6">
        <div
          v-for="dayName in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']"
          :key="dayName"
          class="text-accent-reservation font-semibold"
        >
          {{ dayName }}
        </div>
        <button
          v-for="day in calendarDays"
          :key="day.dateString"
          @click="openAreaPopup(day)"
          :disabled="day.isReserved || !day.isCurrentMonth"
          :class="[
            'aspect-square rounded-xl flex items-center justify-center font-semibold transition-all',
            day.isCurrentMonth
              ? 'bg-accent-reservation text-on-primary-container'
              : 'bg-accent-reservation text-on-primary-container/50',
            day.isReserved
              ? 'bg-accent-reservation/80 text-on-primary-container/60 cursor-not-allowed'
              : 'hover:scale-105 active:bg-primary-container-reservation-bg',
          ]"
        >
          {{ format(day.date, "d") }}
        </button>
      </div>
    </div>
    <div>
      <p class="font-medium text-xs text-accent-reservation">
        * Klik tanggal untuk melihat area reservasi.
      </p>
    </div>
  </div>
</template>
