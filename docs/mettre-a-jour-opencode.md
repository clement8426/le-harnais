# Mettre à jour OpenCode

Le Harnais suit OpenCode : la version utilisée est figée dans `upstream/opencode.lock.json`, et nos modifications tiennent dans quelques patchs courts (`upstream/patches/`, détaillés dans [architecture.md](architecture.md#les-patchs-dopencode)). Monter de version, c'est vérifier que ces patchs passent encore, puis que le harnais fonctionne.

## 1. Essayer la nouvelle version

```bash
bun scripts/monter-opencode.ts v2.0.31
```

Le script récupère l'étiquette, applique nos patchs dessus un par un et dit lesquels passent. C'est un essai à blanc : la copie de travail revient ensuite à la version du verrou.

## 2. Si un patch ne passe plus

OpenCode a modifié le fichier que le patch touche. Pour le refaire :

1. `git -C .upstream/opencode checkout -f --detach v2.0.31` ;
2. appliquer les patchs qui passent, dans l'ordre (`git -C .upstream/opencode apply upstream/patches/0X-….patch`) ;
3. refaire à la main la modification du patch qui échoue, en lisant l'ancien patch : le but est écrit dans son commentaire et dans architecture.md ;
4. régénérer le patch avec `git -C .upstream/opencode diff -- <fichiers du patch> > upstream/patches/0X-….patch` (pour un fichier créé par le patch, `git add -N` avant le diff, `git reset` après) ;
5. relancer l'essai de l'étape 1.

Garder chaque patch aussi court que possible : moins il touche OpenCode, moins il casse.

## 3. Déplacer le verrou

```bash
bun scripts/monter-opencode.ts v2.0.31 --appliquer
cd .upstream/opencode && bun install
```

## 4. Vérifier

Les patchs qui s'appliquent ne garantissent pas que tout marche : les API d'OpenCode que nous utilisons peuvent avoir changé.

- `bun run test`, `bun run typecheck`, puis la vérification des types de l'extension : `cd .upstream/opencode/packages/gui-extensions && bun typecheck` ;
- `bun run dev` : le panneau des missions s'affiche, une mission avec l'IA se valide, un outil des sens répond (par exemple « Dicter ») ;
- si une API a changé : le plugin ne parle à OpenCode que par `packages/plugin/src/opencode.ts`, l'extension par le SDK `../sdk` ;
- `bun scripts/empaqueter.ts`, puis lancer l'application construite (voir developper.md).

## 5. Noter

Une ligne dans le CHANGELOG (« OpenCode passe de v2.0.30 à v2.0.31 »), et un commit `chore(upstream): …` qui contient le verrou et les patchs refaits.
