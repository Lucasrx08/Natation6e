# Mise à jour v18 – 6 octobre 2026

L’apprentissage devient un parcours de missions : une seule mission active, un chemin de badges et un passeport aquatique affichant les trois pouvoirs Équilibre, Exploration et Confiance.

- Les badges acquis peuvent être consultés. Les missions suivantes restent verrouillées jusqu’à l’acquisition de la précédente.
- L’élève lance « Je tente la mission », puis coche trois clés de réussite après son essai avant de déclarer sa réussite ou demander une validation. Il s’agit d’une autoévaluation, pas d’une preuve automatique de réalisation.
- Les compétences sont explicitement nommées. Une récompense annonce le badge gagné ; l’ensemble du module ouvre le pouvoir correspondant.
- Les checkpoints professeur restent protégés par le code local : flottaison aux paliers 3 et 5, immersion et entrée aux paliers 2 et 4. Les validations et clés de stockage précédentes sont conservées.
- Les images de flottaison restent identiques. Cinq poses 3D complètent les premières immersions et les entrées (échelle, saut, bascule assise), et apparaissent dans l’app comme dans les fiches.
- Trois fiches A4 paysage reprennent les mêmes noms de missions, couleurs, images et trois clés de réussite. Elles contiennent une consigne courte et un repère de validation/date. Le téléchargement continue à préserver la page de l’app.
- Les fichiers v17 et l’historique Git restent disponibles. Les critères de groupe, niveaux des nages, évaluations et exports v17 sont inchangés.

Validation : parcours complet avec autoévaluation, demandes enseignant, validations 3/5, badge final, consultation des badges, reprise d’essai, changement d’élève, conservation des données précédentes et de la nage jaune, rechargement et fonctionnement hors ligne, téléchargement des trois PDF ; quatre tailles d’écran simulées (1440×900, 1024×768, 768×1024, 390×844). Les trois PDF ont été rendus et vérifiés visuellement. Pas de test matériel sur iPad.

Reproduction : `qa/adventure-v18-regression.cjs` avec Playwright ; `qa/generate-missions-v18.py` avec Node, ReportLab, Pillow, DejaVu Sans et Poppler pour le contrôle des fiches.
