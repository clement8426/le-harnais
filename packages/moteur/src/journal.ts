// Le journal : un fichier JSONL (une ligne JSON par événement), en ajout seulement.
// Chaque source (plugin serveur, extension d'interface) y écrit ; les preuves le relisent.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import type { Evenement } from "./types"

export function ajouter(fichier: string, evenement: Evenement) {
  mkdirSync(path.dirname(fichier), { recursive: true })
  appendFileSync(fichier, JSON.stringify(evenement) + "\n", "utf8")
}

/** Une ligne illisible (fichier coupé net, par exemple) est ignorée plutôt que de tout bloquer. */
export function lire(fichier: string): Evenement[] {
  if (!existsSync(fichier)) return []
  return readFileSync(fichier, "utf8")
    .split("\n")
    .filter(Boolean)
    .flatMap((ligne) => {
      try {
        const e = JSON.parse(ligne)
        return e && typeof e.type === "string" && typeof e.quand === "string" ? [e as Evenement] : []
      } catch {
        return []
      }
    })
}
