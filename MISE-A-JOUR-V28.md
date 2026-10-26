# Natation 6e — V28

27 octobre 2026

## Capsule entièrement refaite

Une animation pédagogique originale en dessin vectoriel remplace la capsule précédente. Le nageur possède des bras et des jambes animés ; les déplacements, le saut, le demi-tour, les immersions et la remontée de l’anneau sont dessinés dans des scènes dédiées. Ce rendu illustré est volontairement distinct du projet de vidéo 3D, mis de côté à la demande de Lucas.

- Vidéo de 108 secondes, format 16:9, master natif 3 840 × 2 160 à 30 images par seconde ; version Full HD pour la lecture courante.
- Les dix étapes gardent leurs horaires et leur ordre validés.
- Saut arrière avec impulsion des jambes, bras le long du corps et pieds en premier.
- Tapis et cerceau présentés simultanément comme deux alternatives, à l’aller comme au retour.
- Deux flottaisons de 15 secondes réelles, avec décompte et repères sonores discrets.
- Demi-tour expliqué en vue de dessus, récupération visible de l’anneau et retour au bord.
- Typographie Poppins, palette aquatique, consignes courtes et repérage des étapes.
- Bande sonore originale et sous-titres français ; aucun abonnement ni crédit vidéo externe.

## Lecteur dans l’application

Le bouton « Voir le parcours » ouvre le nouveau lecteur. Les dix raccourcis permettent de rejoindre directement une étape et signalent celle en cours. Le choix Full HD / 4K conserve la position de lecture. Le téléchargement propose le master 4K. La version Full HD est disponible hors connexion après la mise en cache de l’application ; une première lecture 4K nécessite une connexion.

Les résultats d’évaluation et les données des élèves utilisent les mêmes modèles que la V27. Les notes restent arrondies au quart supérieur.

## Sources

Le générateur reproductible se trouve dans `video-production/render_parcours_v28.py`. Les formes, mouvements et sons ont été créés pour cette capsule. La police Poppins et sa licence sont déjà présentes dans `vendor/poppins`.

## Vérifications

Le test navigateur `qa/cycle-v28-video.cjs` contrôle les dix accès directs, la lecture, la position conservée au changement de qualité (en pause et en lecture), le téléchargement 4K, quatre dimensions d’écran et la lecture hors connexion. Les tests de notes de la V27 passent également. Les deux vidéos sont décodables et contiennent les dix étapes, avec des flottaisons de 15 secondes.
