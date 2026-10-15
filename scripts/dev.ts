#!/usr/bin/env bun
// Lance Le Harnais en mode développement, isolé de tout OpenCode installé sur le poste :
//   1. prépare OpenCode (preparer.ts) ;
//   2. construit le plugin et l'installe dans la configuration isolée ;
//   3. lance l'application avec ses propres dossiers de données (~/.le-harnais-dev), l'atelier LeLabo compris.
//
//   bun scripts/dev.ts            garde les données d'un lancement à l'autre
//   bun scripts/dev.ts --neuf     repart de zéro (premier lancement, accueil, atelier vide)
//   bun scripts/dev.ts --garder-shell   garde la variable SHELL (Git Bash au lieu de PowerShell dans le terminal)

import { $ } from "bun"
import { cpSync, mkdirSync, rmSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"

const racine = path.join(import.meta.dir, "..")
// Hors du dépôt : OpenCode remonte l'arborescence et lirait sinon le CLAUDE.md du dépôt comme consignes de l'élève.
const donnees = process.env.LE_HARNAIS_DEV_DONNEES ?? path.join(homedir(), ".le-harnais-dev")
const opencode = path.join(racine, ".upstream/opencode")

// Le serveur d'OpenCode est un service d'arrière-plan qui survit à la fenêtre (port 3084 en développement).
// Un ancien service garderait l'ancien plugin et l'ancien environnement : on l'arrête avant de relancer.
await arreterServiceDev()

if (process.argv.includes("--neuf")) rmSync(donnees, { recursive: true, force: true })

await $`bun ${path.join(import.meta.dir, "preparer.ts")}`
// Un patch peut ajouter des dépendances (patch 05) : bun install ne fait rien si tout est déjà là.
await $`bun install`.cwd(opencode).quiet()
await $`bun run --cwd ${path.join(racine, "packages/plugin")} construire`.quiet()

// OPENCODE_DESKTOP_TEST_ROOT range config, données, état et cache sous ce dossier (XDG_*), le service compris.
const plugins = path.join(donnees, "config/opencode/plugins")
mkdirSync(plugins, { recursive: true })
cpSync(path.join(racine, "packages/plugin/dist/le-harnais.js"), path.join(plugins, "le-harnais.js"))
console.log(`✓ plugin installé dans ${path.relative(racine, plugins)}`)

// Le vrai bun.exe en tête du PATH : npm n'installe qu'un raccourci .cmd, que l'application ne sait pas lancer.
const bunExe = path.join((await $`npm root -g`.text()).trim(), "bun/bin")
// OpenCode prend le shell de la variable SHELL quand elle existe (Git Bash la définit). Un élève qui lance
// l'application depuis le menu Démarrer n'en a pas, et obtient PowerShell : on fait pareil, sauf avec --garder-shell.
const { SHELL, ...sansShell } = process.env
const base = process.argv.includes("--garder-shell") ? process.env : sansShell
const env = {
  ...base,
  PATH: `${bunExe}${path.delimiter}${process.env.PATH}`,
  OPENCODE_DESKTOP_TEST_ROOT: donnees,
  OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT: process.env.OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT ?? "9333",
  LE_HARNAIS_ATELIER: path.join(donnees, "LeLabo"),
  LABO_CONTENUS: path.join(racine, "contenus"),
  LE_HARNAIS_POWERSHELL_INIT: path.join(racine, "packages/plugin/shell/integration.ps1"),
  // bash lit ce chemin dans PROMPT_COMMAND : barres obliques normales, que Git Bash comprend aussi.
  LE_HARNAIS_BASH_INIT: path.join(racine, "packages/plugin/shell/integration.sh").replaceAll("\\", "/"),
  LE_HARNAIS_TRACE: "1",
}
console.log("Lancement de l'application…")
const app = Bun.spawn(["bun", "run", "dev:desktop"], { cwd: opencode, env, stdio: ["inherit", "inherit", "inherit"] })
process.exit(await app.exited)

async function arreterServiceDev() {
  const port = 0x0c0c // 3084 : le port fixe du service isolé de développement (packages/desktop, background-service.ts)
  const pids =
    process.platform === "win32"
      ? (await $`netstat -ano`.text())
          .split("\n")
          .filter((l) => l.includes(`:${port} `) && l.includes("LISTENING"))
          .map((l) => l.trim().split(/\s+/).at(-1)!)
      : (await $`lsof -ti tcp:${port}`.nothrow().text()).split("\n").filter(Boolean)
  for (const pid of new Set(pids)) {
    process.platform === "win32" ? await $`taskkill /F /PID ${pid}`.quiet().nothrow() : await $`kill ${pid}`.quiet().nothrow()
    console.log(`✓ ancien service de développement arrêté (processus ${pid})`)
  }
}
