const CACHE_NAME = 'animeshare-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ne jamais intercepter les appels vers le backend API : on laisse
  // le navigateur les gérer normalement, sans passer par le cache.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Ne mettre en cache que les requêtes GET (les POST/PUT/DELETE ne
  // doivent jamais être interceptées par un cache).
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si le réseau échoue et qu'il n'y a rien en cache, on laisse
          // l'erreur remonter normalement au lieu de casser silencieusement.
          return new Response('Erreur réseau', { status: 503, statusText: 'Service indisponible' });
        });
      })
  );
});