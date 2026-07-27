/* CAUFA LEAGUE eFOOTBALL 26 - Network-First PWA Service Worker for GitHub Pages */

const CACHE_NAME = 'caufa-league-v3.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './assets/logo.png'
];

// Install Event - Precache core app shell assets for smooth GitHub Pages & Offline loading
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('PWA Precache Warning:', err))
  );
});

// Activate Event - Purge old caches
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

// Network-First Fetch Strategy with Cache Fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
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
        // Network failed (Offline / Slow GitHub Pages): Serve cached snapshot
        return caches.match(e.request).then((cachedResponse) => {
          return cachedResponse || caches.match('./index.html') || caches.match('./');
        });
      })
  );
});
