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

      // Simpan pengali ke dalam variabel supaya kode lebih mudah dibaca
      const msPerSecond = 1000;
      const msPerMinute = msPerSecond * 60;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerMonth = msPerDay * 30; // Asumsi rata-rata 30 hari
      const msPerYear = msPerDay * 365; // Asumsi 365 hari

      // Hitung masing-masing unit waktu
      const years = Math.floor(distance / msPerYear);
      const months = Math.floor((distance % msPerYear) / msPerMonth);
      const days = Math.floor((distance % msPerMonth) / msPerDay);
      const hours = Math.floor((distance % msPerDay) / msPerHour);
      const minute = Math.floor((distance % msPerHour) / msPerMinute);
      const second = Math.floor((distance % msPerMinute) / msPerSecond);

      // Format tampilan berdasarkan sisa waktu
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
