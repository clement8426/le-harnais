#!/usr/bin/env bun
// Lance Le Harnais en mode développement, isolé de tout OpenCode installé sur le poste :
//   1. prépare OpenCode (preparer.ts) ;
//   2. construit le plugin et l'installe dans la configuration isolée ;
//   3. lance l'application avec ses propres dossiers de données (~/.le-harnais-dev), l'atelier LeLabo compris.
//
//   bun scripts/dev.ts            garde les données d'un lancement à l'autre
//   bun scripts/dev.ts --neuf     repart de zéro (premier lancement, accueil, atelier vide)

import { $ } from "bun"
import { cpSync, mkdirSync, rmSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"

const racine = path.join(import.meta.dir, "..")
// Hors du dépôt : OpenCode remonte l'arborescence et lirait sinon le CLAUDE.md du dépôt comme consignes de l'élève.
const donnees = process.env.LE_HARNAIS_DEV_DONNEES ?? path.join(homedir(), ".le-harnais-dev")
const opencode = path.join(racine, ".upstream/opencode")

if (process.argv.includes("--neuf")) rmSync(donnees, { recursive: true, force: true })

await $`bun ${path.join(import.meta.dir, "preparer.ts")}`
await $`bun run --cwd ${path.join(racine, "packages/plugin")} construire`.quiet()

// OPENCODE_DESKTOP_TEST_ROOT range config, données, état et cache sous ce dossier (XDG_*), le service compris.
const plugins = path.join(donnees, "config/opencode/plugins")
mkdirSync(plugins, { recursive: true })
cpSync(path.join(racine, "packages/plugin/dist/le-harnais.js"), path.join(plugins, "le-harnais.js"))
console.log(`✓ plugin installé dans ${path.relative(racine, plugins)}`)

// Le vrai bun.exe en tête du PATH : npm n'installe qu'un raccourci .cmd, que l'application ne sait pas lancer.
const bunExe = path.join((await $`npm root -g`.text()).trim(), "bun/bin")
const env = {
  ...process.env,
  PATH: `${bunExe}${path.delimiter}${process.env.PATH}`,
  OPENCODE_DESKTOP_TEST_ROOT: donnees,
  OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT: process.env.OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT ?? "9333",
  LE_HARNAIS_ATELIER: path.join(donnees, "LeLabo"),
  LABO_CONTENUS: path.join(racine, "contenus"),
  LE_HARNAIS_TRACE: "1",
}
console.log("Lancement de l'application…")
const app = Bun.spawn(["bun", "run", "dev:desktop"], { cwd: opencode, env, stdio: ["inherit", "inherit", "inherit"] })
process.exit(await app.exited)
