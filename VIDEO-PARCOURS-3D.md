# Vidéo du parcours aquatique — brief de production 3D

**État : séquences 3D à générer.** Le montage du nouveau film n’est pas encore produit. Le clip joint est une référence de rendu et de personnage ; son entrée bras croisés doit être corrigée dans la nouvelle animation.

## Rendu et continuité

Un même nageur en 3D, bonnet rouge, lunettes bleues et short bleu à panneaux turquoise. Piscine intérieure réaliste, eau lisible et mouvements anatomiquement cohérents. Format 16:9 ; rendu natif Full HD minimum. Une simple augmentation du nombre de pixels du clip 720p ne constituerait pas une nouvelle animation 4K.

Les titres, sous-titres français et chronomètres seront ajoutés au montage. Les deux flottaisons durent réellement 15 secondes, avec un mouvement naturel continu.

## Déroulé validé

| Temps | Séquence | Point à montrer |
| --- | --- | --- |
| 0–5 s | Présentation | Vue générale du bassin et du trajet |
| 5–12 s | 1. Chute arrière | Je pousse avec mes jambes et je saute en arrière, bras le long du corps, pieds en premier. |
| 12–24 s | 2. Immersion aller | Je nage sur le ventre, puis je passe sous le tapis OU dans le cerceau lesté. |
| 24–39 s | 3. Flottaison debout | Je reste debout dans l’eau pendant 15 secondes, sans toucher le fond. |
| 39–44 s | 4. Reprise de la nage ventrale | Je repars sur le ventre jusqu’au demi-tour. |
| 44–50 s | 5. Demi-tour de 180° | Je fais demi-tour sans toucher le fond, puis je m’oriente sur le dos. |
| 50–57 s | 6. Nage dorsale | Je nage sur le dos jusqu’à la zone de flottaison. |
| 57–72 s | 7. Étoile de mer dorsale | Je fais l’étoile sur le dos pendant 15 secondes, avec une respiration calme. |
| 72–85 s | 8. Immersion retour | Je reprends la nage dorsale, puis je passe sous le tapis OU dans le cerceau lesté. |
| 85–96 s | 9. Récupération de l’anneau | Je repars sur le dos, puis je m’immerge pour récupérer l’anneau. |
| 96–103 s | 10. Rejoindre le bord | Je rejoins le bord et je m’y accroche. |
| 103–108 s | Conclusion | Nageur accroché au bord, parcours terminé |

Les passages sous le tapis et dans le cerceau sont deux alternatives. Chaque élève franchit un seul obstacle à l’aller et un seul au retour. Le montage doit l’indiquer explicitement, sans suggérer deux obstacles successifs.

## Prompts et validation

Les prompts de chaque plan, ses références et ses durées sont prêts dans [parcours-3d-v27.json](video-production/parcours-3d-v27.json).

Pour le saut arrière : impulsion des jambes, bras le long du corps, pieds en premier, posture verticale. Pour le demi-tour : 180° dans l’eau, sans reprise d’appui. Pour l’anneau : récupération et remontée sans appui. Chaque séquence sera vérifiée avant son intégration dans le lecteur de l’application.

La génération nécessite un service vidéo connecté, tel que Runway. Aucune nouvelle séquence ni consommation de crédits vidéo n’a été lancée pendant cette préparation.
