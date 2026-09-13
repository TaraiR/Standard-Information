const CACHE = 'fe-study-v1';

const PRECACHE = [
  '/',
  '/chapter/a1', '/chapter/a2', '/chapter/a3', '/chapter/a4', '/chapter/a5',
  '/chapter/a6', '/chapter/a7', '/chapter/a8', '/chapter/a9', '/chapter/a10',
  '/chapter/b1', '/chapter/b2', '/chapter/b3', '/chapter/b4',
  '/glossary',
  '/stats',
  '/quiz',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(PRECACHE).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cross-origin requests (analytics etc.) — pass through
  if (url.origin !== self.location.origin) return;

  // Next.js immutable static assets — cache first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then(hit => {
        if (hit) return hit;
        return fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // HTML navigation — network first, cache fallback
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request)
            .then(hit => hit || caches.match('/'))
        )
    );
    return;
  }

  // Everything else — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
