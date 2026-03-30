const CACHE_NAME = 'cop-usd-cache-v2';

// Fix 1: Removed icon.svg and icon-192.png from here. No external images!
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Fix 2: Bypass Service Worker for API calls. 
    // This allows your HTML's fetch().catch() block to actually detect when the user is offline!
    if (event.request.url.includes('api') || event.request.url.includes('exchangerate')) {
        return; 
    }

    // Cache-First strategy for the HTML and Manifest files
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
