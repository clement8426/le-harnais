# Les fichiers

Ton dossier `LeLabo` est l'atelier de ton harnais. Tout ce que ton IA fera, elle le fera ici, et nulle part ailleurs sur ton ordinateur.

## Lire n'est pas modifier

À la fin de cette mission, ton IA pourra **lire** et **chercher** dans les fichiers de ton dossier. Elle ne pourra encore rien modifier, ni rien lancer. C'est le principe des permissions : chaque droit est donné séparément, et le plus petit possible.

Deux règles ne bougeront jamais, même à la fin du parcours :

- ton IA ne sort jamais du dossier `LeLabo` ;
- elle ne lit jamais les fichiers `.env`, où l'on range d'habitude les mots de passe et les clés.

## À faire

1. Dans l'arborescence des fichiers, crée `notes.md` à la racine de `LeLabo`.
2. Écris une phrase dedans, par exemple ce que tu attends de ce parcours, et enregistre.
3. Demande à ton IA : « Lis notes.md et résume-le en une ligne. »
4. Regarde le fil : tu vois l'appel de l'outil `read`. C'est ton IA qui utilise un outil.

> **À retenir** : un outil appelé par l'IA apparaît toujours dans le fil. Tu peux toujours savoir ce qu'elle a fait.
