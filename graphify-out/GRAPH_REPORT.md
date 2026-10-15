# Graph Report - le-harnais  (2026-10-15)

## Corpus Check
- 75 files · ~23,174 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .patch 2, .lock 1)

## Summary
- 423 nodes · 712 edges · 37 communities (24 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28309f36`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- chargement.ts
- Développer
- moteur/src/index.ts
- types.ts
- atelier.ts
- moteur/package.json
- index.js
- contenus.test.ts
- package.json
- compilerOptions
- plugin/src/index.ts
- Règles du dépôt (pour les agents et les humains)
- Écrire, déplacer ou insérer une mission
- Brancher ton IA
- capture.ts
- Journal des modifications
- Le défi final
- Les fichiers
- Le navigateur
- Le terminal
- L'audit Lighthouse
- Dicter
- Écouter
- Qu'est-ce qu'un harnais ?
- Ton IA agit, avec ton accord
- Lire un document
- Les connecteurs MCP
- Les plugins
- Les skills
- Voir une image
- projet/README.md
- SKILL.md
- questions.md
- plugin/package.json
- extension/package.json
- Architecture
- plugin/tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `Atelier` - 23 edges
2. `ErreurContenu` - 18 edges
3. `chargerContenus()` - 13 edges
4. `chargerMission()` - 12 edges
5. `numeroter()` - 10 edges
6. `Mission` - 10 edges
7. `compilerOptions` - 10 edges
8. `preuve()` - 9 edges
9. `question()` - 9 edges
10. `objet()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Phase 0 · Faisabilité` --references--> `question()`  [INFERRED]
  docs/feuille-de-route.md → packages/moteur/src/chargement.ts
- `Les preuves` --references--> `question()`  [INFERRED]
  docs/ecrire-une-mission.md → packages/moteur/src/chargement.ts
- `Les preuves` --references--> `motif()`  [INFERRED]
  docs/ecrire-une-mission.md → packages/moteur/src/chargement.ts
- `etatsPour()` --calls--> `numeroter()`  [EXTRACTED]
  packages/moteur/test/progression.test.ts → packages/moteur/src/parcours.ts
- `nouvelAtelier()` --calls--> `Atelier`  [EXTRACTED]
  packages/plugin/test/atelier.test.ts → packages/plugin/src/atelier.ts

## Import Cycles
- None detected.

## Communities (37 total, 13 thin omitted)

### Community 0 - "chargement.ts"
Cohesion: 0.22
Nodes (25): Les preuves, ACTIONS, booleen(), capacite(), chargerCatalogue(), chargerContenus(), chargerMission(), chargerParcours() (+17 more)

### Community 1 - "Développer"
Cohesion: 0.08
Nodes (21): Capturer l'application, Deux pièges sous Windows, Développer, Lancer l'application en mode développement, Lancer les tests du moteur, Prérequis, Feuille de route, Phase 0 · Faisabilité (+13 more)

### Community 2 - "moteur/src/index.ts"
Cohesion: 0.08
Nodes (30): correspond(), decider(), droits, Regle, argumentsCorrespondent(), Contexte, Disque, evaluer() (+22 more)

### Community 3 - "types.ts"
Cohesion: 0.29
Nodes (10): afficher(), racine, avertissement(), erreur(), EtapeNumerotee, expliquerManque(), numeroter(), verifier() (+2 more)

### Community 4 - "atelier.ts"
Cohesion: 0.11
Nodes (16): Journal, acquises(), capacitesActives(), commencer(), Etat, etats(), prochaine(), progressionVide() (+8 more)

### Community 5 - "moteur/package.json"
Cohesion: 0.11
Nodes (18): dependencies, yaml, description, devDependencies, @types/bun, typescript, exports, @types/bun (+10 more)

### Community 6 - "index.js"
Cohesion: 0.22
Nodes (11): afficherTicket(), panier, arrondir(), formaterChf(), ajouter(), creerPanier(), sousTotal(), total() (+3 more)

### Community 7 - "contenus.test.ts"
Cohesion: 0.07
Nodes (21): contenus, racine, fabriquer(), Jeu, missions, creerAtelier(), estUnAtelier(), contenus (+13 more)

### Community 8 - "package.json"
Cohesion: 0.14
Nodes (13): description, license, name, private, scripts, dev, graphe, preparer (+5 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 10 - "plugin/src/index.ts"
Cohesion: 0.06
Nodes (28): Contrat, EntreeCommencer, EntreePage, EntreeRepondre, EntreeTerminal, EtapeUI, EtatMission, EtatUI (+20 more)

### Community 11 - "Règles du dépôt (pour les agents et les humains)"
Cohesion: 0.25
Nodes (6): Règles du dépôt, Architecture (résumé), Règles du dépôt (pour les agents et les humains), Se repérer, Vérifier, Écrire

### Community 12 - "Écrire, déplacer ou insérer une mission"
Cohesion: 0.33
Nodes (5): Déplacer une mission ou un chapitre, Insérer une mission, Le cours, Le fichier `mission.yaml`, Écrire, déplacer ou insérer une mission

### Community 13 - "Brancher ton IA"
Cohesion: 0.40
Nodes (4): Brancher ton IA, Le réflexe à prendre, Trois façons de le brancher, À faire

### Community 14 - "capture.ts"
Cohesion: 0.33
Nodes (4): args, cibles, TOUCHES, ws

### Community 15 - "Journal des modifications"
Cohesion: 0.50
Nodes (3): Ajouté, Journal des modifications, Non publié

### Community 16 - "Le défi final"
Cohesion: 0.50
Nodes (3): Ensuite, La consigne à donner à ton IA, Le défi final

### Community 17 - "Les fichiers"
Cohesion: 0.50
Nodes (3): Les fichiers, Lire n'est pas modifier, À faire

### Community 18 - "Le navigateur"
Cohesion: 0.50
Nodes (3): Le navigateur, Un piège à connaître : l'injection de consignes, À faire

### Community 19 - "Le terminal"
Cohesion: 0.50
Nodes (3): Le terminal, Les trois commandes de la mission, À faire

### Community 33 - "plugin/package.json"
Cohesion: 0.11
Nodes (18): dependencies, @le-harnais/moteur, description, devDependencies, @types/bun, typescript, @types/bun, typescript (+10 more)

### Community 34 - "extension/package.json"
Cohesion: 0.18
Nodes (10): description, devDependencies, @types/bun, @types/bun, name, private, scripts, test (+2 more)

### Community 35 - "Architecture"
Cohesion: 0.29
Nodes (6): Architecture, Données de développement, L'extension (`packages/extension`), Le moteur (`packages/moteur`), Le plugin serveur (`packages/plugin`), Les patchs d'OpenCode

### Community 36 - "plugin/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../moteur/tsconfig.json

## Knowledge Gaps
- **7 isolated node(s):** `@types/bun`, `@types/bun`, `typescript`, `@le-harnais/moteur`, `@types/bun` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 205 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `question()` connect `chargement.ts` to `Développer`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `@types/bun`, `@types/bun`, `typescript` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Développer` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `Phase 0 · Faisabilité` connect `Développer` to `chargement.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `moteur/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._
- **Should `atelier.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1106612685560054 - nodes in this community are weakly interconnected._
- **Should `moteur/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._