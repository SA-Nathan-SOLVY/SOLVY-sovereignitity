const CACHE_NAME = 'solvy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/SolvyLogo-1024.png',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png',
  '/assets/index-DOxYx_4F.js',
  '/assets/index-7QugARGc.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
