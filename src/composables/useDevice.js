import { ref, onMounted } from "vue";
import { isMobile } from "@/utils/deviceDetect";

export function useDevice() {
  const mobile = ref(false);

  onMounted(() => {
    mobile.value = isMobile();
  });

  return {
    mobile,
  };
}
