<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

defineProps({
  nextLabel: {
    type: String,
    default: "Next >",
  },
  finalLabel: {
    type: String,
    default: "Selesai",
  },
});

const emit = defineEmits(["triggerPopup"]);

const route = useRoute();
const router = useRouter();

const currentFlow = computed(() => route.meta.flow || []);
const currentIndex = computed(() => {
  if (currentFlow.value.length === 0) return -1;
  return currentFlow.value.indexOf(route.name);
});

const isFirstStep = computed(() => currentIndex.value === 0);
const isFinalStep = computed(() => currentIndex.value === currentFlow.value.length - 1);

const handleNext = () => {
  if (isFinalStep.value) {
    emit("triggerPopup");
  } else {
    const nextRoute = currentFlow.value[currentIndex.value + 1];
    router.push({ name: nextRoute });
  }
};

const handlePrev = () => {
  if (!isFirstStep.value) {
    const prevRoute = currentFlow.value[currentIndex.value - 1];
    router.push({ name: prevRoute });
  }
};
</script>

<template>
  <div class="fixed bottom-12 left-6 right-6 z-50">
    <div
      class="relative bg-primary-reservation/90 backdrop-blur-md border border-white/20 text-white shadow-reservation-card rounded-2xl py-3 px-4 flex justify-between"
      :class="isFirstStep ? 'justify-end' : ' justify-between'"
    >
      <button
        v-if="!isFirstStep"
        @click="handlePrev"
        class="bg-accent-reservation py-2 px-6 font-semibold text-lg rounded-xl"
      >
        &lt; Prev
      </button>
      <button
        @click="handleNext"
        class="bg-accent-reservation py-2 px-6 font-semibold text-lg rounded-xl"
      >
        {{ isFinalStep ? finalLabel : nextLabel }}
      </button>
    </div>
  </div>
</template>
