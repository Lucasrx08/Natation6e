# Natation 6e — V21 (23 octobre 2026)

## Utilisation

- Les quatre vues de **Classes** partagent un en-tête compact. Le suivi se répartit sur deux panneaux lorsque cela permet de garder toute la classe visible. Les séances supplémentaires disposent de flèches de navigation si nécessaire.
- Le bouton **Exporter**, en haut à droite dans toutes les rubriques, donne accès aux exports iDoceo (classe ou groupe), aux impressions et aux trois fiches ateliers.
- **Plan du bassin → Lignes d’eau** permet de nommer les lignes physiques (5, 6…). Sélectionner un élève, puis **Personnaliser**, règle son personnage, son bonnet et ses lunettes. On peut glisser son personnage ou toucher une ligne pour le déplacer. Le vestiaire « À répartir » occupe une petite colonne et disparaît lorsqu’il est vide. La loupe d’une ligne agrandit son groupe.
- **Évaluation démonstration de nage → Importer PDF / Excel** lit une grille à quatre niveaux. Vérifier les coefficients et les points dans l’aperçu avant de l’appliquer. L’export Excel de l’application contient lui-même un onglet Barème réimportable. L’ancien barème reste disponible tant qu’un import n’est pas validé. Les critères portant le même nom conservent leurs niveaux déjà saisis.
- Un PDF doit contenir du texte sélectionnable, avec les quatre en-têtes « NIVEAU 1 » à « NIVEAU 4 » et les titres de critères dans la colonne de gauche. Les PDF scannés ne sont pas reconnus automatiquement ; utiliser l’export Excel ou le barème manuel. L’impression conserve la grille PDF d’origine et marque les niveaux sélectionnés. Sans PDF importé, une grille imprimable est générée.
- Le document de référence fourni auparavant ne totalise que 75 % des coefficients. Aucun critère manquant n’est inventé : compléter ou confirmer ces coefficients relatifs dans **Barème à valider**. La note sur 20 reste vide tant que le barème n’est pas confirmé et que tous les critères ne sont pas renseignés.
- **Test savoir-nager → Modèle PDF** reçoit le diplôme de l’enseignant. Les champs PDF nommés Nom, Prénom, Classe et Date peuvent être remplis automatiquement. Sur un PDF simple, déplacer les étiquettes NOM / Prénom / Classe sur les emplacements voulus, choisir leur taille et leur police, puis enregistrer. La case « NOM Prénom sur une ligne » permet de réunir l’identité.
- **Exporter → Impressions → Imprimer les diplômes attribués** imprime tous les diplômes attribués de la classe en une seule opération, même si la recherche filtre l’affichage. Les diplômes non attribués sont exclus. Le téléchargement du lot PDF reste possible.
- **Configurer les séances → Icônes** propose une palette et l’import/recadrage d’images pour les présences, absences, dispenses et oublis de matériel.

Les modèles déposés sont conservés sur l’appareil (IndexedDB). Les fiches ateliers restent sur une page A4 paysage avec des images, titres, consignes et critères alignés. Les trois titres sont « Atelier - Flottaison », « Atelier - Immersion », « Atelier - Entrer dans l’eau ».

## Conservation des données

Le stockage de la classe reste en version 12. Les évaluations du savoir-nager, les suivis de séance, les groupes manuels, les anciens ateliers et les diplômes attribués sont conservés. La migration du Double appui maintient son auto-validation. Les sources V20 restent présentes pour permettre un retour à la version précédente.

## Vérification

`qa/cycle-v21-regression.cjs` utilise un navigateur Chromium avec 36 élèves, des formats tablette paysage/portrait et ordinateur, des déplacements souris/tactiles, des imports PDF/Excel, des diplômes PDF simples et avec formulaire, les téléchargements et le fonctionnement hors connexion. `qa/create-v21-fixtures.py` crée uniquement des documents synthétiques de contrôle dans `/tmp` ; ils ne constituent pas les modèles de l’établissement. `qa/generate-missions-v21.py` régénère les trois fiches depuis les ateliers existants.

Pour lancer la vérification, utiliser Node avec Playwright disponible et `PLAYWRIGHT_EXECUTABLE_PATH` si Chromium n’est pas installé à `/tmp/chromium`. Dépendances Python de contrôle : ReportLab, pypdf, Pillow. Les PDF finaux sont également rendus et contrôlés visuellement.
