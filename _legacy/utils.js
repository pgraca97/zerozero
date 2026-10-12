export function announceToScreenReader(message) {
  const el = document.getElementById('game-announcer');
  if (el) {
    el.textContent = '';
    setTimeout(() => { el.textContent = message; }, 50);
  }
}
