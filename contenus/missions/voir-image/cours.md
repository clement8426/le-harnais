# Voir une image

Un modèle de détection d'objets repère ce qu'il reconnaît dans une image : un ordinateur, une tasse, une plante. Pour chaque objet, il donne une **confiance**, de 0 à 1. Il tourne sur ton ordinateur.

Ton IA ne reçoit que la liste des objets et leur confiance, jamais l'image. C'est la même idée que pour la voix et les scans : l'outil local fait le travail sensible, le cerveau reçoit le strict nécessaire.

## À faire

1. Prends en photo ton bureau (ou choisis une photo à toi) et copie-la dans `missions/voir-image/fichiers`.
2. Demande : « Détecte les objets de cette photo avec un seuil de 0,9. »
3. Redemande avec un seuil de 0,3. Compare les deux listes.
4. Réponds à la question du panneau.

> **À retenir** : plus on baisse le seuil, plus le modèle « voit » de choses, y compris des choses qui n'y sont pas.
