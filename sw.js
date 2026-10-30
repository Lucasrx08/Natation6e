const CACHE_NAME = "natation-6e-video-v32-20261030-r6";
const APP_SHELL = [
  "./boot-v33.css","./layout-v35.css",
  "./aquatic-model-v32.js",
  "./grading-v27.js",
  "./video-v32.css",
  "./assets/v26/board-3d.png",
  "./assets/v26/noodle-3d.png",
  "./assets/v26/belt-3d.png",
  "./assets/v26/pullbuoy-3d.png",

  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon.svg",
  "./natation-swimmers.png",
  "./og.png",
  "./framework-DjPHiq1u.js",
  "./index-cycle-v34.js",
  "./index-x_1aGchH.css",
  "./cycle-v27.css",
  "./layout-cycle-v34.js",
  "./natation-cycle-v34.js",
  "./workshops-v23.js",
  "./aquatic-model-v27.js",
  "./aquatic-v32.js",
  "./assets/v23/backward-jump.png",
  "./assets/v23/weighted-hoop.png",
  "./assets/v24/front-glide.png",
  "./assets/v24/back-glide.png",
  "./media/parcours-aquatique-v32.mp4",
  "./media/parcours-aquatique-v32.png",
  "./media/parcours-aquatique-v32.vtt",
  "./cycle-features-v32.js",
  "./cycle-model-v27.js",
  "./tracking-model-v27.js",
  "./tracking-v27.js",
  "./evaluation-v27.js",
  "./assets/v25/attestation-savoir-nager.pdf",
  "./vendor/poppins/Poppins-Regular.ttf",
  "./vendor/poppins/Poppins-Bold.ttf",
  "./vendor/poppins/OFL.txt",
  "./swimmer-portraits-v22.js",
  "./assets/v22/swimmer-male.png",
  "./assets/v22/swimmer-female.png",
  "./assets/v22/present.svg",
  "./assets/v22/absent.svg",
  "./assets/v22/exempt.svg",
  "./assets/v22/kit.svg",
  "./rolldown-runtime-S-ySWqyJ.js",
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
  "./ateliers/entry-dive-seated-v19.png",
  "./ateliers/entry-dive-standing-v19.png",
  "./ateliers/entry-dive-block-v19.png",
  "./fiches/entry.pdf",
  "./cycle-documents-v27.js",
  "./fiches/floating.pdf?v=24",
  "./fiches/immersion.pdf?v=24",
  "./fiches/entry.pdf?v=24",
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
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL.map(path => new Request(new URL(path, self.registration.scope), {cache: "reload"})))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("natation-6e-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Native video players issue Range requests when seeking, including offline.
  if (/\/media\/parcours-aquatique-v32(?:-4k)?\.mp4$/.test(url.pathname) && request.headers.has("range")) {
    event.respondWith((async () => {
      const cached = await caches.match(url.href);
      if (!cached) return fetch(request);
      const bytes = await cached.arrayBuffer(), range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
      if (!range) return new Response(null, {status:416,headers:{"Content-Range":`bytes */${bytes.byteLength}`}});
      const start = range[1] ? Number(range[1]) : Math.max(0,bytes.byteLength-Number(range[2])), end = range[1] && range[2] ? Math.min(Number(range[2]),bytes.byteLength-1) : bytes.byteLength-1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= bytes.byteLength) return new Response(null, {status:416,headers:{"Content-Range":`bytes */${bytes.byteLength}`}});
      return new Response(bytes.slice(start,end+1),{status:206,headers:{"Content-Type":"video/mp4","Content-Length":String(end-start+1),"Content-Range":`bytes ${start}-${end}/${bytes.byteLength}`,"Accept-Ranges":"bytes"}});
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(new Request(request, {cache: "no-store"}))
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
        if (response.ok && response.status !== 206) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }),
    ),
  );
});
