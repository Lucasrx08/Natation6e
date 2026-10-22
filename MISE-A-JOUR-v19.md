# Mise à jour v19 - 22 octobre 2026

## Classes

- Présent, absent ou dispensé par élève et par date de séance. Les séances précédentes restent consultables et modifiables.
- Affectation d’une ligne d’eau (1 à 12) conservée jusqu’à une nouvelle affectation. Le numéro est repris dans la ligne d’eau du bassin.
- Le nom de l’élève et chacune des neuf étapes sont cliquables : ouverture dans le bassin, avec mise en évidence de l’étape choisie, sans changer sa couleur.
- Attribution du diplôme depuis la classe pour un test complet sans étape rouge, selon le résultat déjà utilisé par l’application. Attribution datée, retrait possible, impression paysage personnalisée. Le document utilise le nom et la classe ; aucun diplôme n’est attribué automatiquement.

## Résumé

Boutons Transférer retirés. Groupes, glisser-déposer, changements manuels et exports Excel conservés.

## Missions et fiches

Une seule source de contenu (`workshops-v19.js`) produit l’écran et les fiches. Consignes et critères à la première personne.

- Flottaison : cinq missions, critères temporels 3 s / 5 s / 10 s intégrés ; Étoile libre en mission 4 et Sentinelle en mission 5. Suppressions et reformulations demandées appliquées.
- Immersion : sept missions ; rouge/rouge/rouge/orange/orange/vert/vert. Nouveaux noms : Fabrique à bulles, Masque immergé, Porte sous-marine, Tunnel guidé, Traversée libre, Chercheur de trésors, Grande traversée. Ajout du mur, barre, tapis, récupération à 2 m et critères respiratoires demandés.
- Entrée : sept missions ; rouge/orange/orange/vert/diamant/diamant/diamant. Mission 1 prévalidée par défaut ; le professeur peut la remettre À retravailler et cette décision persiste. Nouvelles illustrations : saut avec matériel, bascule groupée menton à la poitrine, bouteille arrière et plongeons assis / bord / plot.
- Validation professeur aux missions 3 et 5 de flottaison, et 4 et 7 des parcours à sept missions. Autoévaluation adaptée aux missions ayant deux ou trois critères.
- Bas de fiche, badges Exploration/Professeur, case Compétence acquise/date et textes de bas de page retirés. A4 paysage : flottaison une page ; immersion et entrée deux pages (quatre missions puis trois).
- Dix nouvelles illustrations 3D, sources originales conservées ; outil image_gen intégré et poses documentées dans `qa/image-prompts-v19.json`.

## Données

Les tests savoir-nager, noms, classes, résultats et groupes manuels restent inchangés. Les nouveaux parcours utilisent de nouvelles clés `*-v19-*` : les validations des anciens exercices restent en historique visible au professeur et ne deviennent pas des validations des nouveaux critères. Aucune ancienne trace n’est supprimée.

## Vérification

`qa/cycle-v19-regression.cjs` : suivi par séance, rappel des lignes, lien bassin et focus sans modification d’évaluation ; attribution/retrait ; échappement des noms sur le diplôme ; suppression Transférer ; trois parcours entièrement parcourus ; validations professeur ; prévalidation réversible ; niveaux diamant ; sauvegarde/rechargement ; données et groupes existants conservés ; téléchargements des trois PDF sans quitter l’app ; fonctionnement hors ligne. Écrans Chromium simulés : 1440×900, 1024×768, 768×1024, 390×844. Pas de test sur iPad physique.

Les cinq pages des fiches et l’impression d’un diplôme ont été rendues pour contrôle visuel. Contrôle textuel des PDF : nombres de missions et suppression des bas de page.
