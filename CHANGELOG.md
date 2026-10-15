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
- L'extension « le-labo » (`packages/extension`) : un onglet « Missions » dans la zone latérale des sessions.
- Le script `scripts/preparer.ts` et le premier patch d'OpenCode (`upstream/patches/01-enregistrer-extension-le-labo.patch`, 7 lignes).
- La documentation de départ : README, règles du dépôt, feuille de route, guide de développement, questions ouvertes, licences.
- OpenCode figé sur v2.0.29 (`upstream/opencode.lock.json`).
