# V30 — Étude de mouvements du parcours aquatique

Version de travail, non déployée dans l’application. Le MP4 complet garde les dix étapes et dure 69 secondes. Les deux flottaisons de 15 secondes sont montrées en 5 secondes, avec décompte et indication ×3.

## Modifications

- Orientation des bras dans le plan anatomique épaule–coude–poignet ; contrôle de la torsion de l’humérus et de l’avant-bras. Les doigts suivent la main au lieu d’être réorientés indépendamment.
- Crawl : trajectoires continues séparant entrée, prise d’appui, traction, poussée et retour aérien avec coude fléchi.
- Dos crawlé : retour aérien presque tendu, distinct de la traction sous l’eau.
- Étoile dorsale : bras écartés, légèrement fléchis, épaules moins relevées.
- Demi-tour : vue latérale, redressement, rotation en position verticale, allongement dorsal. Interpolation des poses de nage et de sustentation.
- Immersions : passage en position allongée, bras devant, sous le tapis OU dans le cerceau ; transitions vers et depuis le crawl.
- Anneau : plongée tête la première, récupération, remontée oblique avec remise à l’horizontale, reprise du crawl. L’inclinaison ascendante est limitée à environ 25° ; la remontée verticale de V29 est supprimée.
- Éclairage et finition du personnage ajustés. Le personnage reste une approximation issue du maillage MakeHuman de V29, pas le modèle source des illustrations de l’application.

## Reproduction

Les ressources CC0 MakeHuman et Three.js MIT sont réutilisées depuis `../v29` ; provenance et licences dans `../v29/SOURCES.md`.

1. Installer Playwright et Chromium pour Node, Skia-Python et NumPy pour Python, et FFmpeg.
2. Définir `CHROMIUM_PATH` et éventuellement `V30_WORK` (par défaut le dossier `v30-work` à côté du dépôt).
3. Exécuter `node video-production/v30/render_assets.cjs`.
4. Exécuter `python3 video-production/render_parcours_v30.py`.

Le film est écrit dans `media/parcours-aquatique-v30.mp4` et `media/parcours-aquatique-v30-4k.mp4`, avec affiche et sous-titres. L’application continue d’utiliser V29 ; aucune donnée ni règle de notation n’a changé.

## Contrôles et limites

726 poses contrôlées : matrices finies, continuité des chaînes de bras, flexion du coude inférieure à 145°, retour aérien du dos crawlé inférieur à 25°. Détails dans `motion-check.json`. La vérification géométrique ne certifie pas la fidélité biomécanique ou la qualité esthétique de l’animation.

Il s’agit d’une animation calculée, sans capture de mouvements ni simulation hydrodynamique. Les visuels doivent encore être appréciés comme une version de travail. La lecture vidéo et la résolution d’export ne valent pas validation pédagogique du mouvement.
