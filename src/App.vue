<script setup>
import { onMounted } from "vue";
import { isMobile } from "./utils/deviceDetect";
import { useRouter } from "vue-router";

let currentMode = isMobile() ? "mobile" : "desktop";
const router = useRouter();

onMounted(() => {
  window.addEventListener("resize", () => {
    const newMode = isMobile() ? "mobile" : "desktop";

    if (newMode !== currentMode) {
      currentMode = newMode;
      // window.location.reload();
      if (newMode === "mobile") {
        router.replace("/");
      } else {
        router.replace("/desktop");
      }
    }
  });
});
</script>

<template>
  <RouterView />
</template>
