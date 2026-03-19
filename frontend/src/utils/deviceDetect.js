export function isMobile() {
  const width = window.innerWidth;

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const isTabletUA = /iPad|Tablet|Android/i.test(navigator.userAgent);

  return width <= 1024 && (isTouch || isTabletUA);
}
