const CACHE_NAME = 'livro-tracker-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/favoritos.html',
  '/franquias.html',
  '/colecoes.html',
  '/css/styles.css',
  '/js/script.js',
  '/js/pwa.js',
  '/js/favoritos.js',
  '/js/franquias.js',
  '/js/colecoes.js',
  '/json/manifest.json'
];

const OPTIONAL_ASSETS = [
  'https://mozilla.github.io/pdf.js/build/pdf.js',
  'https://mozilla.github.io/pdf.js/build/pdf.worker.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(APP_SHELL);
        await Promise.allSettled(OPTIONAL_ASSETS.map(asset => cache.add(asset)));
      })
      .catch(err => console.error('Falha ao armazenar recursos na instalação', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const isNavigationRequest = request.mode === 'navigate';

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (isNavigationRequest) {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});