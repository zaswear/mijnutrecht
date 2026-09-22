/* Offline explícito por ruta. El scope se mantiene en /free-tour/. */
const CACHE_NAME = 'mijnutrecht-tour-v6';
const ROUTES = ['oculto', 'locura'];
const CORE = ['index.html', 'ruta.html', 'css/free-tour.css', 'js/free-tour.js',
  'js/geolocation.js', 'js/map.js', 'js/speech.js', 'js/offline.js', '../assets/css/main.css'];
const absolute = (path) => new URL(path, self.registration.scope).href;
self.addEventListener('install', (event) => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) =>
    key.startsWith('mijnutrecht-tour-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});
async function download(cache, path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(absolute(path), {cache: 'reload', signal: controller.signal});
    if (!response.ok || response.type !== 'basic') return false;
    await cache.put(absolute(path), response);
    return true;
  } catch (e) { return false; }
  finally { clearTimeout(timer); }
}
async function report(id, save) {
  if (!ROUTES.includes(id)) throw new Error('Ruta desconocida');
  const cache = await caches.open(CACHE_NAME);
  const dataPath = 'data/ruta-' + id + '.json';
  const essentials = CORE.concat(dataPath);
  if (save) await Promise.all(essentials.map((path) => download(cache, path)));
  const dataResponse = await cache.match(absolute(dataPath));
  const data = dataResponse ? await dataResponse.json() : null;
  const stops = data && Array.isArray(data.paradas_lista) ? data.paradas_lista : [];
  const photos = [...new Set(stops.map((stop) => stop.foto).filter(Boolean))];
  // Solo archivos locales del tour o fotos del proyecto; nunca destinos aportados por mensajes.
  const allowed = photos.filter((path) => {
    const url = new URL(path, self.registration.scope);
    return url.origin === self.location.origin &&
      (url.href.startsWith(absolute('img/')) || url.href.startsWith(absolute('../fotos/optim/')));
  });
  if (save) await Promise.all(allowed.map((path) => download(cache, path)));
  const count = async (paths) => (await Promise.all(paths.map(async (path) => !!(await cache.match(absolute(path)))))).filter(Boolean).length;
  const coreSaved = await count(essentials);
  const photosSaved = await count(allowed);
  return {coreSaved, coreTotal: essentials.length, photosSaved, photosTotal: photos.length,
    missingPhotos: stops.filter((stop) => !stop.foto).length,
    ready: !!data && coreSaved === essentials.length && photosSaved === photos.length};
}
self.addEventListener('message', (event) => {
  if (!event.data || !['STATUS', 'DOWNLOAD'].includes(event.data.type) || !event.ports[0]) return;
  event.waitUntil(report(event.data.route, event.data.type === 'DOWNLOAD').then((result) =>
    event.ports[0].postMessage(result)).catch(() => event.ports[0].postMessage({error: true})));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const scope = self.registration.scope;
  if (!url.href.startsWith(scope) && !CORE.some((path) => absolute(path) === url.href) && !url.href.startsWith(absolute('../fotos/optim/'))) return;
  // ruta.html es la misma carcasa para ?ruta= y ?parada=. El JSON se guarda por ruta.
  const key = url.pathname === new URL('ruta.html', scope).pathname ? absolute('ruta.html') :
    url.href === scope ? absolute('index.html') : url.href;
  const documentOrData = req.mode === 'navigate' || url.pathname.endsWith('.json');
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(key);
    if (cached && !documentOrData) return cached;
    try {
      const response = await fetch(req);
      if (response.ok && response.type === 'basic') await cache.put(key, response.clone());
      return response;
    } catch (e) {
      // Nunca responder a un JSON ausente con HTML de otra ruta.
      return cached || new Response('Recurso no descargado. Vuelve a conectar para guardarlo.', {
        status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
      });
    }
  })());
});
