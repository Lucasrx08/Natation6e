# V39 — évaluer deux élèves simultanément

- Retour d’une grille permanente, indépendante, pour chaque ligne d’eau.
- Paysage à partir de 1000 px : les deux élèves sont côte à côte, chacun avec son parcours et ses quatre niveaux visibles.
- Portrait : lignes superposées avec une grille sous chaque ligne.
- Toucher une étape ne change que le critère de cet élève. Noter ne ferme ni ne remplace les grilles. Aucun dialogue de notation.
- Sélections d’étapes et notes indépendantes, parcours non évalués explicités dans leur ligne.
- Présences datées, notes, exports et progression conservés.

## Vérification

- `node qa/cycle-v39-ui.mjs` : deux grilles permanentes, sélection d’étapes, notes indépendantes, absence de dialogue, élèves non disponibles.
- `node qa/cycle-v37-model.mjs` : 4 352 combinaisons, arrondis et présences datées.
- Chromium, cadres 1024 × 680 et 768 × 900 : six critères parcourus, aucune description coupée. Les deux grilles restent visibles. À 1024 × 680, aucun défilement du panneau principal.
- Essai manuel : anneau niveau 2 pour l’élève de gauche, flottaison debout niveau 3 pour l’élève de droite ; les deux résultats sont attribués aux bons élèves, sans dialogue.
- Ces vérifications de format utilisent Chromium, pas Safari sur un iPad physique.
