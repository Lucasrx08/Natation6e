# V31 — Capsule illustrée du parcours aquatique

La vidéo utilise les illustrations d’origine de l’application. Le nageur articulé des versions V29/V30 est remplacé par un montage de visuels : recadrages progressifs, fondus courts, flèches et cartes successives. Aucune déformation du corps ni simulation de cycle de nage n’est utilisée.

- Dix étapes, 69 secondes, format 16:9, exports Full HD et 4K à 30 images/s.
- Saut arrière : illustration corrigée, bras le long du corps, entrée pieds en premier.
- Immersions aller et retour : tapis OU cerceau lesté présentés côte à côte comme alternatives.
- Flottaison debout et étoile dorsale : décompte de 15 secondes montré en 5 secondes, avec mention ×3.
- Demi-tour : crawl, redressement et changement de direction sans appui, départ sur le dos ; trois illustrations successivement mises en évidence.
- Fin du parcours : approche en crawl, plongeon canard pour l’anneau, remontée illustrée en position allongée, reprise du crawl puis accrochage au bord.
- Titres et consignes courts, progression en dix étapes, chapitres accessibles, sous-titres français et signaux sonores discrets.
- Le format 4K concerne le montage ; les illustrations sont conservées à partir des fichiers d’origine, de résolutions variables.

## Intégration et vérifications

Nouveaux modules V31 et nouveaux médias ; le service worker actualise le cache. Le lecteur conserve le chargement local de la vidéo, la sélection HD/4K et l’accès aux chapitres. Les anciennes vidéos ne sont plus utilisées par le lecteur courant.

La notation, les critères, les diplômes et les données élèves restent inchangés. Les tests de calcul des notes au quart supérieur passent. Les contrôles de lecture couvrent les dix chapitres, le passage HD/4K, quatre tailles d’écran, le téléchargement et la lecture hors connexion dans Chromium.

Source reproductible : `video-production/render_parcours_v31.py` (Skia-Python, NumPy, Pillow, FFmpeg). Les tableaux ART et CUES répertorient les fichiers et textes exacts utilisés. Aucun service de génération payant ni nouvel actif externe.
