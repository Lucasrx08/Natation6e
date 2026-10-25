# Natation 6e — V27

25 octobre 2026

## Notes au quart supérieur

Les notes de démonstration, de parcours et de total sont arrondies au quart de point supérieur : 7,08 → 7,25 ; 7,26 → 7,50 ; 7,51 → 7,75. Une note déjà sur un quart ne change pas.

Les niveaux observés et leurs moyennes exactes sont conservés. La note finale utilise les deux notes exactes avant son propre arrondi, pour éviter de cumuler deux arrondis à la hausse. Le même calcul est appliqué à l’écran, dans les PDF et dans les exports Excel / iDoceo.

## Critères d’apprentissage visibles

La disposition de la mission s’adapte désormais à sa hauteur réelle. Les modes compacts réservent la place aux critères et aux boutons d’action. Les critères sont vérifiés aussi pendant l’essai, lorsque les cases à cocher sont ouvertes.

Le message de badge gagné se place dans la scène du nageur et ne réduit plus la hauteur de la mission suivante.

## Vidéo 3D

Le clip fourni a été analysé : 8 secondes, 1 280 × 720, 24 images par seconde. Il sert de référence de style pour un personnage animé dans une piscine réaliste. Sa pose bras croisés ne doit pas être reproduite pour le saut arrière.

Le [déroulé et le brief](VIDEO-PARCOURS-3D.md) ainsi que les [prompts des dix séquences](video-production/parcours-3d-v27.json) sont préparés. **La nouvelle vidéo 3D n’est pas générée** : cette production nécessite encore l’ajout et la connexion d’un service vidéo tel que Runway. Le lecteur conserve pour l’instant le tutoriel existant.

## Vérifications

- Arrondi supérieur, valeurs déjà sur un quart, tolérance aux imprécisions numériques et absence de double arrondi.
- Cas réel : 7,08 → 7,25 ; note finale de 15,25, identique dans l’interface, le PDF et Excel.
- Les 19 missions avec les cases à cocher ouvertes sur six formats : 1 440 × 710, 1 366 × 672, 1 280 × 631, 1 180 × 660, 1 024 × 650 et 768 × 1 024.
- Contrôle des limites réelles des critères et stabilité de la hauteur après un badge.
- 36 élèves, quatre formats usuels, banque d’icônes, anciennes colonnes, sauvegarde préalable et rechargement hors connexion.
- Grilles PDF paysage, import portrait de deux pages, exports Excel et attestations individuelles / lot de classe.

Tests : `qa/cycle-v27-model.mjs`, `qa/cycle-v27-rounding.cjs`, `qa/cycle-v27-short-learning.cjs`, `qa/cycle-v27-regression.cjs`, `qa/cycle-v27-learning.cjs`, `qa/cycle-v27-multipage.cjs`.
