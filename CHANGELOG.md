# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions selon [SemVer](https://semver.org/lang/fr/).

## Non publié

### Ajouté

- Le moteur (`packages/moteur`) : capacités, missions, parcours, vérificateur, progression, preuves, droits de l'IA. Ses tests vérifient aussi les vrais contenus.
- Le parcours débutant : 15 missions en 6 chapitres (`contenus/`), avec cours, questions, fichiers fictifs (scan, note vocale, page Tilleul à défauts volontaires, page piégée, petit projet pour Graphify) et le catalogue des capacités.
- Les missions peuvent prêter des capacités le temps de la mission (`prete`), exiger un fournisseur d'IA précis (`ia.reponse` + `fournisseurs`) et proposer une page à ouvrir (`page`).
- Le guide `docs/ecrire-une-mission.md` et la commande `bun run verifier`, qui affiche le parcours numéroté et bloque si une mission est mal placée.
- L'extension « le-labo » (`packages/extension`) : l'onglet « Missions » (parcours numéroté, mission en cours, cours mis en forme, preuves, questions, indice, bouton « Ouvrir la page »).
- Le plugin serveur (`packages/plugin`) : restreint les droits de l'IA aux capacités débloquées, retire de sa vue les outils interdits, lui donne les consignes du prof, tient le journal et valide les missions toutes seules ; RPC « le-harnais » avec le panneau.
- Les extensions d'OpenCode (terminal, fichiers, revue, navigateur…) s'allument et s'éteignent selon les capacités (patch 03, `synchro.ts`, `main.ts`).
- Les commandes de l'élève sont notées par une intégration PowerShell ou bash chargée au démarrage du terminal (patch 04), puis importées dans le journal.
- Le chapitre « Le web » : pages consultées et audits Lighthouse relevés par le plugin (rapports lus sur le disque), consignes du prof sur le mode code du navigateur.
- Les connecteurs MCP : déclarés dans `contenus/mcp.yaml` (chrome-devtools-mcp 1.10.1, version figée), branchés par le plugin quand une capacité les active (`ctx.mcp.transform`), vérifiés par `bun run verifier`.
- Le dossier `.labo` est caché des recherches de l'IA (`.ignore`) et sa lecture lui est interdite.
- Le patch 02 : au premier lancement, le projet par défaut est l'atelier `Documents/LeLabo`.
- `scripts/preparer.ts` : récupère OpenCode à la version figée, applique nos patchs, copie l'extension. Sous Windows, il remplace les liens symboliques du dépôt d'OpenCode par des copies.
- `bun run dev` (`scripts/dev.ts`) : lance l'application isolée dans `~/.le-harnais-dev`, plugin installé, ancien service arrêté, `SHELL` retiré comme pour un élève (sauf `--garder-shell`).
- `scripts/capture.ts` : pilote l'application lancée en mode développement (capture, clic, frappe, combinaisons de touches, évaluation, attente).
- La documentation : README, règles du dépôt, architecture, feuille de route, guide de développement, questions ouvertes, licences.
- OpenCode figé sur v2.0.29 (`upstream/opencode.lock.json`).

### Modifié

- La preuve `terminal.commande` vérifie la commande et sa réussite (et non plus sa sortie) : la lecture de l'écran du terminal est remplacée par l'intégration au shell, plus fiable.
- L'outil `execute` (mode code d'OpenCode) est autorisé dès le départ : sans lui, le navigateur restait inaccessible à l'IA ; ses outils internes gardent leur propre permission.
- Le panneau fête une mission réussie d'après la dernière réussite enregistrée (et non plus un message à usage unique), puis passe à la suivante.
- Les consignes du prof : l'IA ne demande plus l'autorisation par écrit (le harnais affiche la demande), l'indice ne sert que si l'élève bloque, et l'IA n'anticipe pas les gestes de la mission.
- Le cours « Ton IA agit, avec ton accord » : un refus arrête l'IA (« Interrompu »).
- Le cours « Les skills » demande d'ouvrir une nouvelle conversation : sinon l'IA a déjà la recette en tête et ne la charge pas.

### Vérifié dans l'application

Missions jouées de bout en bout dans OpenCode Desktop, sous Windows, avec le modèle gratuit par défaut : brancher-ia, harnais-c-est-quoi, terminal (PowerShell), fichiers, ia-et-terminal, navigateur, audit-lighthouse, skills, mcp-lighthouse, plugins-graphify.
