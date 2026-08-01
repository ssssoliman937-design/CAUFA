// Registers the MetaDeck service worker so the app installs as a PWA
// (Add to Home Screen, fullscreen, cached app shell for slow connections).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
