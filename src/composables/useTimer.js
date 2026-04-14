import { ref, onUnmounted } from "vue";

export function useTimer() {
  const timerLeft = ref("");
  const isExpired = ref(false);
  let interval = null;

  const startTimer = (expiryTime) => {
    const target = new Date(expiryTime).getTime();

    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        timerLeft.value = "00:00";
        isExpired.value = true;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const second = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        timerLeft.value = `${days} hari ${hours.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
      } else if (hours > 0) {
        timerLeft.value = `${hours.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
      } else {
        timerLeft.value = `${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
      }
    }, 1000);
  };

  onUnmounted(() => {
    clearInterval(interval);
  });

  return {
    timerLeft,
    isExpired,
    startTimer,
  };
}
