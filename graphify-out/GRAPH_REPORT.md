# Graph Report - le-harnais  (2026-10-15)

## Corpus Check
- 61 files · ~17,331 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .lock 1, .patch 1)

## Summary
- 301 nodes · 482 edges · 33 communities (19 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f98936f0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- chargement.ts
- Développer
- preuves.ts
- types.ts
- index.ts
- moteur/package.json
- index.js
- contenus.test.ts
- package.json
- compilerOptions
- renderer.tsx
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

## God Nodes (most connected - your core abstractions)
1. `ErreurContenu` - 18 edges
2. `chargerMission()` - 12 edges
3. `chargerContenus()` - 11 edges
4. `compilerOptions` - 10 edges
5. `preuve()` - 9 edges
6. `objet()` - 9 edges
7. `verifier()` - 9 edges
8. `chargerCatalogue()` - 8 edges
9. `chargerParcours()` - 8 edges
10. `question()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Les preuves` --references--> `question()`  [INFERRED]
  docs/ecrire-une-mission.md → packages/moteur/src/chargement.ts
- `Les preuves` --references--> `motif()`  [INFERRED]
  docs/ecrire-une-mission.md → packages/moteur/src/chargement.ts
- `etatsPour()` --calls--> `numeroter()`  [EXTRACTED]
  packages/moteur/test/progression.test.ts → packages/moteur/src/parcours.ts
- `afficherTicket()` --calls--> `formaterChf()`  [EXTRACTED]
  contenus/missions/plugins-graphify/fichiers/projet/src/affichage.js → contenus/missions/plugins-graphify/fichiers/projet/src/outils.js
- `afficherTicket()` --calls--> `sousTotal()`  [EXTRACTED]
  contenus/missions/plugins-graphify/fichiers/projet/src/affichage.js → contenus/missions/plugins-graphify/fichiers/projet/src/prix.js

## Import Cycles
- None detected.

## Communities (33 total, 14 thin omitted)

### Community 0 - "chargement.ts"
Cohesion: 0.25
Nodes (24): Les preuves, ACTIONS, booleen(), capacite(), chargerCatalogue(), chargerContenus(), chargerMission(), chargerParcours() (+16 more)

### Community 1 - "Développer"
Cohesion: 0.08
Nodes (21): Capturer l'application, Deux pièges sous Windows, Développer, Lancer l'application en mode développement, Lancer les tests du moteur, Prérequis, Feuille de route, Phase 0 · Faisabilité (+13 more)

### Community 2 - "preuves.ts"
Cohesion: 0.14
Nodes (13): argumentsCorrespondent(), Contexte, Disque, evaluer(), evaluerMission(), liste(), manquants(), missionValidee() (+5 more)

### Community 3 - "types.ts"
Cohesion: 0.16
Nodes (17): afficher(), racine, avertissement(), erreur(), EtapeNumerotee, expliquerManque(), numeroter(), verifier() (+9 more)

### Community 4 - "index.ts"
Cohesion: 0.12
Nodes (24): correspond(), decider(), droits, Regle, Journal, acquises(), capacitesActives(), commencer() (+16 more)

### Community 5 - "moteur/package.json"
Cohesion: 0.10
Nodes (19): dependencies, yaml, description, devDependencies, @types/bun, typescript, exports, main (+11 more)

### Community 6 - "index.js"
Cohesion: 0.22
Nodes (11): afficherTicket(), panier, arrondir(), formaterChf(), ajouter(), creerPanier(), sousTotal(), total() (+3 more)

### Community 7 - "contenus.test.ts"
Cohesion: 0.11
Nodes (10): contenus, racine, fabriquer(), Jeu, missions, cible, opencode, racine (+2 more)

### Community 8 - "package.json"
Cohesion: 0.15
Nodes (12): description, license, name, private, scripts, graphe, preparer, test (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

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

## Knowledge Gaps
- **2 isolated node(s):** `@types/bun`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 148 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `yaml` connect `moteur/package.json` to `chargement.ts`, `contenus.test.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `@types/bun`, `typescript` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Développer` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `Les preuves` connect `chargement.ts` to `Écrire, déplacer ou insérer une mission`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `preuves.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13852813852813853 - nodes in this community are weakly interconnected._
- **Why does `Écrire, déplacer ou insérer une mission` connect `Écrire, déplacer ou insérer une mission` to `chargement.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12310606060606061 - nodes in this community are weakly interconnected._