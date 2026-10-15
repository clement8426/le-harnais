# Développer

## Prérequis

- [Bun](https://bun.sh) 1.4 ou plus, Node.js 24, Git.
- [Graphify](https://github.com/Graphify-Labs/graphify) pour le graphe du dépôt : `uv tool install graphifyy` (deux y).

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

Les coordonnées de `--clic` sont en pixels CSS : divise celles d'une capture par le facteur d'échelle de l'écran (`devicePixelRatio`, 1,25 sur le poste de développement).
