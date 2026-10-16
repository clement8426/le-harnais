#!/usr/bin/env bun
// Construit l'installeur du Harnais pour le système courant (Windows : un .exe NSIS dans .upstream/opencode/packages/desktop/dist).
//   1. prépare OpenCode (version figée et patchs) et installe ses dépendances ;
//   2. construit notre plugin et range nos ressources (plugin, contenus, intégration du shell) ;
//   3. construit le serveur d'OpenCode depuis notre copie patchée (et non la version publiée sur npm) ;
//   4. construit l'application de bureau et l'empaquette avec notre nom, notre identifiant et notre icône.
//
//   bun scripts/empaqueter.ts

import { $ } from "bun"
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs"
import path from "node:path"

const racine = path.join(import.meta.dir, "..")
const opencode = path.join(racine, ".upstream/opencode")
const bureau = path.join(opencode, "packages/desktop")
const version = ((await Bun.file(path.join(racine, "package.json")).json()) as { version: string }).version

await $`bun ${path.join(import.meta.dir, "preparer.ts")}`
await $`bun install`.cwd(opencode)

console.log("Plugin et ressources du Harnais…")
await $`bun run --cwd ${path.join(racine, "packages/plugin")} construire`.quiet()
const ressources = path.join(bureau, "resources/le-harnais")
rmSync(ressources, { recursive: true, force: true })
mkdirSync(path.join(ressources, "plugin"), { recursive: true })
cpSync(path.join(racine, "packages/plugin/dist/le-harnais.js"), path.join(ressources, "plugin/le-harnais.js"))
cpSync(path.join(racine, "contenus"), path.join(ressources, "contenus"), { recursive: true })
cpSync(path.join(racine, "packages/plugin/shell"), path.join(ressources, "shell"), { recursive: true })

console.log("Serveur d'OpenCode (version figée, patchée)…")
const cli = path.join(opencode, "packages/cli")
// Sur x64, l'application embarque la variante « baseline », qui tourne aussi sur les processeurs sans AVX2.
const baseline = process.arch === "x64" ? ["--baseline"] : []
await $`bun run build --single --skip-install --skip-web-ui ${baseline}`.cwd(cli)
await $`bun -e ${"import { copyBuiltCliToResources } from './scripts/utils'; await copyBuiltCliToResources(process.argv[1])"} ${path.join(cli, "dist")}`.cwd(bureau)

console.log("Icônes et configuration d'empaquetage…")
const icones = path.join(bureau, "resources/icons")
rmSync(icones, { recursive: true, force: true })
cpSync(path.join(racine, "marque/icones"), icones, { recursive: true })
cpSync(path.join(racine, "upstream/electron-builder.le-harnais.ts"), path.join(bureau, "electron-builder.le-harnais.ts"))
await $`bun ./scripts/copy-metainfo.ts dev`.cwd(bureau)

console.log("Application de bureau…")
// Canal « dev » : l'extension de mise à jour automatique reste éteinte. Pas de VITE_SENTRY_DSN : pas de Sentry.
const env = { ...process.env, OPENCODE_CHANNEL: "dev", LE_HARNAIS_VERSION: version, VITE_SENTRY_DSN: "" }
await $`bun run build`.cwd(bureau).env(env)
await $`bunx electron-builder --config electron-builder.le-harnais.ts`.cwd(bureau).env(env)

// L'archive que l'élève télécharge : le dossier de l'application (exécutable d'Electron intact) et son lanceur.
const sortie = path.join(bureau, "dist")
cpSync(path.join(racine, "upstream/Lancer-Le-Harnais.bat"), path.join(sortie, "win-unpacked/Lancer-Le-Harnais.bat"))
const archive = `le-harnais-${version}-win-x64.zip`
rmSync(path.join(sortie, archive), { force: true })
// tar (bsdtar, livré avec Windows 10 et 11) écrit un .zip bien plus vite que Compress-Archive.
await $`tar -a -cf ${archive} -C ${sortie} win-unpacked`.cwd(sortie)

console.log(`✓ Le Harnais ${version} : ${readdirSync(sortie).filter((f) => f.startsWith("le-harnais-") && !f.endsWith(".blockmap")).join(", ")} dans ${path.relative(racine, sortie)}`)
