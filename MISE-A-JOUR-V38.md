# V38 — parcours aquatique plus lisible

- Les dix étapes occupent des cases d’une grille, au lieu de positions absolues. L’illustration et le libellé suivent le flux de chaque case.
- Suppression des mentions aller/retour qui chevauchaient les bordures et des traits passant sous les textes.
- Les deux lignes utilisent toute la hauteur disponible. Les niveaux ne sont plus tassés dans un panneau permanent.
- Toucher une étape ouvre une fenêtre portant le nom de l’élève et le numéro de ligne. Choisir un niveau valide et referme la fenêtre. Les critères restent identiques.
- Quatre colonnes de niveaux en paysage, deux colonnes sous 900 px.
- Données, notes, présence datée et vidéo V32 conservées.

## Vérifications

- `node qa/cycle-v37-model.mjs` : 4 352 combinaisons et scénarios de présence/notes, succès.
- `node qa/cycle-v38-ui.mjs` : deux lignes indépendantes, fenêtre au toucher, fermeture après notation, parcours vide, succès.
- Vérification visuelle et mesures dans Chromium, cadres de 1363 × 936, 1024 × 680 et 768 × 900. Aucun chevauchement entre illustration et libellé des vingt étapes. À 1024 × 680, les deux lignes tiennent sans défilement interne (hauteur 480 px, contenu 480 px). En portrait, les quatre descriptions du saut arrière ne sont pas coupées et se répartissent en deux colonnes.
- Validation manuelle d’un niveau dans la deuxième ligne : seule cette ligne est modifiée.
- Ces contrôles utilisent Chromium à des tailles proches de l’iPad ; ils ne constituent pas un essai sur Safari/iPad physique.
