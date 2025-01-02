export const globDirectory = './build/';
export const globPatterns = ['**/*.{html,js,css,png,jpg,json}'];
export const swDest = './build/service-worker.js';
export const runtimeCaching = [
    {
        urlPattern: /^https:\/\/api\.yourdomain\.com\//,
        handler: 'NetworkFirst',
        options: {
            cacheName: 'api-cache',
            expiration: {
                maxAgeSeconds: 60 * 60, // 1 hour
            },
        },
    },
    {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
            cacheName: 'html-cache',
        },
    },
    {
        urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
        handler: 'StaleWhileRevalidate',
        options: {
            cacheName: 'static-resources',
        },
    },
];
