// Import Workbox from CDN or use npm
/* eslint-env serviceworker */
/* global workbox */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    const { precacheAndRoute } = workbox.precaching;
    const { registerRoute } = workbox.routing;
    const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
    const { ExpirationPlugin } = workbox.expiration;
    const { BackgroundSyncPlugin } = workbox.backgroundSync;

    const executionSyncPlugin = new BackgroundSyncPlugin('execution-queue', {
        maxRetentionTime: 24 * 60, // Retry for 24 hours
        onSync: async ({ queue }) => {
            queue.replayRequests(); 
            console.log('background sync ran.');
        }
    });

    // Ensure self.__WB_MANIFEST is defined and is an array
    if (!Array.isArray(self.__WB_MANIFEST)) {
        self.__WB_MANIFEST = [];
    }

    // Precache static assets (e.g., JS, CSS, images, etc.)
    precacheAndRoute(self.__WB_MANIFEST);

    // Cache /api/executions POST requests (use NetworkOnly strategy with BackgroundSyncPlugin)
    registerRoute(
        ({ url, request }) => {
            const isMatch = url.pathname.startsWith('/api/executions') && request.method === 'POST';
            console.log(`URL: ${url.pathname} and method: ${request.method} ${isMatch ? 'matched' : 'did not matched'} /api/executions POST for background sync`);
            return isMatch;
        },
        new NetworkOnly({
            plugins: [executionSyncPlugin], // Use Background Sync for failed requests
        }),
        'POST'
    );

    // Cache /api/user GET calls (use NetworkFirst strategy without BackgroundSyncPlugin)
    registerRoute(
        ({ url, request }) => url.pathname.startsWith('/api/user') && (request.method === 'GET'),
        new NetworkFirst({
            cacheName: 'api-user-cache',
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 60 * 60, // Cache for 1 hour
                }),
            ],
        })
    );

    // Cache API calls (use NetworkFirst strategy)
    registerRoute(
        ({ url, request }) => url.pathname.startsWith('/api') && (request.method === 'GET'),
        new NetworkFirst({
            cacheName: 'api-cache',
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 60 * 60, // Cache for 1 hour
                }),
            ],
        })
    );

    // Cache HTML documents (use NetworkFirst strategy)
    registerRoute(
        ({ request }) => request.destination === 'document',
        new NetworkFirst({
            cacheName: 'html-cache',
        })
    );

    // Cache static resources (use StaleWhileRevalidate strategy)
    registerRoute(
        ({ request }) => request.destination === 'script' || request.destination === 'style',
        new StaleWhileRevalidate({
            cacheName: 'static-resources',
        })
    );

    // Cache images (use CacheFirst strategy)
    registerRoute(
        ({ request }) => request.destination === 'image',
        new CacheFirst({
            cacheName: 'image-cache',
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50, // Limit number of cached images
                    maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 7 days
                }),
            ],
        })
    );

    // Cache manifest.json (use NetworkFirst strategy)
    registerRoute(
        ({ url }) => url.pathname === '/manifest.json',
        new NetworkFirst({
            cacheName: 'manifest-cache',
        })
    );

    // Listen for updates and prompt the user
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }
    });
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
