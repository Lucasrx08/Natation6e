# Natation 6e - V25 (25 octobre 2026)

L’attestation fournie par l’enseignant remplace le diplôme intégré précédent. Le PDF vierge d’origine est conservé sans modification dans `assets/v25/attestation-savoir-nager.pdf`. Chaque attestation générée conserve les deux pages et les graphismes du document, avec le prénom et le nom, la classe sur la couverture, le nom sur la seconde page et la date d’attribution. Les textes ajoutés utilisent Poppins, comme le modèle. Le nom de l’enseignant est modifiable dans « Modèle PDF ». Les documents s’exportent individuellement depuis le résumé ou en un seul fichier pour les élèves éligibles de la classe. Les modèles PDF personnels déjà importés restent disponibles.

## Suivi du cycle

Le bouton « + Colonne » ajoute une colonne titrée à la classe. Elle peut être associée à une séance ou placée à la fin du suivi. Cinq types sont disponibles :

- Évaluation à quatre niveaux : émoticônes vectorielles rouge, orange, jaune et verte.
- Matériel : planche, frite, ceinture et pull-buoy, avec plusieurs choix possibles par élève.
- Émoticônes : banque intégrée, caractères personnalisés et images/captures recadrées.
- Observation : texte libre.
- Nombre : valeur numérique, y compris zéro.

Une touche sur la case permet de la renseigner ou de l’effacer. Une touche sur l’en-tête permet de renommer ou de retirer la colonne et de changer sa séance associée. Son type est fixé à la création pour protéger les valeurs existantes. Le suivi conserve tous les élèves à l’écran ; des pages de colonnes remplacent le défilement vertical quand les séances et observations deviennent nombreuses. Les présences et oublis de matériel conservent leur fonctionnement. L’export « Suivi du cycle · colonnes » comprend les séances, les observations et le matériel, ainsi qu’une feuille décrivant les colonnes.

## Une note finale sur 20

La grille de démonstration de nage conserve les critères et niveaux déjà saisis. Elle affiche en dessous trois lignes automatiques issues du parcours aquatique :

| Ligne | Niveaux utilisés |
| --- | --- |
| Saut arrière | Le niveau du saut arrière |
| Immersion | Moyenne de l’immersion aller, de l’immersion retour et de l’anneau |
| Flottaison | Moyenne de la flottaison debout et de l’étoile dorsale |

Les moyennes de niveaux restent exactes : 2, 3 et 4 donnent 3 ; 2 et 4 donnent 3 ; 2 et 3 donnent 2,5. Les résultats sont lus directement dans les ateliers, sans copie ni double saisie. Une ligne ouvre le détail des ateliers et permet de rejoindre le parcours.

La démonstration vaut 10 points et le parcours vaut 10 points. Les coefficients et points par niveau existants sont conservés. Pour le parcours, le coefficient d’une famille est la somme des coefficients de ses ateliers. Avec les six coefficients par défaut égaux à 1, cela conserve la répartition antérieure entre les six observations. Les points correspondant à un niveau moyen fractionnaire sont interpolés entre les deux niveaux voisins. Chaque partie est arrondie au centième, puis les deux notes sont additionnées pour afficher un total cohérent avec les sous-notes visibles.

Un atelier manquant laisse sa moyenne et la note correspondante vides ; aucun zéro ni score partiel n’est ajouté. Le test du savoir-nager, l’attribution des attestations et les observations libres du suivi restent indépendants de cette note finale. Les exports iDoceo et les évaluations imprimées contiennent les sous-notes, les moyennes et le total sur 20. La grille intégrée tient sur une page par élève ; les grilles PDF personnelles conservent leur document d’origine et reçoivent un récapitulatif du parcours.

## Conservation et contrôles

Le stockage reste compatible avec la version 12. Les identifiants des élèves, les niveaux, les séances, les groupes et l’apprentissage sont conservés ; les nouvelles colonnes et leurs valeurs sont ajoutées à ces données. Une sauvegarde précédant la migration V25 est créée sur l’appareil lorsque son stockage le permet.

Vérifications :

- `qa/cycle-v25-model.mjs` : moyennes exactes, barèmes non linéaires, coefficients relatifs, deux parties sur 10 et total sur 20, absence de note si des données manquent, suivi sans effet sur les évaluations.
- `qa/cycle-v25-regression.cjs` : 36 élèves sur quatre formats d’écran, cinq types de colonnes, matériel multiple, émoticône personnalisée, zéro numérique, rechargement, scores liés, exports Excel/PDF et attestation intégrée hors connexion.
- `qa/cycle-v25-legacy.cjs` : suivi existant, imports de grilles PDF/Excel, identifiants et niveaux conservés, modèles de diplômes personnels et AcroForms, impressions en lot, déplacements tactiles, apprentissage et fonctionnement hors connexion.

Le PDF intégré a été comparé visuellement au modèle fourni. Un exemple à nom composé long et un lot de 34 attestations (68 pages) ont été contrôlés. Les fichiers de test utilisent uniquement des élèves fictifs. Les polices Poppins et leur licence OFL sont incluses pour que l’impression fonctionne sans connexion.
