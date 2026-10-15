// Le parcours ordonne des missions par leur nom. Les numéros ne sont jamais stockés : on les calcule ici.

import type { Contenus, Diagnostic, Mission, Parcours, Systeme } from "./types"

export interface EtapeNumerotee {
  numero: number
  chapitre: { id: string; titre: string; numero: number }
  mission: Mission
}

/** Les missions du parcours, dans l'ordre, avec leur numéro calculé. Les missions d'un autre système sont retirées. */
export function numeroter(parcours: Parcours, missions: Map<string, Mission>, systeme?: Systeme): EtapeNumerotee[] {
  return parcours.chapitres
    .flatMap((chapitre, c) =>
      chapitre.missions
        .map((id) => missions.get(id))
        .filter((m): m is Mission => !!m && (!systeme || !m.os || m.os.includes(systeme)))
        .map((mission) => ({ chapitre: { id: chapitre.id, titre: chapitre.titre, numero: c + 1 }, mission })),
    )
    .map((etape, i) => ({ numero: i + 1, ...etape }))
}

/**
 * Relit le catalogue, les missions et un parcours, et liste tout ce qui ne va pas.
 * Une erreur empêche la publication ; un avertissement la laisse passer.
 */
export function verifier(contenus: Contenus, parcoursId: string): Diagnostic[] {
  const parcours = contenus.parcours.get(parcoursId)
  if (!parcours) return [erreur("parcours-inconnu", `Le parcours « ${parcoursId} » n'existe pas.`)]

  const capacites = new Set(contenus.catalogue.capacites.map((c) => c.id))
  const diagnostics: Diagnostic[] = []

  parcours.socle
    .filter((id) => !capacites.has(id))
    .forEach((id) => diagnostics.push(erreur("capacite-inconnue", `Le socle cite la capacité « ${id} », absente de capacites.yaml.`)))

  contenus.catalogue.capacites
    .map((c) => c.id)
    .filter((id, i, ids) => ids.indexOf(id) !== i)
    .forEach((id) => diagnostics.push(erreur("capacite-en-double", `La capacité « ${id} » est déclarée deux fois.`)))

  contenus.catalogue.capacites.forEach((c) =>
    c.effets
      .filter((e) => e.type === "extension" && !contenus.catalogue.extensionsGerees.includes(e.id))
      .forEach((e) =>
        diagnostics.push(
          erreur("extension-non-geree", `La capacité « ${c.id} » allume l'extension « ${e.type === "extension" ? e.id : ""} », absente de « extensions_gerees » : elle ne serait jamais éteinte.`),
        ),
      ),
  )

  parcours.chapitres
    .filter((c) => c.missions.length === 0)
    .forEach((c) => diagnostics.push(avertissement("chapitre-vide", `Le chapitre « ${c.id} » ne contient aucune mission.`)))

  const ordre = parcours.chapitres.flatMap((c) => c.missions)

  ordre
    .filter((id, i) => ordre.indexOf(id) !== i)
    .forEach((id) => diagnostics.push(erreur("mission-en-double", `La mission « ${id} » apparaît deux fois dans le parcours.`)))

  ordre
    .filter((id) => !contenus.missions.has(id))
    .forEach((id) => diagnostics.push(erreur("mission-inconnue", `Le parcours cite « ${id} », mais le dossier missions/${id}/ n'existe pas.`)))

  // Qui débloque quoi, et à quelle place : sert à expliquer une dépendance mal placée.
  const debloquePar = new Map<string, { mission: string; place: number }[]>()
  ordre.forEach((id, place) =>
    contenus.missions.get(id)?.debloque.forEach((cap) => debloquePar.set(cap, [...(debloquePar.get(cap) ?? []), { mission: id, place }])),
  )

  const acquises = new Set(parcours.socle)
  ordre.forEach((id, place) => {
    const mission = contenus.missions.get(id)
    if (!mission) return
    ;[...mission.requiert, ...mission.prete, ...mission.debloque]
      .filter((cap) => !capacites.has(cap))
      .forEach((cap) => diagnostics.push(erreur("capacite-inconnue", `« ${id} » cite la capacité « ${cap} », absente de capacites.yaml.`)))
    mission.requiert
      .filter((cap) => capacites.has(cap) && !acquises.has(cap))
      .forEach((cap) => diagnostics.push(erreur("ordre", expliquerManque(id, cap, place, debloquePar.get(cap) ?? []))))
    mission.debloque.forEach((cap) => acquises.add(cap))
    if (mission.preuves.length === 0) diagnostics.push(erreur("sans-preuve", `« ${id} » n'a aucune preuve : elle ne pourrait jamais être réussie.`))
    mission.preuves
      .filter((p) => p.type === "question")
      .filter((p) => !mission.questions.some((q) => p.type === "question" && q.id === p.id))
      .forEach((p) => p.type === "question" && diagnostics.push(erreur("question-inconnue", `« ${id} » attend la question « ${p.id} », qui n'est pas définie.`)))
  })

  ;[...contenus.missions.keys()]
    .filter((id) => !ordre.includes(id))
    .forEach((id) => diagnostics.push(avertissement("mission-inutilisee", `La mission « ${id} » n'est dans aucun chapitre de « ${parcoursId} ».`)))

  contenus.catalogue.capacites
    .filter((c) => !acquises.has(c.id))
    .forEach((c) => diagnostics.push(avertissement("capacite-jamais-debloquee", `La capacité « ${c.id} » n'est débloquée par aucune mission de « ${parcoursId} ».`)))

  return diagnostics
}

function expliquerManque(mission: string, cap: string, place: number, sources: { mission: string; place: number }[]) {
  const plusTard = sources.filter((s) => s.place > place).map((s) => s.mission)
  if (plusTard.length) return `« ${mission} » a besoin de « ${cap} », débloquée par « ${plusTard.join(" », « ")} », qui vient après. Déplacez l'une des deux.`
  return `« ${mission} » a besoin de « ${cap} », qu'aucune mission ne débloque avant elle (ni le socle).`
}

const erreur = (code: string, message: string): Diagnostic => ({ niveau: "erreur", code, message })
const avertissement = (code: string, message: string): Diagnostic => ({ niveau: "avertissement", code, message })
