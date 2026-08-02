/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · free-tour/sw.js
   Service Worker de la sección Free Tour.

   Vive en /free-tour/ (no en /free-tour/js/) para que su scope
   cubra toda la sección: un SW solo controla su propio
   directorio y los de debajo, y GitHub Pages no permite enviar
   la cabecera Service-Worker-Allowed para ampliarlo.
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'mijnutrecht-tour-v2';

/* Rutas relativas al scope (/free-tour/) */
const CORE = [
  './',
  'index.html',
  'ruta.html',
  'css/free-tour.css',
  'js/free-tour.js',
  'js/geolocation.js',
  'js/map.js',
  'js/speech.js',
  'data/ruta-oculto.json',
  'data/ruta-locura.json',
  '../assets/css/main.css',
  '../fotos/optim/dom-800.webp',
  '../fotos/optim/werven-800.webp',
  '../fotos/optim/olivier-800.webp',
  '../fotos/optim/hero-800.webp',
  '../fotos/optim/oudegracht-modern-1200.webp',
  '../fotos/optim/vredenburg-modern-1200.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Uno a uno: si un recurso falla, el resto sigue cacheándose
      Promise.all(CORE.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('mijnutrecht-tour-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Dos estrategias:
   · HTML y JSON → red primero. Así un deploy se ve en el acto en vez de
     servir la versión vieja hasta la siguiente visita. Si no hay cobertura,
     cae al caché y el tour sigue funcionando.
   · CSS, JS e imágenes → caché primero, revalidando por detrás. Son los
     que hacen que la ruta abra al instante en mitad de la calle. */
function esDocumentoODatos(req, url) {
  return req.mode === 'navigate' ||
         req.destination === 'document' ||
         url.pathname.endsWith('.json');
}

function guardar(req, res) {
  if (res && res.status === 200 && res.type === 'basic') {
    const copy = res.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Los tiles del mapa y las APIs externas van siempre a la red
  if (url.origin !== self.location.origin) return;

  if (esDocumentoODatos(req, url)) {
    event.respondWith(
      fetch(req)
        .then((res) => guardar(req, res))
        .catch(() => caches.match(req).then((cached) => cached || caches.match('ruta.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => guardar(req, res)).catch(() => cached);
      return cached || network;
    })
  );
});
