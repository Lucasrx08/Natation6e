# Mise à jour v20 - 23 octobre 2026

## Classes : suivi du cycle

La vue principale présente une colonne par date de séance et le nom complet fixé à gauche. Les neuf évaluations du savoir-nager ont quitté cette vue ; leurs résultats restent conservés dans Savoir-nager et Résumé.

- Configuration d’une série de séances avec date de départ, nombre de séances et intervalle, ou ajout d’une seule date. Les dates déjà enregistrées sont conservées et dédoublonnées.
- Une touche fait passer la présence de Présent à Absent, Dispensé, puis Présent. Les séances futures non renseignées restent vides jusqu’au premier pointage.
- Le maillot, dans la même colonne, permet de signaler un oubli de matériel indépendamment de la présence.
- L’historique existant des présences, lignes d’eau, diplômes et groupes est conservé. Le nom ouvre toujours le test de l’élève.
- Les diplômes ont leur propre vue dans Classes.

## Plan du bassin

Vue dédiée à une à douze lignes d’eau, avec un vestiaire « À répartir ». Chaque étiquette affiche le nom complet, un personnage garçon ou fille et un bonnet parmi huit couleurs.

Le déplacement se fait par la poignée, à la souris ou au doigt. Il est également possible de toucher un élève puis l’en-tête de la ligne, ou de choisir sa destination dans la fiche du nageur. L’ordre et la ligne sont enregistrés. Les affectations de ligne restent datées et sont reprises dans le test savoir-nager. Le bouton Évaluer ouvre la grille pour le bon élève ; le test savoir-nager reste accessible séparément.

Le plan et la grille utilisent une vue agrandie pour conserver de la place sur tablette.

## Grille d’évaluation et note sur 20

Quatre critères et leurs quatre niveaux sont repris de la capture : Plongeon (15), Équilibre (20), Propulsion (20), Respiration (20). Couleurs : rouge, orange, jaune, vert.

La capture fournie représente 75 % du barème ; les 25 % restants ne sont pas inventés. Le professeur vérifie et valide le barème avant le premier calcul. Il peut modifier les points par niveau, les coefficients, les descriptions, ajouter ou retirer un critère. S’il utilise les seuls critères fournis, leur total sert à normaliser la note :

`20 × somme(coefficient × points du niveau / points maximum) / somme des coefficients`

Un clic choisit un niveau ; un second clic efface la sélection. Aucun critère non évalué ne devient un zéro et aucune note partielle n’est calculée. La note reste indépendante du résultat ASNS et des validations d’apprentissage.

L’export Excel, disponible dans la grille et le menu d’export du Résumé, comprend une seule colonne NOM Prénom, les niveaux par critère, la note numérique sur 20 et l’état de complétion. Une deuxième feuille documente le barème utilisé. Les élèves non évalués conservent une note vide.

## Apprentissages et fiches

- Le Double appui est une mission autonome. Les déclarations de réussite déjà en attente du professeur sont reprises comme acquises ; les traces précédentes sont conservées. La fin du parcours Flottaison reste validée par le professeur.
- Chaque PDF contient exactement une page A4 paysage, avec toutes les illustrations, les consignes et les critères : Atelier Flottaison (5 niveaux), Atelier Immersion (7), Atelier Entrée dans l’eau (7).
- Titres et noms de téléchargement en français, sans retour des bas de page retirés à la version précédente. Le téléchargement conserve l’application ouverte.
- Le contenu des missions et leurs illustrations sont conservés depuis la source commune `workshops-v19.js`.

## Vérification

`qa/cycle-v20-regression.cjs` vérifie les séances et le matériel, la migration du Double appui, la conservation des données et groupes, les affectations de ligne, les déplacements et réordonnancements à la souris et au toucher, les profils et bonnets, les points/coefficient/critères modifiables, les calculs et les exports XLSX numériques, les 19 missions et validations professeur, les diplômes, les trois PDF sur une page, quatre tailles d’écran et le fonctionnement hors connexion. Les mises en page PDF sont rendues et contrôlées visuellement.

Les fichiers de la v19 restent dans le dépôt. Le modèle de stockage existant est étendu sans remplacer les évaluations des élèves.
