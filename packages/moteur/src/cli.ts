#!/usr/bin/env bun
// `bun run verifier [parcours]` : relit les contenus et affiche le parcours numéroté et les problèmes.
// Code de sortie 1 s'il reste une erreur : la publication est bloquée.

import path from "node:path"
import { chargerContenus, ErreurContenu } from "./chargement"
import { numeroter, verifier } from "./parcours"

const racine = path.resolve(process.env.LABO_CONTENUS ?? path.join(import.meta.dir, "../../../contenus"))

try {
  const contenus = chargerContenus(racine)
  const demandes = process.argv.slice(2)
  const ids = demandes.length ? demandes : [...contenus.parcours.keys()]
  const erreurs = ids.map((id) => afficher(id, contenus)).reduce((a, b) => a + b, 0)
  process.exit(erreurs ? 1 : 0)
} catch (e) {
  if (!(e instanceof ErreurContenu)) throw e
  console.error(`✗ ${e.message}`)
  process.exit(1)
}

function afficher(id: string, contenus: ReturnType<typeof chargerContenus>) {
  const parcours = contenus.parcours.get(id)
  console.log(`\nParcours « ${id} »${parcours ? ` : ${parcours.titre}` : ""}`)
  if (parcours)
    numeroter(parcours, contenus.missions).forEach((e, i, toutes) => {
      if (i === 0 || toutes[i - 1]!.chapitre.id !== e.chapitre.id) console.log(`  ${e.chapitre.numero}. ${e.chapitre.titre}`)
      console.log(`     ${String(e.numero).padStart(2)}  ${e.mission.id.padEnd(24)} ${e.mission.titre}`)
    })
  const diagnostics = verifier(contenus, id)
  diagnostics.forEach((d) => console.log(`  ${d.niveau === "erreur" ? "✗" : "!"} ${d.message}`))
  const erreurs = diagnostics.filter((d) => d.niveau === "erreur").length
  console.log(erreurs ? `  ${erreurs} erreur(s) : à corriger avant de publier.` : "  ✓ Aucune erreur.")
  return erreurs
}
