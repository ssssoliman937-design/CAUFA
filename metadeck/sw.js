// =========================================================
//  MetaDeck — Service Worker (PWA app-shell cache)
//  sw.js
// =========================================================

const CACHE_NAME = 'metadeck-shell-v1';

const SHELL_FILES = [
  './index.html',
  './dashboard.html',
  './admin.html',
  './preview.html',
  './compare.html',
  './styles.css',
  './dashboard.css',
  './admin.css',
  './compare.css',
  './app.js',
  './dashboard.js',
  './admin.js',
  './preview.js',
  './compare.js',
  './ovrCalculator.js',
  './playerCard.js',
  './skillsData.js',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for our own static shell files only — every other request
// (Firebase Auth/Firestore, CDN fonts, everything cross-origin) goes
// straight to the network untouched.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
