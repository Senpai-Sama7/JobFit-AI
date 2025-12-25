// Service Worker for JobFit AI - Progressive Web App
const CACHE_NAME = 'jobfit-ai-v1.0.0';
const RUNTIME_CACHE = 'jobfit-ai-runtime';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/jobfit-ai_1751931220341.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                  return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the fetched resource
                cache.put(event.request, responseToCache);

                return response;
              })
              .catch(() => {
                // Fallback for offline - return a custom offline page if available
                if (event.request.mode === 'navigate') {
                  return caches.match('/index.html');
                }
              });
          });
      })
  );
});

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-resume') {
    event.waitUntil(syncResume());
  }
});

async function syncResume() {
  // Placeholder for syncing resume data when back online
  console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/jobfit-ai_1751931220341.png',
    badge: '/jobfit-ai_1751931220341.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('JobFit AI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
