var CACHE_NAME = 'cop-usd-v2';

// Use relative paths so it works on any subdirectory (like GitHub Pages)
var ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    var url = e.request.url;

    // Network-first for API calls (exchange rate)
    if (url.indexOf('exchangerate') !== -1) {
        e.respondWith(
            fetch(e.request)
                .then(function(response) {
                    // Cache the latest API response
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                    return response;
                })
                .catch(function() {
                    return caches.match(e.request);
                })
        );
        return;
    }

    // Cache-first for app assets
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            return cached || fetch(e.request);
        })
    );
});
