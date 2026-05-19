export function useTimer() {
  let interval = null;

  const startTimer = (expiryTime, onTick, onExpire) => {
    const target = new Date(expiryTime).getTime();

    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        if (onTick) onTick('00:00');
        if (onExpire) onExpire();
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

      let timeString = '';

      if (years > 0) {
        timeString = `${years} thn ${months} bln ${days} hari ${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      } else if (months > 0) {
        timeString = `${months} bln ${days} hari ${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      } else if (days > 0) {
        timeString = `${days} hari ${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      } else if (hours > 0) {
        timeString = `${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      } else {
        timeString = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      }

      // Jalankan callback untuk mengupdate UI
      if (onTick) onTick(timeString);
    }, 1000);
  };

  const stopTimer = () => {
    if (interval) clearInterval(interval);
  };

  return {
    startTimer,
    stopTimer,
  };
}
