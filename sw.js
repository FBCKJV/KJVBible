// FBC KJV Bible — Service Worker
// Version scheme: fbckjv-bible-vMAJOR[.MINOR]
//   • Feature release  → bump MAJOR (v23 → v24) AND WHATS_NEW_VERSION in
//     index.html, so the "What's New" pop-up fires and the one-pagers get
//     redone.
//   • Bug-fix release   → add/raise MINOR (v24 → v24.01 → v24.02). Settings
//     shows the full number so fixes are visible, but the pop-up stays quiet.
// Bump CACHE_NAME on every deploy (either kind) — it invalidates the cache
// and is read back by the app (refreshAppVersion) for the Settings display.

const CACHE_NAME = 'fbckjv-bible-v25';

// Bible maps + the concordance and Bible-names indexes — bundled static
// assets, precached so they work offline.
const MAP_ASSETS = [
  'maps/table-of-nations.jpg','maps/exodus-sinai.jpg','maps/twelve-tribes.jpg',
  'maps/david-solomon.jpg','maps/divided-kingdom.jpg','maps/assyria.jpg',
  'maps/palestine-nt.jpg','maps/journeys-of-christ.jpg','maps/jerusalem.jpg',
  'maps/pauls-journeys.jpg',
  'concordance.json',
  'bible-names.json',
];

// Pre-cache the app shell on install (maps are best-effort so a missing
// file never blocks the core install).
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/']).then(() => cache.addAll(MAP_ASSETS).catch(()=>{}))
    ).then(() => self.skipWaiting())
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

// Network-first strategy — SW just handles versioning, not offline caching.
// Successful page navigations refresh the cached app shell, so the offline
// copy tracks the live site instead of staying frozen at whatever version
// existed when the worker first installed.
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res.ok && e.request.mode === 'navigate'){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('/')))
  );
});
