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
- Les sens, sur l'ordinateur de l'élève : outils `transcrire` (Whisper), `lire_a_voix_haute` (voix du système), `ocr` (Tesseract et pdf.js) et `detecter_objets` (DETR). Le plugin les fournit à l'IA quand leur capacité est active, la fenêtre fait le calcul (patch 05 pour les dépendances), le panneau affiche ce que fait le moteur.
- La dictée de l'élève : bouton « Dicter un message » dans le panneau, micro autorisé en audio seul (patch 06), transcription par Whisper sur l'ordinateur, texte affiché et copié pour être collé dans la zone de saisie.
- Un silence n'est plus transcrit : Whisper y inventait des phrases. La dictée répond « Je n'ai rien entendu », l'outil `transcrire` « [aucune parole entendue] ».
- La documentation « de A à Z » : un README complet (le but, démarrer en élève, en formateur ou en développeur, le parcours, les limites), `docs/demarrer-eleve.md` (pas à pas, avec captures), `docs/formateur.md` (préparer la classe, la confidentialité, quand Windows bloque), et une galerie de captures (`docs/images/`, une par mission).
- `bun scripts/empaqueter.ts` produit aussi l'archive `le-harnais-<version>-win-x64.zip`, avec un lanceur `Lancer-Le-Harnais.bat` (`upstream/Lancer-Le-Harnais.bat`) : l'élève décompresse et double-clique.
- Le panneau des missions s'adapte à la largeur : à partir de 1000 px (grand écran), la liste des missions et la mission sont deux volets séparés (cartes arrondies à bordure, comme la conversation et le panneau d'OpenCode), chacun avec son défilement discret, visible seulement au survol ; en dessous, la liste devient un menu repliable en haut. Le panneau demande aussi la largeur minimale étendue d'OpenCode (`wide`).
- L'exécutable de l'application reste celui d'Electron, octet pour octet (`signAndEditExecutable: false`, `disableAsarIntegrity: true`) : Windows 11 refusait de façon imprévisible les exécutables modifiés à chaque construction.
- L'accueil de l'élève : une bande « Bienvenue » en bas de l'écran de départ (comment brancher l'IA, puis le panneau), le panneau des missions qui s'ouvre tout seul au premier message de chaque session, et une carte d'accueil en tête du panneau tant qu'aucune mission n'est réussie.
- L'installeur Windows (`bun scripts/empaqueter.ts`) : serveur construit depuis notre copie patchée, plugin, contenus et intégration du shell embarqués, nom « Le Harnais », identifiant `app.leharnais.desktop`, icône (sangle aux six couleurs des chapitres, `marque/`), sans mise à jour automatique ni Sentry.
- Le patch 07 : en production, Le Harnais range toutes ses données à part (y compris l'état de son service d'arrière-plan, qu'OpenCode effaçait sous Windows), réinstalle son plugin à chaque démarrage, et prend le protocole `leharnais://` au lieu de `opencode://`.
- `scripts/preparer.ts` retire les fichiers créés par un patch avant de le réappliquer.
- Le défi final explique comment brancher Infomaniak ou LM Studio.
- Les preuves sur un fichier (`fichier.existe`, `fichier.contient`) sont réévaluées chaque seconde : un fichier corrigé à la main par l'élève valide la mission.
- Le dossier `.labo` est caché des recherches de l'IA (`.ignore`) et sa lecture lui est interdite.
- Le patch 02 : au premier lancement, le projet par défaut est l'atelier `Documents/LeLabo`.
- `scripts/preparer.ts` : récupère OpenCode à la version figée, applique nos patchs, copie l'extension. Sous Windows, il remplace les liens symboliques du dépôt d'OpenCode par des copies.
- `bun run dev` (`scripts/dev.ts`) : lance l'application isolée dans `~/.le-harnais-dev`, plugin installé, ancien service arrêté, `SHELL` retiré comme pour un élève (sauf `--garder-shell`).
- `scripts/capture.ts` : pilote l'application lancée en mode développement (capture, clic, frappe, combinaisons de touches, évaluation, attente).
- La documentation : README, règles du dépôt, architecture, feuille de route, guide de développement, questions ouvertes, licences.
- OpenCode figé sur v2.0.30 (`upstream/opencode.lock.json`).
- La routine de mise à jour d'OpenCode : `bun scripts/monter-opencode.ts <étiquette>` essaie nos patchs sur une autre version, et déplace le verrou avec `--appliquer` ; procédure dans `docs/mettre-a-jour-opencode.md`.

### Modifié

- OpenCode passe de v2.0.29 à v2.0.30 : les 7 patchs passent tels quels, missions et outils des sens vérifiés dans l'application.

- La preuve `terminal.commande` vérifie la commande et sa réussite (et non plus sa sortie) : la lecture de l'écran du terminal est remplacée par l'intégration au shell, plus fiable.
- L'outil `execute` (mode code d'OpenCode) est autorisé dès le départ : sans lui, le navigateur restait inaccessible à l'IA ; ses outils internes gardent leur propre permission.
- Le panneau fête une mission réussie d'après la dernière réussite enregistrée (et non plus un message à usage unique), puis passe à la suivante.
- Les consignes du prof : l'IA ne demande plus l'autorisation par écrit (le harnais affiche la demande), l'indice ne sert que si l'élève bloque, et l'IA n'anticipe pas les gestes de la mission.
- Le cours « Ton IA agit, avec ton accord » : un refus arrête l'IA (« Interrompu »).
- Un outil fourni par une capacité (`effet: outil`) est aussi autorisé : la règle de base « tout refuser » le retirait de la vue de l'IA.
- La mission « Dicter » ne demande plus « poignet gauche » mot pour mot : Whisper base entend parfois « poignage ». Le cours invite à repérer l'erreur.
- L'atelier LeLabo se rouvre à chaque lancement sans onglet ouvert (patchs 02 et 08), et non plus seulement au tout premier : quand la liste des projets de l'application se perdait (arrêt brutal, profil abîmé), l'élève arrivait sur « Ajouter un projet », sans zone de saisie, et « Nouvelle session » ne faisait rien. Il retombe maintenant sur une nouvelle session dans LeLabo.
- La bande de bienvenue dit où cliquer, mot à mot, pour quelqu'un qui découvre tout.
- Le cours et l'indice de la mission « Le terminal" : le « bouton en bas de la fenêtre » n'existe pas. On ouvre le terminal avec `/terminal` dans la zone de saisie (ou Ctrl+`, peu pratique au clavier français), et on précise que les commandes se tapent dans le terminal, pas dans la conversation (ni par « + > commande shell » de la zone de saisie, que le harnais ne voit pas).
- Le panneau des missions défile : le conteneur d'OpenCode coupe ce qui dépasse (`overflow: hidden`), le contenu des missions n'était lisible qu'en partie.
- Le patch 07 réessaie d'adopter le service d'arrière-plan existant quand le démarrage d'un second échoue sur le port déjà pris (jusqu'à une minute). Un service lent à répondre (Windows analyse un dossier tout juste copié) passait pour absent.
- Application publiée : le modèle gratuit d'OpenCode n'est plus proposé (`disabled_providers`, écrit une seule fois dans la configuration de l'application).
- Le cours « Brancher ton IA » : ChatGPT par abonnement en premier, plus de blabla sur le modèle gratuit.
- Le cours « Brancher ton IA » : le modèle gratuit d'OpenCode ne répond pas dans l'application publiée ; il oriente vers OpenRouter (modèles gratuits) ou un modèle local.
- Le panneau des missions ne déborde plus quand le cours contient un bloc de code large : le bloc défile.
- La lecture à voix haute attend que les voix du système soient chargées (la voix française n'était pas trouvée au premier appel).
- Le cours « Les skills » demande d'ouvrir une nouvelle conversation : sinon l'IA a déjà la recette en tête et ne la charge pas.

### Vérifié dans l'application

Missions jouées de bout en bout dans OpenCode Desktop, sous Windows, avec le modèle gratuit par défaut : brancher-ia, harnais-c-est-quoi, terminal (PowerShell), fichiers, ia-et-terminal, navigateur, audit-lighthouse, skills, mcp-lighthouse, plugins-graphify, dicter, ecouter, lire-scan (correction du fichier à la main), voir-image.
