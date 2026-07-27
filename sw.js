/* CAUFA LEAGUE eFOOTBALL 26 - Network-First PWA Service Worker with Auto-Update Engine */

const CACHE_NAME = 'caufa-league-v4.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './assets/logo.png'
];

// Message Event Handler for Immediate Update Activation
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Install Event - Precache core app shell assets & skip waiting
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('PWA Precache Warning:', err))
  );
});

// Activate Event - Purge old caches & claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Fetch Strategy with Cache Fallback for Always-Fresh Updates
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  // Always attempt fresh network fetch first
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (Offline / Slow Connection): Fallback to cached snapshot
        return caches.match(e.request).then((cachedResponse) => {
          return cachedResponse || caches.match('./index.html') || caches.match('./');
        });
      })
  );
});
