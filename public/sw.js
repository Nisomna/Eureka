const CACHE_NAME = 'incubapp-all-v1';
const DATA_CACHE_NAME = 'app-notif-v1';
const STORE_URL = '/app-notif-data';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

async function loadNotifications() {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const resp = await cache.match(STORE_URL);
    if (resp) return await resp.json();
  } catch {}
  return [];
}

async function saveNotifications(list) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    await cache.put(STORE_URL, new Response(JSON.stringify(list), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch {}
}

const pendingTimers = new Map();

function scheduleNotif(notif) {
  const delay = notif.scheduledAt - Date.now();
  if (delay <= 0) return; 

  if (pendingTimers.has(notif.id)) clearTimeout(pendingTimers.get(notif.id));

  const timer = setTimeout(async () => {
    pendingTimers.delete(notif.id);

    try {
      await self.registration.showNotification(notif.title, {
        body: notif.message || '',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: notif.id,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: { notifId: notif.id },
      });
    } catch (e) {}

    const all = await loadNotifications();
    let updated;
    if (notif.repeatMinutes != null) {
      updated = all.map(n => n.id === notif.id ? { ...n, scheduledAt: n.scheduledAt + notif.repeatMinutes * 60_000 } : n);
      const refreshed = updated.find(n => n.id === notif.id);
      if (refreshed) scheduleNotif(refreshed);
    } else if (notif.repeat === 'none') {
      updated = all.map(n => n.id === notif.id ? { ...n, fired: true } : n);
    } else {
      const delta = notif.repeat === 'daily' ? 86_400_000 : 604_800_000;
      updated = all.map(n => n.id === notif.id ? { ...n, scheduledAt: n.scheduledAt + delta } : n);
      const refreshed = updated.find(n => n.id === notif.id);
      if (refreshed) scheduleNotif(refreshed);
    }
    await saveNotifications(updated);

    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'NOTIFICATION_FIRED', notifId: notif.id });
    }
  }, delay);

  pendingTimers.set(notif.id, timer);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(err => console.warn('PWA: Some assets failed to cache', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== DATA_CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
      
      // Re-programar alarmas
      const notifications = await loadNotifications();
      const now = Date.now();
      for (const n of notifications) {
        if (!n.fired && n.scheduledAt > now) scheduleNotif(n);
      }
    })()
  );
});

self.addEventListener('message', event => {
  const { type, notification, notifId } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATION') {
    (async () => {
      const all = await loadNotifications();
      const updated = all.filter(n => n.id !== notification.id);
      updated.push(notification);
      await saveNotifications(updated);
      scheduleNotif(notification);
    })();
  }

  if (type === 'CANCEL_NOTIFICATION') {
    if (pendingTimers.has(notifId)) {
      clearTimeout(pendingTimers.get(notifId));
      pendingTimers.delete(notifId);
    }
    (async () => {
      const all = await loadNotifications();
      await saveNotifications(all.filter(n => n.id !== notifId));
    })();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (
    event.request.method !== 'GET' || 
    url.hostname.includes('googleapis.com') || 
    url.hostname.includes('firebase')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
