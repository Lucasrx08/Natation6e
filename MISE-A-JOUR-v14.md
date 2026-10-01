# Natation 6e — Exports, retour au test et fiches paysage

- Exporter vers iDoceo ouvre deux choix : résultats du test savoir-nager ou répartition des groupes. Le premier conserve les critères, le demi-tour et le résultat ASNS ; le second exporte le groupe, son niveau et les nombres d’étapes acquises, à consolider, non acquises et à évaluer. Les exports propres à un groupe restent disponibles.
- Un double-clic sur une ligne du résumé ou un appui sur le nom ouvre ce nageur dans la première ligne d’eau. Les évaluations ne sont pas effacées : elles sont modifiables en repassant le test.
- Les noms se déplacent directement entre groupes à la souris ou au toucher, sans menu G1/G2/G3/Auto. Le groupe de destination est surligné. Au clavier, les flèches gauche/droite changent le groupe d’un nom sélectionné. Les choix manuels sont conservés.
- Le bilan « 7/9 acquis » compte uniquement les étapes vertes, accompagné des nombres d’étapes vertes/orange/rouges. Les étapes non évaluées restent distinctes ; une étape orange n’est pas présentée comme maîtrisée. Le bilan apparaît dans les profils et les groupes, sans note sur 20.
- Trois fiches PDF A4 paysage : quatre paliers colorés, nageurs illustrés, consigne et « Je réussis si… ». Les schémas vectoriels complètent les illustrations de l’application pour les poses absentes des assets.
- Le téléchargement utilise un Blob destiné au téléchargement et une cible distincte : la page de l’application n’est plus remplacée par la fiche. Le même mécanisme protège les téléchargements de PDF personnels. Sur les navigateurs qui affichent une prévisualisation malgré le téléchargement, elle s’ouvre séparément.
- Le cache hors connexion est renouvelé avec les nouvelles fiches ; les classes, groupes, apprentissages et le code professeur sont conservés.

## Vérifications

Chromium : exports des deux fichiers et contenu XLSX, double-clic vers le bon nageur sans remise à zéro, bilan sur neuf étapes, drag à la souris et événements tactiles sans menu, téléchargement PDF puis navigation dans l’application, migration, import/transfert, validations professeur, code local, ajout PDF persistant, quatre tailles d’écran et hors connexion. Une classe de 24 élèves a été contrôlée avec ses trois groupes complets sans défilement interne. Les trois PDF ont été rendus et examinés. Pas de test sur iPad physique.

Tests : `qa/cycle-regression.cjs` et `qa/summary-regression.cjs` utilisent Playwright/Python. Génération des fiches : `qa/generate-fiches.py` avec ReportLab, Node et les polices DejaVu. Les fichiers v13 restent dans le dépôt.
