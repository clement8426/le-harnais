# Le Harnais

Un harnais agent de bureau pour apprendre l'IA en débloquant ses outils un par un : le terminal, les fichiers, le navigateur, la voix, la lecture de documents, les skills, les connecteurs MCP, les plugins.

> **En construction.** Le moteur est écrit et testé ; l'intégration dans l'application avance. L'état exact est dans la [feuille de route](docs/feuille-de-route.md).

## Le principe

Tout est déjà installé, mais verrouillé. Pour débloquer un outil, l'élève s'en sert pour de vrai : il lance une commande dans le terminal, ouvre une page dans le navigateur, fait auditer un site. Le harnais vérifie l'action, puis l'outil reste ouvert pour toujours. Ensuite, son IA reçoit le droit correspondant : lire, puis proposer, puis agir avec son accord.

L'IA est branchée dès la première minute et sert de prof. Elle ne modifie jamais le logiciel : elle travaille dans le dossier de l'élève, avec les droits qu'il a débloqués.

## Construit sur OpenCode

L'application est [OpenCode Desktop](https://github.com/anomalyco/opencode) (licence MIT), figé sur une version, avec notre surcouche. On garde son cœur intact pour suivre ses mises à jour. La procédure : [docs/mettre-a-jour-opencode.md](docs/mettre-a-jour-opencode.md).

| Dossier | Contenu |
| --- | --- |
| `packages/moteur` | Le cœur modulaire : capacités, missions, parcours, preuves, droits. Sans dépendance à OpenCode. |
| `packages/plugin` | Le plugin du serveur d'OpenCode : droits de l'IA, journal, outils des sens, consignes du prof. |
| `packages/extension` | L'extension de la fenêtre : l'onglet « Missions », la dictée, les moteurs des sens. |
| `contenus/` | Les missions et les parcours, en YAML et Markdown. |
| `upstream/` | La version figée d'OpenCode, nos rares modifications (`patches/`) et la configuration d'empaquetage. |
| `marque/` | L'icône et son script de dessin. |
| `scripts/` | Préparer OpenCode, lancer en développement, empaqueter, capturer l'application. |
| `docs/` | Feuille de route, développement, questions ouvertes. |

## Modulaire par construction

Une mission n'a jamais de numéro : elle a un nom (`terminal`, `dicter`…). L'ordre vit dans un fichier de parcours à part. Déplacer ou insérer une mission revient à déplacer ou ajouter une ligne ; les numéros se recalculent, et la progression des élèves, rangée par nom, ne se perd pas. Le vérificateur refuse un ordre impossible et dit pourquoi :

```text
✗ « lire-scan » a besoin de « fichiers.ia.lire », débloquée par « fichiers », qui vient après. Déplacez l'une des deux.
```

## Démarrer

```bash
bun install
bun run test
bun run verifier
```

Pour l'application elle-même, voir [docs/developper.md](docs/developper.md).

## Licences

Code sous MIT, contenus sous CC BY-NC 4.0, OpenCode sous sa propre licence MIT. Détails dans [LICENSE.md](LICENSE.md).
