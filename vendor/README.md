# Offline PDF dependencies

These browser files are pinned local distributions. They are cached with the app; PDF processing, rendering, and personalization do not send pupil documents to a server.

- **pdf-lib 1.17.1**, `dist/pdf-lib.esm.min.js` renamed `.mjs`, MIT. Source: https://github.com/Hopding/pdf-lib. License: `LICENSE-pdf-lib.md`.
- **PDF.js 5.6.205**, `legacy/build/pdf.min.mjs` and `legacy/build/pdf.worker.min.mjs` renamed with version. Apache-2.0. Source: https://github.com/mozilla/pdf.js. Includes its `standard_fonts` and `wasm` distributions with their notices and licenses. License: `LICENSE-pdfjs`.
- **@pdf-lib/fontkit 1.1.1**, unmodified `dist/fontkit.umd.min.js` renamed with version. MIT. Source: https://github.com/Hopding/fontkit (fork of https://github.com/foliojs/fontkit). Dynamically imported for its browser global; this UMD distribution includes its browser dependencies, unlike the ES distribution's external `pako` import. Notice: `LICENSE-fontkit`.
- **DejaVu Serif**, `DejaVuSerif.ttf` from the DejaVu Fonts distribution. Source: https://dejavu-fonts.github.io/. Copyright and permission: `standard_fonts/LICENSE_DEJAVU`.

Liberation Sans fonts bundled by PDF.js are embedded as subsets in generated names, marks and diploma fields. This makes printed typography consistent across PDF readers. The original PDF's own artwork and typography are kept when personalizing a diploma or printing an imported evaluation.

PDF.js is configured with `isEvalSupported: false`; fonts, workers and image codecs resolve to this directory, not to a CDN. Updates must retain all upstream license files and keep the service-worker precache list in sync.
