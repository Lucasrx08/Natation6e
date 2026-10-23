const CACHE_NAME = "natation-6e-cycle-v21-20261023";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon.svg",
  "./natation-swimmers.png",
  "./og.png",
  "./framework-DjPHiq1u.js",
  "./index-cycle-v21.js",
  "./index-x_1aGchH.css",
  "./cycle-v21.css",
  "./layout-cycle-v21.js",
  "./natation-cycle-v21.js",
  "./workshops-v19.js",
  "./cycle-features-v21.js",
  "./cycle-model-v21.js",
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
  "./fiches/entry.pdf",
  "./cycle-documents-v21.js",
  "./fiches/floating.pdf?v=21",
  "./fiches/immersion.pdf?v=21",
  "./fiches/entry.pdf?v=21",
  "./vendor/pdf-lib-1.17.1.min.mjs",
  "./vendor/fontkit-1.1.1.min.js",
  "./vendor/LICENSE-fontkit",
  "./vendor/standard_fonts/DejaVuSerif.ttf",
  "./vendor/standard_fonts/LICENSE_DEJAVU",
  "./vendor/pdfjs-worker-5.6.205.min.mjs",
  "./vendor/LICENSE-pdfjs",
  "./vendor/LICENSE-pdf-lib.md",
  "./vendor/pdfjs-5.6.205.min.mjs",
  "./vendor/standard_fonts/FoxitSerifItalic.pfb",
  "./vendor/standard_fonts/FoxitDingbats.pfb",
  "./vendor/standard_fonts/FoxitSerifBold.pfb",
  "./vendor/standard_fonts/FoxitFixedItalic.pfb",
  "./vendor/standard_fonts/LiberationSans-Bold.ttf",
  "./vendor/standard_fonts/FoxitFixedBoldItalic.pfb",
  "./vendor/standard_fonts/LICENSE_FOXIT",
  "./vendor/standard_fonts/LiberationSans-Italic.ttf",
  "./vendor/standard_fonts/FoxitSymbol.pfb",
  "./vendor/standard_fonts/LICENSE_LIBERATION",
  "./vendor/standard_fonts/FoxitSerif.pfb",
  "./vendor/standard_fonts/LiberationSans-BoldItalic.ttf",
  "./vendor/standard_fonts/FoxitFixed.pfb",
  "./vendor/standard_fonts/FoxitSerifBoldItalic.pfb",
  "./vendor/standard_fonts/FoxitFixedBold.pfb",
  "./vendor/standard_fonts/LiberationSans-Regular.ttf",
  "./vendor/wasm/LICENSE_PDFJS_OPENJPEG",
  "./vendor/wasm/LICENSE_PDFJS_QCMS",
  "./vendor/wasm/LICENSE_JBIG2",
  "./vendor/wasm/LICENSE_PDFJS_JBIG2",
  "./vendor/wasm/LICENSE_QCMS",
  "./vendor/wasm/openjpeg_nowasm_fallback.js",
  "./vendor/wasm/openjpeg.wasm",
  "./vendor/wasm/qcms_bg.wasm",
  "./vendor/wasm/jbig2.wasm",
  "./vendor/wasm/LICENSE_OPENJPEG"
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
