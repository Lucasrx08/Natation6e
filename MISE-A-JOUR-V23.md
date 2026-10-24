# Natation 6e - V23 (24 octobre 2026)

## Saut arrière et fiche atelier

Le visuel de départ est remplacé dans le test savoir-nager, les choix d’atelier, le niveau 4 d’apprentissage, la capsule et la fiche à télécharger. Le nageur pousse avec ses jambes et saute en arrière, bras le long du corps, pieds en premier. Le niveau 4 s’appelle « Le Saut arrière ». La fiche s’intitule « Atelier - Entrée dans l’eau » et conserve ses sept niveaux sur une seule page A4 paysage, avec titres, consignes et critères alignés.

Les identifiants d’apprentissage restent identiques : aucun palier acquis ne disparaît.

## Classes et affichage

- Les classes sont accessibles par des tuiles. Jusqu’à quatre tuiles se partagent la largeur disponible ; au-delà, le bandeau peut se parcourir horizontalement.
- Les lignes du plan de bassin ont leurs séparateurs rouges, blancs et bleus sur leurs bords verticaux.
- Dans le suivi, le cintre se place immédiatement à côté de l’icône de présence, à la même taille, sur fond transparent. Le nombre de dates affichées s’adapte à la largeur ; les flèches permettent de parcourir les séances en conservant toute la liste des élèves.
- La légende du savoir-nager utilise des pastilles colorées compactes et reste dans son bandeau.
- La quatrième vue de Classes est « Évaluation parcours aquatique ».

## Deux évaluations distinctes

Le parcours aquatique est indépendant du test savoir-nager, des diplômes automatiques et de l’évaluation de démonstration de nage.

| Étape | Action | Évaluation du parcours |
| --- | --- | --- |
| 1 | Saut arrière | 4 niveaux |
| 2 | Nage ventrale puis immersion aller | Immersion : 4 niveaux |
| 3 | Flottaison debout, 15 secondes | 4 niveaux |
| 4 | Reprise de la nage ventrale | Trajet |
| 5 | Demi-tour de 180° sans toucher le fond | Trajet |
| 6 | Nage dorsale | Trajet |
| 7 | Étoile de mer dorsale, 15 secondes | 4 niveaux |
| 8 | Reprise dorsale puis immersion retour | Immersion : 4 niveaux |
| 9 | Nage dorsale puis récupération de l’anneau | Anneau : 4 niveaux |
| 10 | Rejoindre le bord et s’accrocher | Trajet |

Un clic sur une étape évaluée présente quatre grandes cases avec les critères. Un second clic sur le niveau choisi l’efface. Les nages et le demi-tour restent visibles, sans compter dans cette note.

Par défaut : six coefficients égaux et 1, 2, 3, 4 points selon le niveau. La note sur 20 n’apparaît qu’une fois les six ateliers renseignés. Le bouton « Barème » permet de modifier descriptions, coefficients et points, en conservant les six critères et leurs identifiants.

Pour l’anneau, les niveaux intermédiaires proposés sont : niveau 2, l’anneau est atteint sans être remonté ; niveau 3, l’anneau est remonté avec aide. Le niveau 4 correspond à sa récupération sans appui. Les deux immersions reprennent : non franchi / tapis touché / tapis franchi / cerceau lesté franchi.

L’exporteur commun propose les notes et niveaux du parcours vers iDoceo, pour la classe ou un groupe, ainsi que les évaluations PDF de classe et une grille vierge à imprimer. Le nom et le prénom restent réunis dans une colonne.

## Capsule animée

`media/parcours-aquatique-v23.mp4` : H.264, 1280 × 720, 16:9, 20 images/s, durée exacte de 108 secondes. Schéma animé avec déplacement du nageur, progression, consignes à l’écran et décomptes réels des deux flottaisons. Une piste de sous-titres français est fournie ; la capsule ne comporte pas de voix enregistrée.

| Temps | Contenu |
| --- | --- |
| 0-5 s | Vue générale |
| 5-12 s | Saut arrière |
| 12-24 s | Nage ventrale et immersion aller |
| 24-39 s | Flottaison debout, 15 s |
| 39-44 s | Reprise ventrale |
| 44-50 s | Demi-tour |
| 50-57 s | Nage dorsale |
| 57-72 s | Étoile dorsale, 15 s |
| 72-85 s | Reprise dorsale et immersion retour |
| 85-96 s | Reprise dorsale et anneau |
| 96-103 s | Rejoindre le bord |
| 103-108 s | Conclusion |

Le tapis et le cerceau sont présentés côte à côte comme deux alternatives. Le lecteur permet le plein écran, l’accès direct à chaque étape, le téléchargement et le retour à l’évaluation. Le fichier est conservé pour l’usage hors connexion ; le service worker gère les requêtes par plages d’octets nécessaires à la navigation dans la vidéo.

## Conservation et contrôles

Le format de stockage reste la version 12. Les nouvelles valeurs utilisent `student.aquaticLevels` et `class.aquaticRubric`. Les champs `assessments`, `rubricLevels`, les groupes manuels, séances, couleurs et documents personnels restent conservés. Une sauvegarde de migration est créée sous `natation-6e:backup-before-v23` si le stockage le permet.

- `qa/cycle-v23-aquatic.cjs` : classes, icônes côte à côte, cordes verticales, légende, dix étapes/six critères, notes, séparation des données, exports PDF/XLSX, vidéo et recherche hors ligne.
- `qa/cycle-v23-regression.cjs` : 36 élèves fictifs sur quatre tailles tablette/ordinateur, suivi, portraits, déplacements tactiles, import de barème PDF/Excel, notes et diplômes individuels/en lot, impression et persistance.
- `qa/cycle-v23-awards.cjs` : attribution, retrait et réattribution des diplômes selon le test, conservation de l’historique.
- Les illustrations originales sont copiées sans altération dans `assets/v23/`. Les prompts et références figurent dans `VISUELS-V23.md`.

Les versions antérieures sont conservées pour permettre un retour au code précédent.
