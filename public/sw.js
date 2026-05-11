const CACHE_NAME = 'incubapp-cache-v2';
const OFFLINE_URL = '/offline.html';

// Real assets are handled by the browser's normal cache
// We only pre-cache the absolute essentials for offline fallback
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => console.log('Offline cache partially failed'));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET, Firebase/Google APIs
  if (
    event.request.method !== 'GET' || 
    url.hostname.includes('googleapis.com') || 
    url.hostname.includes('firebase')
  ) {
    return;
  }

  // Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for future offline use
        if (response.status === 200 && event.request.mode === 'navigate') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || (event.request.mode === 'navigate' ? caches.match('/') : null);
        });
      })
  );
});
