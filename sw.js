const CACHE_NAME = "natation-6e-cycle-v20-20261023";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon.svg",
  "./natation-swimmers.png",
  "./og.png",
  "./framework-DjPHiq1u.js",
  "./index-cycle-v20.js",
  "./index-x_1aGchH.css",
  "./cycle-v20.css",
  "./layout-cycle-v20.js",
  "./natation-cycle-v20.js",
  "./workshops-v19.js",
  "./cycle-features-v20.js",
  "./cycle-model-v20.js",
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
  "./action-11-ancrage.png",
  "./fiches/floating.pdf",
  "./ateliers/flottaison-3d-1.png",
  "./ateliers/flottaison-3d-2.png",
  "./ateliers/flottaison-3d-3.png",
  "./ateliers/flottaison-3d-4.png",
  "./ateliers/flottaison-3d-5.png",

    "./ateliers/immersion-face-v18.png",
  "./ateliers/immersion-head-v18.png",
  "./ateliers/entry-ladder-v18.png",
  "./ateliers/entry-jump-v18.png",
  "./ateliers/entry-sit-v18.png",
  "./fiches/immersion.pdf",
    "./ateliers/immersion-bar-wall-v19.png",
  "./ateliers/immersion-mat-wall-v19.png",
  "./ateliers/immersion-bar-free-v19.png",
  "./ateliers/immersion-object-v19.png",
  "./ateliers/entry-material-v19.png",
  "./ateliers/entry-tuck-v19.png",
  "./ateliers/entry-bottle-v19.png",
  "./ateliers/entry-dive-seated-v19.png",
  "./ateliers/entry-dive-standing-v19.png",
  "./ateliers/entry-dive-block-v19.png",
  "./fiches/entry.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("natation-6e-") && key !== CACHE_NAME).map((key) => caches.delete(key))),
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
