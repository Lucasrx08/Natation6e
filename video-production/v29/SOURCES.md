# Sources du nageur 3D — V29

Le personnage est un véritable maillage déformé par un squelette de 163 os. Les rotations sont calculées avec des quaternions ; les bras utilisent une chaîne épaule–coude–poignet à longueurs constantes. Les cycles de crawl, dos crawlé, changements d’orientation et plongeon canard sont écrits dans `rig-renderer.js`.

## Maillage et poids — CC0

Dérivés des ressources principales MakeHuman, explicitement publiées sous CC0 :

- https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj
- https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/rigs/default.mhskel
- https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/rigs/default_weights.mhw
- `makehuman/data/targets/macrodetails/caucasian-male-child.target`
- `makehuman/data/targets/macrodetails/caucasian-male-young.target`

Titulaires indiqués par les ressources : Data Collection AB, Joel Palmius et Jonas Hauquier. Les ressources graphiques sont sous CC0, indépendamment de la licence du logiciel MakeHuman. Aucun code du logiciel MakeHuman n’est inclus. Référence de la licence des ressources : https://www.makehumancommunity.org/about/license.html

`prepare_model.py` dérive le maillage `swimmer-model.json` de ces fichiers. Le modèle dérivé, ses couleurs, son bonnet, ses lunettes et les poses servent uniquement à produire les images de la capsule. Aucun téléchargement externe n’est nécessaire pour lire la vidéo dans l’application.

## Moteur de rendu

Three.js 0.160.1, licence MIT, distribuée dans `LICENSE-three.txt`. Police Poppins sous OFL dans le répertoire existant `vendor/poppins`.

## Reproduction

1. Installer Playwright dans Node et Skia-Python / NumPy dans Python.
2. Définir `CHROMIUM_PATH` vers Chromium et, facultativement, `V29_WORK` vers un répertoire de travail.
3. Exécuter `node video-production/v29/render_assets.cjs`.
4. Exécuter `python3 video-production/render_parcours_v29.py` avec FFmpeg disponible.

Les images intermédiaires ne sont pas chargées par l’application : seuls les MP4, l’affiche et les sous-titres sont utilisés à la lecture.
