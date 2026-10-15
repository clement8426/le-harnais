# Règles du dépôt (pour les agents et les humains)

## Se repérer

- Avant toute question d'architecture, lire `graphify-out/GRAPH_REPORT.md` (le graphe des liens entre fichiers).
- Après avoir modifié du code, régénérer le graphe : `bun run graphe` (analyse locale, sans IA).
- L'état d'avancement est dans `docs/feuille-de-route.md` : c'est la source de vérité sur ce qui est fait ou non.

## Écrire

- Tout est en français : code (noms), commentaires, documentation, messages de commit.
- Les commits suivent `type(portée): résumé` (`feat`, `fix`, `docs`, `test`, `chore`, `refactor`).
- Chaque changement visible met à jour `CHANGELOG.md`, section « Non publié ».
- Aucune documentation obsolète : un changement de comportement met à jour la doc concernée dans le même commit. Une doc qui décrit ce qui n'existe pas encore le dit explicitement.
- Les questions pour Clément vont dans `docs/questions.md`, jamais dans le code.

## Architecture (résumé)

- `packages/moteur` : capacités, missions, parcours, preuves, droits. Ne dépend jamais d'OpenCode.
- `packages/extension` et `packages/plugin` : la surcouche dans OpenCode. Seuls `src/adaptateur*` appellent les API d'OpenCode.
- `contenus/` : les missions et les parcours. Jamais de numéro dans une mission ; l'ordre vit dans `contenus/parcours/*.yaml`.
- `upstream/` : la version figée d'OpenCode et nos rares modifications (`patches/`). `.upstream/` (ignoré) est la copie de travail préparée.

## Vérifier

- `bun run test` : tous les tests.
- `bun run verifier` : le vérificateur de parcours (bloque si une mission est mal placée).
