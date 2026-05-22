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

      const msPerSecond = 1000;
      const msPerMinute = msPerSecond * 60;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerMonth = msPerDay * 30;
      const msPerYear = msPerDay * 365;

      const years = Math.floor(distance / msPerYear);
      const months = Math.floor((distance % msPerYear) / msPerMonth);
      const days = Math.floor((distance % msPerMonth) / msPerDay);
      const hours = Math.floor((distance % msPerDay) / msPerHour);
      const minute = Math.floor((distance % msPerHour) / msPerMinute);
      const second = Math.floor((distance % msPerMinute) / msPerSecond);

      if (years > 0) {
        timerLeft.value = `${years} thn ${months} bln ${days} hari ${hours.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
      } else if (months > 0) {
        timerLeft.value = `${months} bln ${days} hari ${hours.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
      } else if (days > 0) {
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
