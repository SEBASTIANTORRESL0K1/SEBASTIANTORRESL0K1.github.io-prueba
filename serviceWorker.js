// const staticDevCoffee = "to-do-list";
// const assets = [
//   "./",
//   "./index.html",
//   "./css/style.css",
//   "./js/fusion.js",
//   "./icons/prain.webp",
//   "./manifest.json"
// ];

// self.addEventListener("install", (installEvent) => {
//   installEvent.waitUntil(
//     caches.open(staticDevCoffee).then((cache) => {
//       cache.addAll(assets);
//     })
//   );
// });
// self.addEventListener("fetch", (fetchEvent) => {
//   fetchEvent.respondWith(
//     caches.match(fetchEvent.request).then((res) => {
//       return res || fetch(fetchEvent.request);
//     })
//   );
// });

const CACHE_NAME = "to-do-list-v2";
const assets = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/fusion.js",
  "./icons/prain.webp",
  "./manifest.json"
];

// Instalar y cachear assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Activar y limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Si la petición es hacia /tareas (API)
  if (request.url.includes("/tareas")) {
    event.respondWith(
      fetch(request) // intenta red desde el servidor primero
        .then((res) => {
          // Guarda copia en cache para fallback
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(request)) // si no hay internet usa cache
    );
    return;
  }

  // Para assets estáticos: cache-first
  event.respondWith(
    caches.match(request).then((res) => {
      return res || fetch(request);
    })
  );
});
