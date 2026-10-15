# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions selon [SemVer](https://semver.org/lang/fr/).

## Non publié

### Ajouté

- Le moteur (`packages/moteur`) : capacités, missions, parcours, vérificateur, progression, preuves, droits de l'IA. Ses tests vérifient aussi les vrais contenus.
- Le parcours débutant : 15 missions en 6 chapitres (`contenus/`), avec cours, questions, fichiers fictifs (scan, note vocale, page Tilleul à défauts volontaires, page piégée, petit projet pour Graphify) et le catalogue des capacités.
- Les missions peuvent prêter des capacités le temps de la mission (`prete`), et exiger un fournisseur d'IA précis (`ia.reponse` + `fournisseurs`).
- Le guide `docs/ecrire-une-mission.md`.
- La commande `bun run verifier`, qui affiche le parcours numéroté et bloque si une mission est mal placée.
- Le script `scripts/capture.ts`, qui pilote l'application lancée en mode développement (capture, clic, frappe, évaluation).
- L'extension « le-labo » (`packages/extension`) : l'onglet « Missions » (parcours numéroté, mission en cours, cours mis en forme, preuves, questions, indice).
- Le plugin serveur (`packages/plugin`) : restreint les droits de l'IA aux capacités débloquées, retire de sa vue les outils interdits, lui donne les consignes du prof, tient le journal et valide les missions toutes seules ; RPC « le-harnais » avec le panneau.
- Le patch 02 : au premier lancement, le projet par défaut est l'atelier `Documents/LeLabo`.
- `bun run dev` (`scripts/dev.ts`) : lance l'application isolée dans `~/.le-harnais-dev`, plugin installé.
- `docs/architecture.md`.
- Les extensions d'OpenCode (terminal, fichiers, revue, navigateur…) s'allument et s'éteignent selon les capacités (patch 03, `synchro.ts`, `main.ts`).
- Les commandes de l'élève sont notées par une intégration PowerShell ou bash chargée au démarrage du terminal (patch 04), puis importées dans le journal.
- `bun run dev` arrête l'ancien service de développement, retire `SHELL` (comme pour un élève) sauf avec `--garder-shell`.
- `scripts/capture.ts` : combinaisons de touches et attente de l'application (`--pret`).

### Modifié

- Le panneau fête une mission réussie d'après la dernière réussite enregistrée (et non plus un message à usage unique), puis passe à la suivante.
- Les consignes du prof : l'IA ne demande plus l'autorisation par écrit, le harnais affiche lui-même la demande de permission.
- Le cours « Ton IA agit, avec ton accord » : un refus arrête l'IA (« Interrompu »).
- La preuve `terminal.commande` vérifie la commande et sa réussite (et non plus sa sortie) : la lecture de l'écran du terminal est remplacée par l'intégration au shell, plus fiable.
- Le script `scripts/preparer.ts` et le premier patch d'OpenCode (`upstream/patches/01-enregistrer-extension-le-labo.patch`, 7 lignes). Sous Windows, il remplace aussi les liens symboliques du dépôt d'OpenCode par des copies.
- La documentation de départ : README, règles du dépôt, feuille de route, guide de développement, questions ouvertes, licences.
- OpenCode figé sur v2.0.29 (`upstream/opencode.lock.json`).
