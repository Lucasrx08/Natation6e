# Mise à jour v17 – 5 octobre 2026

- Charte commune : rouge #f87c94, orange #f7c695, jaune #ffe5a6, vert #c8e1b9.
- Ateliers du test : trois niveaux rouge/orange/vert. Nages ventrale (ID4) et dorsale (ID6) : quatre niveaux rouge/orange/jaune/vert. Nouveau statut `competent` pour le jaune ; sauvegarde, relecture et import de groupes le préservent. Les anciennes évaluations vertes restent vertes.
- Nage dorsale diagnostique calculée uniquement sur ID6 : le demi-tour reste évalué et exporté séparément.
- Classes : neuf repères numérotés avec intitulé et statut ; palette identique dans les lignes d’eau, le résumé et les compteurs. Les nages jaunes sont acquises dans le score /9 et distinguées par leur compteur jaune.
- Groupes automatiques : toute étape rouge → G1, y compris un parcours incomplet. Sans rouge, parcours incomplets dans À terminer. Nage orange ou plus de deux étapes orange → G2. Deux nages jaunes/vertes avec zéro ou une étape orange → G3. Deux étapes orange hors nage = frontière G2/G3 : attribuer au groupe le moins nombreux pour équilibrer sans franchir les critères. Les déplacements manuels explicitement choisis restent prioritaires.
- Export résultats : nages en 1–4, autres critères en 1–3, barème explicite. Export groupes : compteurs et nombre de nages jaunes.
- Apprentissage : images conservées, carte des niveaux cliquable, progression, missions verrouillées, trois critères par mission (un repère quantitatif et des critères qualitatifs). Flottaison debout et dorsale sans matériel : cible de 15 s cohérente avec les repères du test déjà présents. Checkpoints professeur conservés : 3/5 en flottaison, 2/4 dans les deux autres modules. Les anciennes réussites sont conservées.
- Fiches PDF existantes et téléchargements conservés.

Validation : vérification syntaxique ; tests modèle de groupes (rouges, oranges, jaunes, frontière et overrides) ; tests navigateur des cycles 4 niveaux, parité Classe/Résumé/Test, conservation du jaune au rechargement et hors ligne ; critères, déverrouillage, blocage au checkpoint ; test complet Flottaison (validation enseignant, anciennes données, téléchargement PDF et images hors ligne). Quatre tailles de viewport : 1440×900, 1024×768, 768×1024, 390×844. Tests simulés Chromium, sans test physique sur iPad.
