# Natation 6e — Mise à jour du cycle savoir-nager

La présentation et les écrans de l’application d’origine sont conservés.

- Export iDoceo : une colonne « Nom Prénom », nom en majuscules et prénom capitalisé, y compris les prénoms composés.
- Parcours : retrait de l’approche et du retour ventral, ajout du demi-tour ventral → dorsal. Les identifiants des anciennes évaluations sont conservés. Le demi-tour ajouté aux classes existantes reste à évaluer.
- Groupes : cliquer sur un nom pour choisir G1, G2, G3 ou revenir au calcul automatique. Déplacement également possible à la souris ou en faisant glisser la poignée sur tablette. Les choix manuels restent enregistrés.
- « Exporter G… » : fichier XLSX contenant uniquement ce groupe.
- « Transférer » : fichier JSON avec les élèves du groupe, leurs évaluations et leur progression d’apprentissage. Sur la tablette du collègue, ouvrir Classes → Importer classe / groupe et choisir ce fichier. Il est importé comme une classe distincte.
- Apprentissage : flottaison, immersion et entrée dans l’eau, avec quatre ateliers progressifs par module. L’élève choisit son profil, lit les consignes et demande la validation. Le professeur valide ou demande de retravailler. Une étape suivante se débloque après validation.
- Le professeur configure un code local de 4 à 8 chiffres au premier accès au mode professeur. Ce code réserve les boutons de validation dans l’interface de cette tablette ; ce n’est pas un compte ni une authentification distante.
- Les données restent propres à chaque navigateur/appareil. Le transfert de fichier ne synchronise pas automatiquement les tablettes. Les ateliers ne changent pas les notes diagnostiques.

## Vérifications

Vérifications dans Chromium : migration d’une classe existante, copie de sauvegarde locale, conservation des évaluations, noms longs, clics et déplacements à la souris/au toucher, choix de groupes après rechargement, export XLSX et contenu exact, transfert JSON sur un autre navigateur, demandes/validations professeur, refus d’un code incorrect, rechargement hors connexion, affichages 1440×900, 1024×768, 768×1024 et 390×844. Aucun appareil iPad physique n’a été utilisé.

Le test de régression est dans `qa/cycle-regression.cjs` et utilise Playwright ainsi que Python pour le serveur local. Il se lance avec `node qa/cycle-regression.cjs`. Une installation de Chromium pour Playwright est nécessaire ; `PLAYWRIGHT_EXECUTABLE_PATH` peut désigner un autre binaire compatible.

La version antérieure du dépôt est conservée sur la branche `backup-before-cycle-v12-20261001`. Les anciennes données locales sont copiées avant la première migration sous la clé `natation-6e:backup-before-v12`.
