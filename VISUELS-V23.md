# Visuels V23 - 24 octobre 2026

Méthode : outil intégré de génération d’images (`image_gen`), fond transparent. Deux appels, sans recours à une API ou à la CLI. Les PNG générés sont copiés sans modification dans le dépôt. Le lecteur et le schéma sont construits en code pour garder l’ordre des étapes, les couleurs et le minutage exacts.

## Saut arrière

Fichier final : `assets/v23/backward-jump.png`.

Référence : l’image fournie `entry-bottle-v19(1).png`, utilisée comme cible d’édition pour corriger la pose tout en conservant la famille visuelle du nageur.

Prompt :

> Use case: precise-object-edit. Asset type: transparent educational 3D swimming illustration for a French school swimming app, small assessment icons and A4 workshop handout. Edit target: attached swimmer entry image. Replace the incorrect backward falling pose entirely: show a controlled ACTIVE BACKWARD JUMP from the pool edge, FEET FIRST, with BOTH ARMS STRAIGHT DOWN ALONG THE SIDES OF THE TORSO, hands next to outer thighs. The swimmer faces toward the dry pool deck on the LEFT, back toward water on the RIGHT. Both feet have just pushed off and are airborne a short distance from the edge, knees slightly flexed, body nearly vertical over the water, only a tiny backward lean, feet below the body. Keep the same friendly semi-realistic 3D youth swimmer, red swimming cap, blue goggles, blue/cyan/purple swim trunks, clean anatomy, same detailed blue pool tiles, small pool-edge fragment and turquoise water beneath. Side view where both hands at the sides are clearly visible. Do NOT show arms crossed, hands on shoulders/biceps/chest, arms raised, lying flat on the back, a stiff diagonal falling plank, or a back flop. This must read as a little backward jump with the feet leading and upright body, not a passive backward fall. No text, no arrows, no panel, no border, actual transparent background outside the subject and small pool fragment. Polished same visual family; entire swimmer including feet visible.

## Cerceau lesté

Fichier final : `assets/v23/weighted-hoop.png`.

Référence de personnage et de style : `ateliers/immersion-object-v19.png`.

Prompt :

> Use case: scientific-educational. Asset type: transparent 3D swimming illustration for a school tablet app and an animated course tutorial. Reference image establishes the same swimmer character and semi-realistic polished 3D style: red swimming cap, blue goggles, blue/cyan/purple swim trunks. Create a different action: the swimmer is FULLY SUBMERGED, swimming horizontally from LEFT to RIGHT THROUGH ONE VERTICAL WEIGHTED HOOP. The hoop is orange/yellow, large enough to pass through with clearance, held upright underwater by a small weight resting on a small fragment of blue tiled pool floor. Show the swimmer halfway through the hoop, both arms extended forward through the opening, head and shoulders beyond the hoop, legs behind, body horizontal. Side three-quarter view makes the vertical circular hoop and its opening clearly readable. Keep clean correct anatomy, no contact or grip on the hoop, no other swimmers. Bright clear turquoise water cues and a few small bubbles, no opaque rectangular water background. Actual transparent background outside swimmer, hoop, small floor fragment. Entire body and entire hoop in frame with margins. No text, no logos, no arrows. Match the existing educational swimming illustrations, not flat cartoon icons.

## Assemblage de la capsule

`qa/render-course-v23.py` assemble les illustrations existantes et ces deux PNG sur un schéma exact du parcours, anime le déplacement et les compteurs, puis encode le fichier H.264 avec FFmpeg. Les deux états du demi-tour et le bord utilisent les illustrations déjà présentes dans l’application.

Sorties : `media/parcours-aquatique-v23.mp4`, `media/parcours-aquatique-v23.jpg`, `media/parcours-aquatique-v23.vtt`.
