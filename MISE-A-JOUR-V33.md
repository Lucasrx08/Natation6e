# V33 — Chargement stable de l’application

Le document initial et le premier affichage React présentent désormais le même écran de chargement. L’interface complète n’est affichée qu’après la lecture des données locales, dans le même rendu que la classe enregistrée. Les anciens écrans et la classe de démonstration ne sont plus affichés entre ces étapes.

Si la lecture échoue, un message indique que les données sont conservées et propose de recharger. L’interface de démonstration ne remplace pas les données illisibles. Le cache précharge la nouvelle feuille de style et les nouveaux modules de démarrage.

Vérifications : observation image par image du démarrage avec module volontairement ralenti, sur ordinateur et tablette ; succession unique chargement → classe enregistrée, aucun écran ancien ou de démonstration ; erreur de lecture sans écrasement des données ; récupération depuis un ancien cache ; lecteur HD/4K et hors connexion ; calcul des notes inchangé.
