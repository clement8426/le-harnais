// Fabrique un petit jeu de contenus dans un dossier temporaire, pour les tests.

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { stringify } from "yaml"

export interface Jeu {
  capacites?: { id: string; effets?: unknown[] }[]
  toujours?: unknown[]
  missions: Record<string, Partial<{ requiert: string[]; debloque: string[]; preuves: unknown[]; questions: unknown[]; version: number; os: string[] }>>
  parcours: Record<string, { socle?: string[]; chapitres: Record<string, string[]> }>
}

export function fabriquer(jeu: Jeu) {
  const racine = mkdtempSync(path.join(tmpdir(), "harnais-"))
  const capacites: { id: string; effets?: unknown[] }[] = jeu.capacites ?? [
    ...new Set([
      ...Object.values(jeu.missions).flatMap((m) => [...(m.requiert ?? []), ...(m.debloque ?? [])]),
      ...Object.values(jeu.parcours).flatMap((p) => p.socle ?? []),
    ]),
  ].map((id) => ({ id }))
  writeFileSync(
    path.join(racine, "capacites.yaml"),
    stringify({
      capacites: capacites.map((c) => ({ id: c.id, titre: c.id, description: `Capacité ${c.id}`, effets: c.effets ?? [] })),
      toujours: jeu.toujours ?? [],
    }),
  )
  Object.entries(jeu.missions).forEach(([id, m]) => {
    const dossier = path.join(racine, "missions", id)
    mkdirSync(dossier, { recursive: true })
    writeFileSync(
      path.join(dossier, "mission.yaml"),
      stringify({
        id,
        titre: `Mission ${id}`,
        version: m.version ?? 1,
        resume: `Résumé de ${id}`,
        requiert: m.requiert ?? [],
        debloque: m.debloque ?? [],
        preuves: m.preuves ?? [{ type: "ia.reponse" }],
        questions: m.questions ?? [],
        indice: "Un indice.",
        ...(m.os ? { os: m.os } : {}),
      }),
    )
  })
  mkdirSync(path.join(racine, "parcours"), { recursive: true })
  Object.entries(jeu.parcours).forEach(([id, p]) =>
    writeFileSync(
      path.join(racine, "parcours", `${id}.yaml`),
      stringify({
        id,
        titre: `Parcours ${id}`,
        socle: p.socle ?? [],
        chapitres: Object.entries(p.chapitres).map(([cid, missions]) => ({ id: cid, titre: `Chapitre ${cid}`, missions })),
      }),
    ),
  )
  return racine
}
