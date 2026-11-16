# Mise à jour V37 — suivi et évaluations

- Résumé : prénoms explicites, noms complets sur une seconde ligne, liste de classe en une ou deux colonnes sans pagination.
- Démonstration : boutons précédent/suivant, compteur et choix rapide par tuiles avec recherche.
- Parcours aquatique : deux lignes indépendantes, chacune avec élève, avancement et note. Les quatre niveaux se rapportent à la ligne et à l’étape actives.
- Suivi : vue « Récapitulatif des notes », avec démonstration, parcours et total. Les élèves absents/dispensés restent dans ce récapitulatif et dans les exports.
- Notes : calcul pondéré commun, coefficients relatifs, arrondi au quart supérieur après calcul exact. Tous les critères au niveau 4 donnent le maximum du barème (20 pour 10 + 10). Une moyenne intermédiaire ne surligne plus abusivement le niveau 4.
- Présence : seules les observations absent/dispensé à la date actuelle Europe/Paris excluent temporairement l’élève des évaluations, du bassin et de l’apprentissage. Aucun effacement de progression ou de notes. Mise à jour du jour au retour sur l’application et pendant son ouverture.
- Cache : modules V37 distincts et nouveau cache, vidéo illustrée V32 conservée.

## Vérifications

Les scénarios de qa/cycle-v37-model.mjs ont été exécutés dans le moteur JavaScript disponible : 4 352 combinaisons de niveaux, 20/20, budgets 8+12 et 12+8, coefficients personnalisés, incomplétude, exports, dates Europe/Paris hiver/été, absences datées et conservation des données.

Les scénarios de qa/cycle-v37-ui.mjs ont été exécutés avec des composants et hooks simulés : 32 prénoms, navigation rapide, récapitulatif complet, exclusion des élèves non disponibles, deux lignes et évaluation indépendante, aucun élève disponible.

La syntaxe des modules modifiés a été analysée et les dépendances et le précache vérifiés. Aucun navigateur ni environnement d’exécution natif n’était disponible durant cette intervention : le rendu visuel Safari/iPad n’a donc pas été vérifié sur appareil.
