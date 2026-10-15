// Repère ce qui intéresse les preuves après un appel d'outil de l'IA : les pages web consultées (dans le texte du
// résultat) et les audits Lighthouse (dans les rapports que le navigateur d'OpenCode enregistre sur le disque).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const ADRESSE = /\b(?:https?|file):\/\/[^\s"'<>)\\]+/g

/** Les pages web citées dans le résultat d'un outil (le navigateur d'OpenCode y écrit les adresses consultées). */
export function pagesCitees(resultat: string): string[] {
  // Le texte peut être du JSON échappé une fois (résultat imbriqué) : on retire les barres d'échappement des guillemets.
  const texte = resultat.replace(/\\"/g, '"')
  // La ponctuation qui suit une adresse dans une phrase (virgule, point…) n'en fait pas partie.
  return [...new Set([...texte.matchAll(ADRESSE)].map((m) => m[0].replace(/[.,;:!?]+$/, "")))]
}

/**
 * Les rapports Lighthouse que le navigateur d'OpenCode a enregistrés depuis `depuis` (millisecondes), dans le dossier
 * temporaire du serveur (opencode-browser-*\/<n>/lighthouse.json). Ne dépend pas de ce que l'IA a gardé du résultat.
 */
export function rapportsLighthouse(dossierTemporaire: string, depuis: number, dejaLus: Set<string>) {
  if (!existsSync(dossierTemporaire)) return []
  return readdirSync(dossierTemporaire)
    .filter((nom) => nom.startsWith("opencode-browser-") && !nom.startsWith("opencode-browser-client"))
    .map((nom) => path.join(dossierTemporaire, nom))
    .filter((dossier) => statSync(dossier).mtimeMs >= depuis)
    .flatMap((dossier) => readdirSync(dossier).map((n) => path.join(dossier, n, "lighthouse.json")))
    .filter((fichier) => existsSync(fichier) && !dejaLus.has(fichier))
    .flatMap((fichier) => {
      dejaLus.add(fichier)
      try {
        const rapport = JSON.parse(readFileSync(fichier, "utf8")) as { categories?: Record<string, { id: string; score: number | null }> }
        return Object.values(rapport.categories ?? {})
          .filter((c) => c.score !== null)
          .map((c) => ({ categorie: c.id, score: Math.round((c.score ?? 0) * 100) }))
      } catch {
        return []
      }
    })
}
