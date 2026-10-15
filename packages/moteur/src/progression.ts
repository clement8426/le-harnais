// La progression de l'élève. On ne stocke que des faits (missions commencées, réussies) ;
// tout le reste (capacités actives, état de chaque mission) se recalcule.
// Conséquence voulue : on peut réordonner le parcours ou en insérer une mission sans rien perdre ni reverrouiller.

import type { Mission, Parcours, Progression } from "./types"

export type Etat =
  /** Réussie : l'outil reste ouvert pour toujours. */
  | "reussie"
  /** La prochaine mission à faire. */
  | "ouverte"
  /** Une mission ajoutée ou déplacée avant d'autres déjà réussies : facultative, ouverte. */
  | "nouvelle"
  /** Réussie dans une version plus ancienne : elle reste réussie, son contenu a changé. */
  | "mise-a-jour"
  | "verrouillee"

export function progressionVide(parcours: string): Progression {
  return { version: 1, parcours, reussies: {}, commencees: {} }
}

/** Le socle, plus tout ce que débloquent les missions réussies (même si elles ont quitté le parcours). */
export function capacitesActives(progression: Progression, parcours: Parcours, missions: Map<string, Mission>) {
  return new Set([...parcours.socle, ...Object.keys(progression.reussies).flatMap((id) => missions.get(id)?.debloque ?? [])])
}

/** L'état de chaque mission du parcours, dans l'ordre. */
export function etats(progression: Progression, ordre: Mission[], parcours: Parcours, missions: Map<string, Mission>) {
  const actives = capacitesActives(progression, parcours, missions)
  const reussie = (m: Mission) => m.id in progression.reussies
  // La plus lointaine mission déjà réussie : tout ce qui est avant elle a déjà été « atteint ».
  const derniere = ordre.reduce((max, m, i) => (reussie(m) ? i : max), -1)

  return new Map(
    ordre.map((m, i): [string, Etat] => {
      if (reussie(m)) return [m.id, (progression.reussies[m.id]?.version ?? m.version) < m.version ? "mise-a-jour" : "reussie"]
      if (!m.requiert.every((cap) => actives.has(cap))) return [m.id, "verrouillee"]
      if (i < derniere) return [m.id, "nouvelle"]
      if (i === derniere + 1) return [m.id, "ouverte"]
      return [m.id, "verrouillee"]
    }),
  )
}

/** La mission à proposer en premier : la première ouverte, sinon la première nouvelle. */
export function prochaine(etatsMissions: Map<string, Etat>) {
  const liste = [...etatsMissions]
  return (liste.find(([, e]) => e === "ouverte") ?? liste.find(([, e]) => e === "nouvelle"))?.[0]
}

export function commencer(progression: Progression, mission: string, quand = new Date().toISOString()): Progression {
  if (progression.commencees[mission]) return progression
  return { ...progression, commencees: { ...progression.commencees, [mission]: quand } }
}

export function reussir(progression: Progression, mission: Mission, quand = new Date().toISOString()): Progression {
  return { ...progression, reussies: { ...progression.reussies, [mission.id]: { version: mission.version, quand } } }
}
