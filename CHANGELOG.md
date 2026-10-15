# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions selon [SemVer](https://semver.org/lang/fr/).

## Non publié

### Ajouté

- Le moteur (`packages/moteur`) : capacités, missions, parcours, vérificateur, progression, preuves, droits de l'IA, lecture des commandes du terminal. 37 tests, dont la vérification des vrais contenus.
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
- Le script `scripts/preparer.ts` et le premier patch d'OpenCode (`upstream/patches/01-enregistrer-extension-le-labo.patch`, 7 lignes). Sous Windows, il remplace aussi les liens symboliques du dépôt d'OpenCode par des copies.
- La documentation de départ : README, règles du dépôt, feuille de route, guide de développement, questions ouvertes, licences.
- OpenCode figé sur v2.0.29 (`upstream/opencode.lock.json`).
