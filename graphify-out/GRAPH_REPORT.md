# Graph Report - le-harnais  (2026-10-16)

## Corpus Check
- 91 files · ~39,225 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .patch 7, (none) 2, .lock 1)

## Summary
- 541 nodes · 926 edges · 47 communities (30 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85daf0fd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- chargement.ts
- Développer
- moteur/src/index.ts
- dessiner-icone.py
- atelier.ts
- moteur/package.json
- index.js
- electron-builder.le-harnais.ts
- package.json
- compilerOptions
- panneau.tsx
- Règles du dépôt (pour les agents et les humains)
- Écrire, déplacer ou insérer une mission
- Brancher ton IA
- capture.ts
- monter-opencode.ts
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
- moteurs.ts
- plugin/tsconfig.json
- plugin/src/index.ts
- integration.sh script
- opencode.ts
- main.ts
- plugin/src/sens.ts
- ref_node_fs
- empaqueter.ts
- dev.ts
- preparer.ts

## God Nodes (most connected - your core abstractions)
1. `Atelier` - 26 edges
2. `ErreurContenu` - 18 edges
3. `chargerContenus()` - 14 edges
4. `chargerMission()` - 12 edges
5. `objet()` - 10 edges
6. `numeroter()` - 10 edges
7. `Mission` - 10 edges
8. `compilerOptions` - 10 edges
9. `chargerConnecteurs()` - 9 edges
10. `preuve()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Phase 0 · Faisabilité` --references--> `question()`  [INFERRED]
  docs/feuille-de-route.md → packages/moteur/src/chargement.ts
- `Ajouté` --references--> `ocr()`  [INFERRED]
  CHANGELOG.md → packages/extension/src/moteurs.ts
- `Les sens : voix, OCR, image` --references--> `ocr()`  [INFERRED]
  docs/architecture.md → packages/extension/src/moteurs.ts
- `Ajouté` --references--> `transcrire()`  [INFERRED]
  CHANGELOG.md → packages/extension/src/moteurs.ts
- `Les sens : voix, OCR, image` --references--> `transcrire()`  [INFERRED]
  docs/architecture.md → packages/extension/src/moteurs.ts

## Import Cycles
- None detected.

## Communities (47 total, 17 thin omitted)

### Community 0 - "chargement.ts"
Cohesion: 0.23
Nodes (26): Les preuves, ACTIONS, booleen(), capacite(), chargerCatalogue(), chargerConnecteurs(), chargerContenus(), chargerMission() (+18 more)

### Community 1 - "Développer"
Cohesion: 0.05
Nodes (37): Architecture, Données de développement, L'application publiée, L'extension (`packages/extension`), Le moteur (`packages/moteur`), Le plugin serveur (`packages/plugin`), Le terminal de l'élève, Les patchs d'OpenCode (+29 more)

### Community 2 - "moteur/src/index.ts"
Cohesion: 0.05
Nodes (55): afficher(), correspond(), decider(), droits, Regle, Journal, avertissement(), erreur() (+47 more)

### Community 4 - "atelier.ts"
Cohesion: 0.14
Nodes (6): Atelier, creerAtelier(), estUnAtelier(), consignesDuProf(), contenus, nouvelAtelier()

### Community 5 - "moteur/package.json"
Cohesion: 0.11
Nodes (18): dependencies, yaml, description, devDependencies, @types/bun, typescript, exports, @types/bun (+10 more)

### Community 6 - "index.js"
Cohesion: 0.22
Nodes (11): afficherTicket(), panier, arrondir(), formaterChf(), ajouter(), creerPanier(), sousTotal(), total() (+3 more)

### Community 8 - "package.json"
Cohesion: 0.13
Nodes (14): description, license, name, private, scripts, dev, empaqueter, graphe (+6 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 10 - "panneau.tsx"
Cohesion: 0.11
Nodes (23): Contrat, EtapeUI, EtatUI, echapper(), enLigne(), versHtml(), copier(), enregistrer() (+15 more)

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
Cohesion: 0.29
Nodes (5): args, cibles, MODIFICATEURS, TOUCHES, ws

### Community 15 - "monter-opencode.ts"
Cohesion: 0.18
Nodes (9): appliquer, commit, date, echecs, fichierVerrou, opencode, patchs, racine (+1 more)

### Community 16 - "Le défi final"
Cohesion: 0.40
Nodes (4): Changer de modèle, Ensuite, La consigne à donner à ton IA, Le défi final

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

### Community 35 - "moteurs.ts"
Cohesion: 0.10
Nodes (20): Ajouté, Journal des modifications, Modifié, Non publié, Vérifié dans l'application, Les sens : voix, OCR, image, depuisBase64(), detecterObjets() (+12 more)

### Community 36 - "plugin/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../moteur/tsconfig.json

### Community 37 - "plugin/src/index.ts"
Cohesion: 0.19
Nodes (6): EntreeCommencer, EntreePage, EntreeRepondre, EtatMission, objet, ReponseSens

### Community 40 - "opencode.ts"
Cohesion: 0.11
Nodes (11): actionDeLOutil(), ApresOutil, ContexteOpenCode, ContexteSession, Effet, Enregistrement, EvaluationPermission, EvenementOpenCode (+3 more)

### Community 41 - "main.ts"
Cohesion: 0.20
Nodes (4): Harnais, Gestionnaire, setup(), trace()

### Community 42 - "plugin/src/sens.ts"
Cohesion: 0.27
Nodes (5): DemandeSens, OutilSens, fichier, OUTILS_SENS, Sens

### Community 43 - "ref_node_fs"
Cohesion: 0.33
Nodes (4): Jeu, pagesCitees(), rapportsLighthouse(), yaml

### Community 44 - "empaqueter.ts"
Cohesion: 0.22
Nodes (8): bureau, cli, env, icones, opencode, racine, ressources, sortie

### Community 45 - "dev.ts"
Cohesion: 0.25
Nodes (6): app, bunExe, env, opencode, plugins, racine

### Community 46 - "preparer.ts"
Cohesion: 0.29
Nodes (5): cible, opencode, racine, seulementCopier, verrou

## Knowledge Gaps
- **7 isolated node(s):** `@types/bun`, `@types/bun`, `typescript`, `@le-harnais/moteur`, `@types/bun` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `question()` connect `chargement.ts` to `Développer`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `@types/bun`, `@types/bun`, `typescript` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Développer` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Why does `Phase 0 · Faisabilité` connect `Développer` to `chargement.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `moteur/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05495151337055539 - nodes in this community are weakly interconnected._
- **Should `atelier.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `moteur/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._