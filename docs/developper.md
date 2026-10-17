# Développer

## Prérequis

- [Bun](https://bun.sh) 1.4 ou plus, Node.js 24, Git.
- [Graphify](https://github.com/Graphify-Labs/graphify) pour le graphe du dépôt : `uv tool install graphifyy` (deux y).

## Le plus simple : un double-clic

`Lancer-en-developpement.bat` (à la racine) vérifie Git, Node.js et Bun (et propose de les installer avec winget s'il en manque), installe les dépendances, puis lance l'application. `scripts/demarrer-dev.ps1 -Verifier` ne fait que contrôler les outils. Le détail, étape par étape, est ci-dessous.

## Lancer les tests du moteur

```bash
bun install
bun run test
bun run verifier
```

## Lancer l'application en mode développement

La première fois (et après un nouveau patch qui ajoute des dépendances, `bun run dev` le fait tout seul) :

```bash
bun scripts/preparer.ts
cd .upstream/opencode && bun install
```

Ensuite, depuis la racine :

```bash
bun run dev
```

`scripts/dev.ts` prépare OpenCode (version figée, patchs, copie de l'extension), construit le plugin, l'installe dans une configuration isolée (`~/.le-harnais-dev`), et lance l'application. `bun run dev -- --neuf` repart de zéro, comme un premier lancement. Les traces du plugin vont dans `~/.le-harnais-dev/LeLabo/.labo/trace.log`.

Pendant que l'application tourne :

- extension modifiée : `bun scripts/preparer.ts --copier` (Vite recharge la fenêtre) ;
- plugin modifié : `bun run --cwd packages/plugin construire`, puis copier `dist/le-harnais.js` dans `~/.le-harnais-dev/config/opencode/plugins/` (le serveur le recharge) ;
- contenus modifiés : le plugin les lit à son démarrage ; recopier le plugin (comme ci-dessus) le fait redémarrer et relire `contenus/`.

La première compilation prend environ deux minutes. L'onglet « Missions » apparaît dans la zone latérale d'une session (bouton « Basculer la revue »).

## Construire l'installeur

```bash
bun scripts/empaqueter.ts
```

Prépare OpenCode, construit le plugin, le serveur (depuis notre copie patchée) et l'application, puis l'archive à distribuer, `.upstream/opencode/packages/desktop/dist/le-harnais-<version>-win-x64.zip` (le dossier de l'application avec son lanceur `Lancer-Le-Harnais.bat`), et un installeur : `.upstream/opencode/packages/desktop/dist/le-harnais-<version>-win-x64.exe` sous Windows. Compter une dizaine de minutes la première fois (electron-builder télécharge Electron et NSIS). L'installeur n'est pas signé.

Pour essayer l'application construite sans l'installer, et sans écrire dans tes Documents :

```bash
LE_HARNAIS_ATELIER="$TEMP/essai/LeLabo" ".upstream/opencode/packages/desktop/dist/win-unpacked/Le Harnais.exe" --remote-debugging-port=9334
```

Elle range ses données dans `%APPDATA%\app.leharnais.desktop`. Si Windows répond « Une stratégie de contrôle d'application a bloqué ce fichier », c'est le contrôle intelligent des applications de Windows 11 : il bloque les programmes non signés (voir la question 4). `scripts/capture.ts` la pilote avec `OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT=9334`.

## Deux pièges sous Windows

**Bun installé par npm.** `npm install -g bun` ne pose qu'un raccourci `bun.cmd`. L'application lance le serveur avec `spawn("bun")` sans shell, qui ne sait pas exécuter un `.cmd` : le serveur ne démarre pas (« spawn bun ENOENT »). Parade : mettre le vrai `bun.exe` en tête du PATH.

```bash
export PATH="$(npm root -g)/bun/bin:$PATH"
```

**Port de débogage réservé.** En développement, l'application ouvre le protocole de débogage de Chrome sur le port 9222, qui tombe dans une plage réservée par Windows sur certains postes (« bind() returned an error »). Parade : choisir un autre port.

```bash
export OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT=9333
```

Pour voir les plages réservées : `netsh interface ipv4 show excludedportrange protocol=tcp`.

## Capturer l'application

Avec l'application lancée en mode développement :

```bash
bun scripts/capture.ts capture.png
bun scripts/capture.ts --eval "document.title"
bun scripts/capture.ts --clic 800 495 --taper "Bonjour" --touche Enter --attendre 3000 capture.png
```

`--attendre` compte en millisecondes. Tous les `--eval` s'exécutent dans la même page, comme dans une console : une déclaration `const` au premier niveau ne peut pas être répétée d'un appel à l'autre, enveloppe-la dans une fonction (`(() => { … })()`).

Les coordonnées de `--clic` sont en pixels CSS : divise celles d'une capture par le facteur d'échelle de l'écran (`devicePixelRatio`, 1,25 sur le poste de développement).
