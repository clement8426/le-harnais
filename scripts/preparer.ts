#!/usr/bin/env bun
// Prépare la copie de travail d'OpenCode dans .upstream/opencode :
//   1. la récupère à la version figée dans upstream/opencode.lock.json (si absente) ;
//   2. remet ses fichiers suivis à l'état d'origine, puis applique nos patchs (upstream/patches/*.patch) ;
//   3. copie notre extension dans gui-extensions/src/le-labo, avec les modules purs du moteur.
// Relancer ce script est sans risque : il repart toujours de l'état d'origine.
//
//   bun scripts/preparer.ts            prépare tout
//   bun scripts/preparer.ts --copier   recopie seulement l'extension (pendant le développement)

import { $ } from "bun"
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import path from "node:path"

const racine = path.join(import.meta.dir, "..")
const verrou = (await Bun.file(path.join(racine, "upstream/opencode.lock.json")).json()) as { depot: string; etiquette: string; commit: string }
const opencode = path.join(racine, ".upstream/opencode")
const seulementCopier = process.argv.includes("--copier")

if (!seulementCopier) {
  if (!existsSync(opencode)) {
    console.log(`Récupération d'OpenCode ${verrou.etiquette}…`)
    await $`git clone --depth 1 --branch ${verrou.etiquette} ${verrou.depot} ${opencode}`
  }
  const commit = (await $`git -C ${opencode} rev-parse HEAD`.text()).trim()
  if (commit !== verrou.commit) throw new Error(`OpenCode est sur ${commit}, le verrou attend ${verrou.commit}. Supprimez .upstream/ et relancez.`)

  await $`git -C ${opencode} checkout -- packages`

  // Sous Windows sans mode développeur, Git écrit les liens symboliques comme de petits fichiers contenant le chemin
  // de leur cible. On les remplace par une copie de la cible, sinon la vérification des types échoue.
  if (process.platform === "win32") {
    const liens = (await $`git -C ${opencode} ls-files -s`.text()).split("\n").filter((l) => l.startsWith("120000 ")).map((l) => l.split("\t")[1]!)
    for (const lien of liens) {
      const fichier = path.join(opencode, lien)
      const cibleLien = path.resolve(path.dirname(fichier), readFileSync(fichier, "utf8").trim())
      if (existsSync(cibleLien) && statSync(cibleLien).isFile()) cpSync(cibleLien, fichier)
    }
    console.log(`✓ ${liens.length} lien(s) symbolique(s) remplacé(s) par une copie`)
  }

  const patchs = readdirSync(path.join(racine, "upstream/patches")).filter((f) => f.endsWith(".patch")).sort()
  for (const patch of patchs) {
    await $`git -C ${opencode} apply --whitespace=nowarn ${path.join(racine, "upstream/patches", patch)}`
    console.log(`✓ patch ${patch}`)
  }
}

// L'extension, plus les modules du moteur utilisables dans une fenêtre (sans accès disque).
const cible = path.join(opencode, "packages/gui-extensions/src/le-labo")
rmSync(cible, { recursive: true, force: true })
cpSync(path.join(racine, "packages/extension/src"), cible, { recursive: true })
for (const module of ["types", "parcours", "progression", "preuves", "droits", "terminal"])
  cpSync(path.join(racine, `packages/moteur/src/${module}.ts`), path.join(cible, `moteur/${module}.ts`))
console.log(`✓ extension copiée dans ${path.relative(racine, cible)}`)
