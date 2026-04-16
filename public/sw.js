const CACHE_NAME = 'denguecare-v3';

// Instala e cacheia tudo que o browser já carregou
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/apple-touch-icon.png'
      ])
    )
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: tenta rede primeiro, fallback para cache
// Todos os arquivos JS/CSS são cacheados automaticamente na primeira visita
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;

  // Ignora requisições externas (fonts, CDN)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      // Verifica cache primeiro
      const cached = await caches.match(event.request);

      // Tenta buscar da rede
      const fetchPromise = fetch(event.request)
        .then(response => {
          // Cacheia qualquer resposta válida (JS, CSS, imagens, etc)
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cached); // Se rede falhar, usa cache

      // Retorna cache imediatamente se disponível, senão aguarda rede
      return cached || fetchPromise;
    })
  );
});
