const CACHE_NAME = 'eukrasia-v1';

// Core shell files that should always be cached
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install: Cache core shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching core shell');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch: Network-first for API, Cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // API calls: Network only (don't cache dynamic data)
    if (url.pathname.startsWith('/api')) {
        event.respondWith(fetch(request));
        return;
    }

    // Static assets: Cache-first with network fallback
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request).then((networkResponse) => {
                    // Cache successful responses for static assets
                    if (networkResponse.ok && url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Offline fallback for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});
