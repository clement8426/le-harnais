# Architecture

Le Harnais est OpenCode Desktop V2, figé sur une version, avec trois morceaux à nous. On ne modifie OpenCode que par de courts patchs (`upstream/patches/`), pour pouvoir suivre ses mises à jour.

```text
contenus/  (missions, parcours, capacités)
   │  lus par
   ▼
packages/plugin   ── RPC « le-harnais » ──▶  packages/extension
(serveur OpenCode)                          (fenêtre : onglet Missions)
   │  utilise                                   │  utilise
   ▼                                            ▼
packages/moteur  (pur : aucune dépendance à OpenCode)
```

## Le moteur (`packages/moteur`)

Du TypeScript sans effet de bord, sauf la lecture des contenus et du journal : capacités, missions, parcours, numérotation, vérificateur, progression, preuves, droits. Testé seul (`bun test`). Il ne connaît ni OpenCode ni Electron.

## Le plugin serveur (`packages/plugin`)

Chargé par le serveur d'OpenCode (API de plugins « Promise » de la V2) depuis le dossier `plugins/` de la configuration. Il ne fait quelque chose que dans un **atelier** : un dossier qui contient `.labo/harnais.json`.

| Rôle | Mécanisme d'OpenCode utilisé |
| --- | --- |
| Restreindre les droits de l'IA aux capacités débloquées | `permission.hook("evaluate")` : le plus strict entre la règle d'OpenCode et la nôtre |
| Retirer de la vue du modèle les outils entièrement interdits, ajouter les consignes du prof | `session.hook("context")` |
| Noter les appels d'outils | `tool.hook("execute.after")` |
| Noter les permissions et les réponses de l'IA | `event.subscribe()` : `permission.asked`, `permission.replied`, `session.step.ended` |
| Parler au panneau | `rpc.register` (contrat dans `packages/extension/src/contrat.ts`) |

Seul `src/opencode.ts` décrit l'API d'OpenCode : si elle change, c'est là qu'on adapte.

L'atelier (`src/atelier.ts`) range tout dans `LeLabo/.labo/` : `harnais.json` (le parcours suivi), `progression.json`, `en-cours.json`, `journal.jsonl`. Après chaque événement, il réévalue les preuves de la mission en cours et la valide si tout est vert.

## L'extension (`packages/extension`)

Une extension d'interface d'OpenCode, copiée dans `packages/gui-extensions/src/le-labo` par `scripts/preparer.ts`, et enregistrée parmi les extensions intégrées par le patch 01 (les extensions installées à part, au format `.ocdx`, sont encore refusées par les versions publiées d'OpenCode). Elle ajoute l'onglet « Missions » dans la zone latérale de chaque session et appelle le plugin par RPC.

## Les patchs d'OpenCode

| Patch | Ce qu'il change | Pourquoi |
| --- | --- | --- |
| `01-enregistrer-extension-le-labo` | 2 listes d'extensions intégrées (7 lignes) | Charger notre extension |
| `02-atelier-lelabo-par-defaut` | Le projet créé au premier lancement | C'est l'atelier `Documents/LeLabo`, marqué `.labo/harnais.json` |

## Données de développement

`scripts/dev.ts` lance l'application avec `OPENCODE_DESKTOP_TEST_ROOT=~/.le-harnais-dev` : configuration, données, état et atelier y sont isolés de tout OpenCode installé. Les données sont hors du dépôt, sinon OpenCode remonterait l'arborescence et lirait le `CLAUDE.md` du dépôt comme consignes de l'élève.
