# Natation 6e — V26

25 octobre 2026

- **Banque d’icônes intégrée** : planche, frite, ceinture et pull-buoy en 3D sur fond transparent. La banque s’affiche dès l’ajout d’une colonne. Catégories, recherche, sélection simple ou multiple et images personnelles réutilisables entre colonnes. Les colonnes de niveaux, d’observation et de nombre restent disponibles.
- **Grille d’évaluation complète** : les trois lignes Saut arrière, Immersion et Flottaison présentent chacune quatre descriptions colorées. La case correspondant aux résultats du parcours est mise en évidence automatiquement. Les moyennes exactes restent utilisées pour le calcul ; une moyenne fractionnaire est indiquée sur la case du niveau le plus proche (demi-niveau arrondi vers le haut).
- **Points configurables** : le bouton Configurer ouvre la répartition des points, par exemple 8 points pour la démonstration et 12 pour le parcours. Les critères, coefficients, points par niveau et imports se règlent depuis ce même espace. La barre principale affiche le total sans le détail du barème.
- **PDF en paysage** : les grilles de démonstration et de parcours sont reconstruites en A4 paysage. Un PDF source importé reste conservé dans l’application ; tous ses critères reconnus sont repris dans les nouvelles grilles. Les longues grilles sont réparties sur plusieurs pages paysage.
- **Configurer le cycle** : le panneau des anciennes palettes d’icônes est supprimé. Les séances et les présences déjà enregistrées sont conservées.
- **Apprentissage** : les catégories utilisent les illustrations 3D des nageurs. Les titres, textes de mission et boutons ont été réorganisés. Les sept missions passent sur deux rangées en mode portrait, avec des textes lisibles sans superposition.

Les attestations de l’établissement et leurs deux pages sont conservées. Les données restent au même format de stockage ; une copie de sauvegarde est créée avant le chargement de la V26.

## Vérifications

- Calcul des points réglables, moyennes exactes, résultats incomplets et conservation des identifiants des anciennes colonnes.
- 36 élèves sur quatre formats : 1 024 × 768, 1 180 × 820, 768 × 1 024 et 1 440 × 900.
- Les 19 missions d’apprentissage sur ces quatre formats : boutons visibles, textes contenus et absence de chevauchement des étiquettes.
- Banque 3D, sélection simple et multiple, recherche, niveaux, observations, valeurs nulles et zéro, rechargement et anciennes colonnes.
- Exports Excel avec répartition 8 + 12 ; PDF de classe avec 36 grilles paysage ; import d’un document portrait de deux pages sans perte de critères.
- Attestation individuelle de deux pages et lot de 68 pages pour les élèves éligibles.
- Fonctionnement hors connexion, polices, nouveaux visuels, notes et attestations ; aucune erreur JavaScript observée.

Tests : `qa/cycle-v26-model.mjs`, `qa/cycle-v26-regression.cjs`, `qa/cycle-v26-learning.cjs`, `qa/cycle-v26-multipage.cjs`.

Visuels et prompts : [VISUELS-V26.md](VISUELS-V26.md).
