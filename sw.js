const CACHE_NAME = "natation-6e-github-flat-v12";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon.svg",
  "./natation-swimmers.png",
  "./og.png",
  "./framework-DjPHiq1u.js",
  "./index-ghYT_8t7.js",
  "./index-x_1aGchH.css",
  "./layout-segment-context-D93VpWEY.js",
  "./natation-app-CIyftveV.js",
  "./rolldown-runtime-S-ySWqyJ.js",
  "./action-01-chute.png",
  "./action-02-approche.png",
  "./action-03-obstacle.png",
  "./action-04-ventrale.png",
  "./action-05-surplace.png",
  "./action-07-dorsale.png",
  "./action-08-flottaison.png",
  "./action-09-obstacle-retour.png",
  "./action-10-retour.png",
  "./action-11-ancrage.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ?? fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }),
    ),
  );
});
