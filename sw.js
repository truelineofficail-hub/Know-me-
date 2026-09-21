/* How Well Do You Know Me? - service worker: full offline support */
const VERSION = 'v1.0.0';
const CACHE = 'know-me-' + VERSION;
const ASSETS = [
  './', './index.html', './style.css', './app.js', './manifest.json',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-192.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('know-me-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* Page loads: serve the cached app shell instantly, refresh it quietly in the background */
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        const fresh = fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put('./index.html', res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
    return;
  }

  /* Everything else: cache first, then network */
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }).catch(() => cached))
  );
});
