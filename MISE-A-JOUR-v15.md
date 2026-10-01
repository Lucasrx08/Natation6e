# Flottaison — cinq niveaux adaptés à la fiche fournie

La fiche utilisateur présente les anciens niveaux 2 à 6. Ils deviennent les niveaux 1 à 5 :

| Ancien | Nouveau | Couleur | Atelier |
| --- | --- | --- | --- |
| 2 | 1 | Rouge | Étoile ventrale, une main sur le mur et une main sur une frite |
| 3 | 2 | Rouge | Étoile dorsale, une main sur le mur et une main sur une frite |
| 4 | 3 | Orange | Étoile dorsale avec deux frites et redressement |
| 5 | 4 | Vert | Flottaison debout, tête hors de l’eau, à portée du bord ou d’une ligne d’eau |
| 6 | 5 | Vert | Étoile dorsale sans matériel et redressement |

Les consignes et critères de réussite sont repris et reformulés à partir de la capture fournie. La référence « Voir N1 » du premier exercice renvoie à un niveau absent de cette capture : aucun critère de durée ou de distance supplémentaire n’a été inventé. Les références aux anciens niveaux sont remplacées par leurs gestes explicites.

Cinq schémas vectoriels montrent les positions, les appuis et le matériel. Ils figurent dans l’écran d’apprentissage et dans la fiche PDF A4 paysage. La tablette affiche trois puis deux cartes ; un grand écran affiche les cinq cartes. Les cibles tactiles restent grandes.

Le professeur valide les niveaux 3 et 5. Les résultats du nouveau module utilisent les clés `floating-v15-*` : les anciennes clés `floating-*` sont conservées dans les sauvegardes et transferts, sans valider automatiquement des exercices différents. Les résultats du test savoir-nager, les groupes, les autres modules et le code professeur restent conservés.

Vérifications : couleurs, cinq niveaux et illustrations chargées, validations professeur 3/5, conservation des anciens apprentissages, module immersion inchangé, sauvegarde/rechargement, quatre tailles d’écran, téléchargement PDF et illustrations hors connexion. PDF rendu et contrôlé sur une page paysage. Tests : `qa/flottaison-regression.cjs` et `qa/cycle-regression.cjs`.

La fiche de flottaison se régénère avec `python qa/generate-flottaison.py` (ReportLab, PyMuPDF, Node, DejaVu). `qa/generate-fiches.py` génère les deux autres modules.
