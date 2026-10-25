# Visuels V24 - 24 octobre 2026

Méthode : outil intégré de génération d’images (`image_gen`), avec fond transparent, deux appels. Les PNG sont copiés sans modification dans le dépôt. Chaque illustration mesure 2172×724 pixels ; elle est utilisée à une taille inférieure à sa résolution native dans la vidéo UHD. Le schéma et les textes sont rendus directement à 3840×2160.

## Glisse ventrale

Fichier final : `assets/v24/front-glide.png`.

Référence de personnage : `action-04-ventrale.png`.

Prompt :

> Use case: scientific-educational. Asset type: high-resolution transparent 3D swimmer cutout for a native 3840x2160 swimming-course tutorial. Reference image is for character identity and polished educational 3D style: school-age swimmer, red cap, blue goggles, blue/cyan/purple swim trunks. Clean anatomy, friendly realistic 3D, full body visible. Wide landscape composition, ideally 3072x1024. Genuine transparent background, NO opaque pool or rectangular background, no floor, no lines, no text, no arrows, no wake obscuring the body, only very subtle water droplets. Primary requirement is an unmistakably STRAIGHT HORIZONTAL long body, exactly parallel to the horizontal image axis, suitable for translating smoothly along a horizontal pool path. Do not tilt the whole body diagonally. Preserve crisp detail at large display size. Show the swimmer in prone swimming/gliding position facing RIGHT, head at the right, feet at the left. Side profile with both arms extended straight forward together, face down aligned between the upper arms, torso and nearly straight legs aligned horizontally. A calm streamlined glide; no raised head, no arm waving upward, no exaggerated curved spine.

## Glisse dorsale

Fichier final : `assets/v24/back-glide.png`.

Référence de personnage : `action-07-dorsale.png`.

Prompt :

> Use case: scientific-educational. Asset type: high-resolution transparent 3D swimmer cutout for a native 3840x2160 swimming-course tutorial. Reference image is for character identity and polished educational 3D style: school-age swimmer, red cap, blue goggles, blue/cyan/purple swim trunks. Clean anatomy, friendly realistic 3D, full body visible. Wide landscape composition, ideally 3072x1024. Genuine transparent background, NO opaque pool or rectangular background, no floor, no lines, no text, no arrows, no wake obscuring the body, only very subtle water droplets. Primary requirement is an unmistakably STRAIGHT HORIZONTAL long body, exactly parallel to the horizontal image axis, suitable for translating smoothly along a horizontal pool path. Do not tilt the whole body diagonally. Preserve crisp detail at large display size. Show the swimmer floating/gliding ON THE BACK facing LEFT along the pool: head at the left, feet at the right, face upward, ears by the water surface, BOTH ARMS RELAXED STRAIGHT DOWN THE SIDES OF THE BODY, hands beside thighs, legs nearly straight and together, toes near the surface. Side profile. Entire body horizontal from head to toes, no seated position, no raised arm, no tilted legs.

## Capsule

Le script `qa/render-course-v24.py` compose les éléments à leur résolution de sortie, anime un nageur sur une trajectoire continue et encode la vidéo H.264 avec FFmpeg. Sorties : `media/parcours-aquatique-v24.mp4`, `media/parcours-aquatique-v24.jpg`, `media/parcours-aquatique-v24.vtt`. Les illustrations des autres étapes restent celles déjà présentes dans l’application.
