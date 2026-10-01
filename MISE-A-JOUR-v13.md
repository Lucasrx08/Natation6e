# Natation 6e — Apprentissages, groupes et fiches

La version 13 conserve les données et les écrans Classes/Savoir-nager de l’application, et refond l’Apprentissage pour l’usage au bassin.

- Parcours : « Immersion aller », « Flottaison debout », demi-tour au milieu du virage, « Flottaison dos » en 6, « Nage dorsale » en 7, « Immersion retour » en 8. Les identifiants des évaluations restent inchangés.
- Apprentissage : cartes de nageurs avec noms complets, grande commande « Autre nageur », trois pouvoirs aquatiques et quatre paliers par module. Couleurs fixes : rouge, orange, orange, vert. Un indicateur séparé indique la réussite.
- Paliers 1 et 3 : bilan élève. Paliers 2 et 4 : demande et validation obligatoire du professeur. La suite se débloque après réussite ou validation selon le palier. « Je réessaie » ou « À retravailler » remet les paliers suivants à réaliser.
- Les consignes détaillées sont sur les fiches, accessibles depuis « Fiches à télécharger et imprimer ». Trois PDF A4 sont intégrés et disponibles hors connexion après le premier chargement de la version.
- En mode professeur, ajout d’un PDF personnel par module (5 Mo maximum). Il est enregistré dans IndexedDB sur cet appareil. Il n’est pas publié pour les autres enseignants ni inclus dans les transferts de groupes.
- Résumé : compteurs sans pourcentages ; vues Profils et Groupes en pleine largeur. Les listes des groupes ne possèdent plus de défilement interne. Les très grandes classes peuvent nécessiter le défilement général de la page.
- Déplacement manuel et export d’un groupe conservés. « Transférer » télécharge un JSON à importer dans Classes sur l’appareil du collègue. Ce fichier est une copie, sans synchronisation automatique. iDoceo utilise le XLSX.
- Le code professeur local et toutes les données existantes sont conservés. Le schéma de sauvegarde reste compatible avec la version 12.

## Vérifications

Chromium : migration, groupes manuels persistants, déplacements souris/toucher, export XLSX avec une seule colonne NOM Prénom, transfert d’un groupe, bilan élève, contrôles des paliers 2 et 4, code professeur, PDF intégré, ajout PDF personnel persistant, hors connexion et quatre tailles d’écran (1440×900, 1024×768, 768×1024, 390×844). Vérification supplémentaire d’une classe de 24 élèves et rendu visuel des trois PDF. Ces vérifications ne remplacent pas un essai sur un iPad physique.

Test reproductible : `qa/cycle-regression.cjs`, avec Playwright et Python. La version stable antérieure est conservée dans la branche `backup-before-cycle-v12-20261001` ; les fichiers v12 restent aussi dans le dépôt.
