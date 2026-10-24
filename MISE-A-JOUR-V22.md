# Natation 6e — V22 (24 octobre 2026)

## Suivi du cycle

Chaque élève est présent par défaut à toutes les séances, y compris les dates futures. Toucher la case permet de choisir Présent, Absent ou Dispensé. L’oubli de matériel reste indépendant de la présence et apparaît dans la même case.

Les quatre icônes des captures ont été redessinées en SVG transparent : coche verte, croix rouge, étoile de santé rouge et cintre jaune avec serviette rose. La nouvelle palette est appliquée une fois aux classes existantes ; les anciens réglages d’icônes sont conservés dans `attendanceIconsBeforeV22`. Les absences, dispenses et oublis déjà saisis restent inchangés. Une ancienne case « À renseigner » est désormais affichée comme présente par défaut.

## Plan du bassin et identité visuelle

Le bassin reprend les dégradés de l’eau, les reflets, les bordures et les séparateurs rouges, blancs et bleus de Savoir-nager. Classes utilise de nouveau les titres épais et les boutons à dégradé de l’interface d’origine. Les vues restent adaptées à la hauteur de l’écran.

Les avatars plats sont remplacés par deux portraits 3D de la même famille visuelle que les ateliers. Le bonnet et les montures des lunettes peuvent être recolorés séparément. La peau, les verres, les reflets et la transparence sont conservés. Les portraits, les icônes et leur recoloration fonctionnent localement, sans service externe à l’utilisation.

## Test et diplômes dans Résumé

La vue avec les coupes et l’onglet Test savoir-nager sont retirés de Classes. Classes contient Suivi du cycle, Plan du bassin et Évaluation démonstration de nage.

Le Résumé est le centre de suivi du test. Chaque ligne affiche le profil, le nombre d’étapes acquises sur neuf, le résultat et une icône diplôme :

- Neuf étapes évaluées, aucune rouge : diplôme attribué automatiquement. Cela comprend « Maîtrisé » et « À consolider ».
- Une étape rouge, même si le parcours n’est pas terminé : « Non validé », diplôme indisponible.
- Test incomplet sans rouge : « À terminer », aucun diplôme.

Toucher le nom d’un élève ou double-cliquer sur sa ligne permet de repasser le test. Une nouvelle étape rouge retire aussitôt l’accès au diplôme ; corriger cette étape le rétablit si le test est complet. Les anciens drapeaux d’attribution manuelle ne permettent pas d’exporter le diplôme d’un test actuellement non validé. Les dates déjà valides sont conservées ; une nouvelle réussite reçoit la date du jour à Paris.

L’icône diplôme télécharge le document individuel. Le bouton Modèle PDF est accessible dans les résultats. Le menu Exporter garde l’impression et le téléchargement de tous les diplômes actuellement validés de la classe, quelle que soit la recherche d’affichage. Il ne déplace plus l’utilisateur vers Classes pendant la préparation. L’impression en série affiche son avancement.

## Données et contrôles

Les classes restent au format de stockage version 12. Les évaluations, ateliers, groupes manuels, dates, lignes d’eau et couleurs choisies sont conservés. Une copie des données avant cette migration est enregistrée sous `natation-6e:backup-before-v22` quand le stockage de l’appareil le permet. Des étapes manquantes ne sont pas considérées comme réussies lors du chargement.

Contrôles automatisés :

- `qa/cycle-v22-regression.cjs` : 36 élèves fictifs, quatre formats tablette/ordinateur, suivi, icônes, portraits et couleurs, déplacements souris/tactiles, grille entière, imports PDF/Excel, diplômes individuels et de classe, modèles simples/avec formulaire, impression en série, conservation des données et hors connexion.
- `qa/cycle-v22-awards.cjs` : maîtrisé, à consolider, rouge, incomplet, étapes manquantes, révocation et réattribution immédiates, filtrage du lot, migration des icônes et conservation des absences/dispenses/oubli matériel.
- `qa/cycle-v22-smoke.cjs` : démarrage sans données existantes, navigation, images et accès au modèle de diplôme depuis Résumé.

Les tests utilisent Chromium et des formats d’écran simulés ; ils ne constituent pas un essai sur un iPad physique.
