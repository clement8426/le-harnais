#!/usr/bin/env bun
// Essaie une autre version d'OpenCode : récupère l'étiquette demandée, applique nos patchs dessus, dit lesquels passent.
// Sans --appliquer, rien ne change : la copie de travail revient à la version du verrou.
// Avec --appliquer, et seulement si tous les patchs passent, le verrou (upstream/opencode.lock.json) avance.
//
//   bun scripts/monter-opencode.ts v2.0.31               essai à blanc
//   bun scripts/monter-opencode.ts v2.0.31 --appliquer   déplace le verrou si tout passe
//
// La suite, à la main : bun run dev (jouer quelques missions), bun scripts/empaqueter.ts. Voir docs/mettre-a-jour-opencode.md.

import { $ } from "bun"
import { readdirSync, readFileSync, rmSync } from "node:fs"
import path from "node:path"

const racine = path.join(import.meta.dir, "..")
const fichierVerrou = path.join(racine, "upstream/opencode.lock.json")
const verrou = (await Bun.file(fichierVerrou).json()) as { depot: string; etiquette: string; commit: string; date: string }
const opencode = path.join(racine, ".upstream/opencode")
const etiquette = process.argv[2]
const appliquer = process.argv.includes("--appliquer")
if (!etiquette || etiquette.startsWith("--")) throw new Error("Indique l'étiquette d'OpenCode à essayer, par exemple : bun scripts/monter-opencode.ts v2.0.31")

console.log(`OpenCode ${verrou.etiquette} → ${etiquette}`)
await $`git -C ${opencode} fetch --depth 1 origin tag ${etiquette}`.quiet()
const commit = (await $`git -C ${opencode} rev-parse ${etiquette}^{commit}`.text()).trim()

// On part d'un état propre de la nouvelle version : fichiers suivis remis à neuf, fichiers créés par nos patchs effacés.
const patchs = readdirSync(path.join(racine, "upstream/patches")).filter((f) => f.endsWith(".patch")).sort()
const nettoyer = () => {
  for (const patch of patchs)
    for (const [, fichier] of readFileSync(path.join(racine, "upstream/patches", patch), "utf8").matchAll(/^--- \/dev\/null\r?\n\+\+\+ b\/(.+)$/gm))
      rmSync(path.join(opencode, fichier!.trim()), { force: true })
}
nettoyer()
await $`git -C ${opencode} checkout -f --detach ${commit}`.quiet()

const echecs: string[] = []
for (const patch of patchs) {
  const resultat = await $`git -C ${opencode} apply --check --whitespace=nowarn ${path.join(racine, "upstream/patches", patch)}`.nothrow().quiet()
  if (resultat.exitCode === 0) {
    await $`git -C ${opencode} apply --whitespace=nowarn ${path.join(racine, "upstream/patches", patch)}`.quiet()
    console.log(`  ✓ ${patch}`)
    continue
  }
  echecs.push(patch)
  console.log(`  ✗ ${patch}\n${resultat.stderr.toString().replace(/^/gm, "      ")}`)
}

if (echecs.length || !appliquer) {
  // Retour à la version du verrou, patchs compris.
  nettoyer()
  await $`git -C ${opencode} checkout -f --detach ${verrou.commit}`.quiet()
  await $`bun ${path.join(import.meta.dir, "preparer.ts")}`.quiet()
  if (echecs.length) {
    console.log(`\n${echecs.length} patch(s) à refaire sur ${etiquette} : voir docs/mettre-a-jour-opencode.md. Rien n'a changé.`)
    process.exit(1)
  }
  console.log(`\nTous les patchs passent sur ${etiquette}. Relance avec --appliquer pour déplacer le verrou.`)
  process.exit(0)
}

const date = (await $`git -C ${opencode} log -1 --format=%cs ${commit}`.text()).trim()
await Bun.write(fichierVerrou, JSON.stringify({ ...verrou, etiquette, commit, date }, null, 2) + "\n")
await $`bun ${path.join(import.meta.dir, "preparer.ts")}`.quiet()
console.log(`\n✓ Verrou déplacé sur ${etiquette} (${commit.slice(0, 7)}, ${date}). Ensuite : bun install dans .upstream/opencode, bun run dev, puis le CHANGELOG.`)
