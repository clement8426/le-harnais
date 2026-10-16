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

Le navigateur d'OpenCode se pilote par l'outil `execute` (le mode code : `tools.browser.*`). Ses outils internes gardent leur propre permission (`browser`), si bien qu'autoriser `execute` n'ouvre rien par lui-même. Après chaque appel, `src/detection.ts` relève les pages citées dans le résultat, et lit les rapports Lighthouse que le navigateur enregistre dans le dossier temporaire du serveur (`opencode-browser-*/…/lighthouse.json`) : la preuve de l'audit ne dépend pas de ce que l'IA garde du résultat.

L'atelier (`src/atelier.ts`) range tout dans `LeLabo/.labo/` : `harnais.json` (le parcours suivi), `progression.json`, `en-cours.json`, `journal.jsonl`. Après chaque événement, il réévalue les preuves de la mission en cours et la valide si tout est vert. Chaque seconde, il relit aussi les fichiers que surveillent ces preuves (`fichier.existe`, `fichier.contient`) : l'élève peut les corriger à la main, sans qu'aucun événement ne passe par OpenCode.

## L'extension (`packages/extension`)

Une extension d'interface d'OpenCode, copiée dans `packages/gui-extensions/src/le-labo` par `scripts/preparer.ts`, et enregistrée parmi les extensions intégrées par le patch 01 (les extensions installées à part, au format `.ocdx`, sont encore refusées par les versions publiées d'OpenCode).

- **Entrée « fenêtre »** (`renderer.tsx`) : l'onglet « Missions » (`panneau.tsx`), et la synchronisation des extensions (`synchro.ts`). Dès qu'une session d'atelier est ouverte, et à chaque changement d'état, elle demande au plugin les extensions débloquées.
- **Entrée « processus principal »** (`main.ts`) : allume les extensions débloquées (ou prêtées par la mission en cours) et éteint les autres parmi les extensions gérées (`extensions_gerees` dans `capacites.yaml`). Elle passe par `ctx.leHarnais`, que le patch 03 ajoute au contexte de cette seule extension.

## Les sens : voix, OCR, image

Quatre outils pour l'IA, qui tournent **sur l'ordinateur de l'élève** : `transcrire` (Whisper), `lire_a_voix_haute` (la synthèse vocale du système), `ocr` (Tesseract, et pdf.js pour les PDF), `detecter_objets` (DETR). Ils n'existent pour l'IA que si leur capacité est active (`ctx.tool.transform`), et la capacité qui fournit un outil l'autorise aussi.

Le serveur d'OpenCode n'a ni micro, ni haut-parleur, ni accès simple à WebAssembly dans un navigateur : le calcul se fait dans la fenêtre, qui est un Chromium.

```text
IA ──appel──▶ plugin (src/sens.ts)            lit le fichier dans l'atelier (25 Mo au plus)
                 │ événement RPC « sens »
                 ▼
              fenêtre (extension/src/sens.ts → moteurs.ts)   calcule, sur l'ordinateur
                 │ rpc.resultatSens
                 ▼
              plugin ──résultat──▶ IA
```

Les bibliothèques (tesseract.js 7, pdfjs-dist 6, @huggingface/transformers 4) sont ajoutées aux dépendances des extensions d'OpenCode par le patch 05, et chargées au premier usage seulement. Les modèles se téléchargent une fois (Whisper base, DETR), puis restent dans le cache de la fenêtre. Le panneau affiche ce que fait le moteur pendant le calcul.

La dictée de l'élève (`extension/src/micro.ts`, bouton « Dicter un message » quand `voix.dicter` est active) passe par le même Whisper : le micro enregistre dans la fenêtre (patch 06, audio seul), le texte s'affiche dans le panneau et va dans le presse-papiers. Un son trop faible (bruit de fond) n'est pas transcrit, car Whisper invente des phrases sur un silence. L'API des extensions ne permet pas d'écrire dans la zone de saisie : l'élève colle, relit et envoie lui-même.

## Le terminal de l'élève

Le terminal ouvre le vrai shell de la machine, dans l'atelier. Pour savoir ce que l'élève y tape, le patch 04 charge une petite intégration au démarrage du shell :

- **PowerShell** (`packages/plugin/shell/integration.ps1`, variable `LE_HARNAIS_POWERSHELL_INIT`) : la fonction `prompt` note chaque commande et sa réussite (`$?`) ;
- **bash** (`packages/plugin/shell/integration.sh`, variable `LE_HARNAIS_BASH_INIT`) : même chose via `PROMPT_COMMAND`.

Les deux écrivent une ligne JSON par commande dans `.labo/terminal.jsonl`, sans rien envoyer ailleurs. Le plugin relit ce fichier chaque seconde et l'ajoute au journal. OpenCode choisit le shell d'après la variable `SHELL` (Git Bash la définit), sinon PowerShell sous Windows.

## Les patchs d'OpenCode

| Patch | Ce qu'il change | Pourquoi |
| --- | --- | --- |
| `01-enregistrer-extension-le-labo` | 2 listes d'extensions intégrées (7 lignes) | Charger notre extension |
| `02-atelier-lelabo-par-defaut` | Le projet créé au premier lancement | C'est l'atelier `Documents/LeLabo`, marqué `.labo/harnais.json` |
| `03-le-labo-gere-les-extensions` | Le contexte « processus principal » de l'extension `le-labo` | Lui permettre d'allumer et d'éteindre les autres extensions |
| `04-integration-shell` | La création des terminaux (`core/src/pty.ts`) | Charger l'intégration PowerShell ou bash qui note les commandes |
| `05-dependances-des-sens` | Les dépendances de `gui-extensions` (3 lignes) | Tesseract, pdf.js et transformers.js pour les sens, dans la fenêtre |
| `06-micro-pour-la-dictee` | Les permissions de la fenêtre (`desktop/src/main/windows/security.ts`) | Autoriser le micro, audio seul, pour la dictée de l'élève |
| `07-le-harnais-en-production` | Le nom, l'identifiant, le titre de la fenêtre, le protocole ; le démarrage du service d'arrière-plan ; un nouveau fichier `lifecycle/le-harnais.ts` | Une application publiée isolée de tout OpenCode installé, qui n'affiche pas le modèle gratuit d'OpenCode, et qui reprend son service même quand il répond lentement (voir ci-dessous) |

## L'application publiée

`scripts/empaqueter.ts` construit l'installeur. Ce qu'il fait, et pourquoi :

- **Le serveur est construit depuis notre copie patchée**, pas téléchargé : le patch 04 le modifie. Sur x64, c'est la variante « baseline », qui tourne aussi sur les processeurs sans AVX2.
- **Nos ressources** vont dans `resources/le-harnais` : le plugin construit, les contenus, l'intégration du shell.
- **Au démarrage** (patch 07, `lifecycle/le-harnais.ts`), l'application range toutes ses données dans `%APPDATA%\app.leharnais.desktop` (dossiers XDG compris : configuration, données, état du service), réinstalle le plugin, et indique au serveur où sont les contenus et l'intégration du shell. Rien n'est partagé avec un OpenCode installé : ni son service d'arrière-plan, ni sa configuration, ni ses liens `opencode://`.
- **Pas de mise à jour automatique** (canal « dev » d'OpenCode, aucun serveur de publication) : celle d'OpenCode remplacerait Le Harnais par OpenCode. **Pas de Sentry** : il ne s'active qu'avec `VITE_SENTRY_DSN`, que nous ne fournissons pas.
- **L'exécutable de l'application reste celui d'Electron, octet pour octet** (`signAndEditExecutable: false` et `disableAsarIntegrity: true` dans la configuration d'empaquetage) : ni nom, ni icône, ni empreinte du code n'y sont inscrits. Le contrôle intelligent des applications de Windows 11 juge les programmes non signés par leur empreinte : celle d'Electron est connue, alors qu'un exécutable modifié à chaque construction est refusé de façon imprévisible (constaté : une construction passait, la suivante était bloquée). On vérifie avec `sha256sum` contre `node_modules/electron/dist/electron.exe`. Reste `opencode-cli.exe` (le serveur, construit par nous), jamais refusé jusqu'ici mais sans garantie.
- **La configuration d'empaquetage** (`upstream/electron-builder.le-harnais.ts`) reprend celle d'OpenCode avec notre nom, notre identifiant (`app.leharnais.desktop`), notre icône (`marque/`) et nos ressources.

- **Le service d'arrière-plan survit à la fenêtre** : fermer l'application ne l'arrête pas, et la fois suivante elle le reprend. Quand l'application change de version, elle le remplace. Si le service met plus de 2 secondes à répondre à la sonde de démarrage (Windows analyse les fichiers qu'on vient de copier), OpenCode le croit absent et tente d'en lancer un second sur le port déjà pris : le patch 07 réessaie alors de reprendre le service existant, pendant une minute, au lieu d'échouer.
- **Le panneau s'adapte à sa largeur** (`panneau.tsx`, `ResizeObserver`, seuil `LARGEUR_GRAND_ECRAN` = 760 px) : large, la liste des missions est une colonne à gauche et la mission une colonne à droite, chacune avec son défilement ; étroit, la liste est un menu repliable en haut.
- **Le panneau des missions s'ouvre tout seul** au premier message de chaque session (`renderer.tsx`) : avant, OpenCode n'a pas de session, et l'élève ne devine pas le bouton « Basculer la revue ». L'écran de départ porte une bande d'accueil (`bienvenue.tsx`, emplacement `window.bottom`).

Deux limites, propres à l'application publiée :

- **Le modèle gratuit d'OpenCode n'y répond pas.** Le service d'OpenCode réserve son offre gratuite à ses propres versions, qu'il reconnaît à l'en-tête `User-Agent` du serveur. L'élève branche son fournisseur (le cours « Brancher ton IA » le guide). En développement, le serveur se présente comme une version locale et l'offre gratuite répond.
- **La connexion d'un compte OpenCode Console** passe par un lien `opencode://`, que Le Harnais ne prend pas.

## Données de développement

`scripts/dev.ts` lance l'application avec `OPENCODE_DESKTOP_TEST_ROOT=~/.le-harnais-dev` : configuration, données, état et atelier y sont isolés de tout OpenCode installé. Les données sont hors du dépôt, sinon OpenCode remonterait l'arborescence et lirait le `CLAUDE.md` du dépôt comme consignes de l'élève.
