// FBC KJV Bible — Service Worker
// Bump CACHE_NAME on every meaningful deploy. The version number
// is read by the app from caches.keys() and displayed in Tips & Help.

const CACHE_NAME = 'fbckjv-bible-v1';

// Pre-cache the app shell on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['/']))
      .then(() => self.skipWaiting())
  );
});

// Delete old caches on activate so caches.keys() only shows the current version
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('fbckjv-bible-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first strategy — SW just handles versioning, not offline caching
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
