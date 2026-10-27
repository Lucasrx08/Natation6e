# Natation 6e — V29

27 octobre 2026

## Capsule corrigée

- Nouveau nageur en véritable 3D : maillage continu, peau et vêtements ombrés, bonnet rouge, lunettes bleues et tenue bleu/turquoise.
- Articulation par squelette : les bras gardent leurs longueurs et leurs liaisons épaule–coude–poignet. Les cycles complets de crawl et de dos crawlé sont distincts.
- Demi-tour en 3D, sans appui au fond : arrivée sur le ventre, changement de direction de 180° et départ sur le dos.
- Chaque flottaison reste un exercice de 15 secondes ; la démonstration ne dure que 5 secondes. Le décompte accéléré est signalé par « Démonstration ×3 » et « 15 s montrées en 5 s ».
- Après l’immersion retour, le nageur reste sur le ventre : crawl, plongeon canard pour l’anneau, remontée et retour au bord en crawl.
- Tapis et cerceau restent deux possibilités alternatives, à l’aller et au retour.
- Durée totale : 69 secondes, dix étapes. Formats Full HD et 4K, sous-titres français et repères sonores discrets.

Les critères et les durées réelles d’évaluation des élèves restent ceux du cycle : les cinq secondes concernent uniquement la capsule explicative.

## Production

`video-production/v29/rig-renderer.js` anime un maillage 3D à l’aide d’un squelette de 163 os. Les poses sont rendues par Three.js, puis composées par `video-production/render_parcours_v29.py` et encodées par FFmpeg. Les sources et licences des ressources sont détaillées dans `video-production/v29/SOURCES.md`.

Les animations ne nécessitent ni Runway, ni crédit vidéo externe, ni abonnement.

## Vérifications

Les contrôles du lecteur passent : dix accès directs, position conservée au changement de qualité, téléchargement 4K, quatre tailles d’écran, lecture hors connexion et retour automatique en Full HD si la 4K n’est pas disponible. Les deux fichiers contiennent 2 070 images à 30 images/s, les 12 chapitres attendus et une durée de 69 secondes. La vidéo 4K se décode sans erreur. Les contrôles de notes de la V27 passent.
