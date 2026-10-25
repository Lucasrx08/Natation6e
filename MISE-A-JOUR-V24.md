# Natation 6e - V24 (24 octobre 2026)

L’apprentissage occupe désormais l’écran disponible : bandeau compact, grille de profils calculée selon la largeur et la hauteur, passeport et chemin des missions réduits, illustration et critères à côté de l’action. Le bouton « Je tente la mission ! », les cases de réussite et la demande de validation restent visibles. Les fiches, l’historique et les validations demandées sont accessibles dans des fenêtres dédiées.

La grille a été vérifiée avec 36 élèves et les 19 missions sur quatre formats d’écran : 1024×768, 1180×820, 768×1024 et 1440×900. Les noms et prénoms utilisent des blocs distincts. Dans le plan, l’espace du nom s’adapte aux noms longs et sa taille est ajustée sur les dimensions réelles du texte après chargement des polices. Les bonnets, lunettes, déplacements, groupes et données de présence restent conservés.

Le demi-tour du parcours aquatique reprend exactement le tracé SVG du savoir-nager. Les quatre étapes de trajet ne portent plus de pastille grise de niveau. Les descriptions redondantes indiquant l’absence d’évaluation sont retirées ; la consigne de l’étape reste disponible.

## Critères corrigés

Les deux immersions partagent les mêmes niveaux :

1. Je ne franchis pas l’obstacle.
2. Je passe sous le tapis, mais en le touchant.
3. Je passe complètement sous le tapis.
4. Je passe complètement dans le cerceau lesté.

Pour l’anneau :

1. Je ne remonte pas l’anneau et je ne l’atteins pas.
2. J’atteins l’anneau, mais je ne le remonte pas.
3. Je récupère et je remonte l’anneau avec appui.
4. Je récupère et je remonte l’anneau sans appui.

Les anciens textes par défaut sont corrigés dans les barèmes V23 déjà enregistrés. Les critères personnalisés, coefficients, points, identifiants et niveaux attribués aux élèves sont conservés. Les impressions PDF et exports iDoceo utilisent ces mêmes critères.

## Capsule UHD

`media/parcours-aquatique-v24.mp4` : rendu natif 3840×2160, H.264 High, 24 images/s, durée 108 secondes. Le schéma, les titres et les textes sont dessinés directement à cette résolution. Le bassin ne comporte plus de quadrillage ni de traits de scintillement. Un seul nageur suit le parcours ; les postures de déplacement restent horizontales et les positions se raccordent d’une étape à l’autre. Les deux flottaisons durent toujours réellement 15 secondes.

Deux nouvelles illustrations détaillées de glisse ventrale et dorsale remplacent les petites images de déplacement. La durée n’apparaît plus dans le bandeau supérieur ni dans le titre de la fenêtre. Les chapitres, le téléchargement et la recherche dans la vidéo hors connexion restent disponibles. La capsule ne comporte pas de voix enregistrée.

## Vérifications

- `qa/cycle-v24-learning.cjs` : 36 profils, 19 missions et leurs actions visibles sur quatre écrans, validation d’une mission, téléchargement des fiches sans navigation, flèche et pastilles, noms longs dans les lignes et dans le vestiaire, persistance.
- `qa/cycle-v24-model.mjs` : migration des anciens textes, conservation des coefficients, points, descriptions personnalisées, identifiants et notes.
- `qa/cycle-v24-aquatic.cjs` : résultats indépendants, PDF/XLSX, vidéo UHD, chapitres et recherche hors connexion.
- `qa/cycle-v24-regression.cjs` : suivi, plan, déplacements tactiles, barèmes PDF/Excel, diplômes et impressions, données existantes et fonctionnement hors connexion.
- `qa/cycle-v24-awards.cjs` : attribution et retrait automatiques des diplômes selon les résultats du test savoir-nager.

Le stockage conserve sa version 12 et les identifiants d’ateliers existants. Une sauvegarde de migration est enregistrée sous `natation-6e:backup-before-v24` lorsque le stockage de l’appareil le permet. Les versions précédentes restent présentes dans le dépôt.
