// Traduit les capacités actives en droits concrets : extensions à allumer, outils et connecteurs à fournir,
// règles de permission pour l'IA. Les règles suivent la même logique qu'OpenCode (la dernière qui correspond gagne),
// mais restent de simples objets : l'adaptateur du plugin les convertit au format d'OpenCode.

import type { Action, Catalogue, Effet } from "./types"

export interface Regle {
  outil: string
  motif: string
  action: Action
}

export interface Droits {
  extensions: string[]
  outils: string[]
  mcp: string[]
  /** Règles dans l'ordre d'application. */
  regles: Regle[]
}

/**
 * Ordre d'application : tout refusé d'abord, puis chaque capacité active dans l'ordre du catalogue,
 * puis les règles « toujours », qui gagnent sur tout le reste.
 */
export function droits(actives: Set<string>, catalogue: Catalogue): Droits {
  const effets: Effet[] = [
    { type: "permission", outil: "*", action: "deny" },
    ...catalogue.capacites.filter((c) => actives.has(c.id)).flatMap((c) => c.effets),
    ...catalogue.toujours,
  ]
  const ids = (type: "extension" | "outil" | "mcp") => [...new Set(effets.flatMap((e) => (e.type === type ? [e.id] : [])))]
  return {
    extensions: ids("extension"),
    outils: ids("outil"),
    mcp: ids("mcp"),
    // Un outil fourni par une capacité est aussi autorisé : sans cela, la règle de base « tout refuser » l'interdirait.
    regles: effets.flatMap((e): Regle[] => {
      if (e.type === "permission") return [{ outil: e.outil, motif: e.motif ?? "*", action: e.action }]
      if (e.type === "outil") return [{ outil: e.id, motif: "*", action: "allow" }]
      return []
    }),
  }
}

/** Ce que l'IA a le droit de faire pour un appel donné, en appliquant les règles comme OpenCode. */
export function decider(regles: Regle[], outil: string, cible: string): Action {
  return regles.reduce<Action>((action, r) => (correspond(r.outil, outil) && correspond(r.motif, cible) ? r.action : action), "deny")
}

/** Motifs d'OpenCode : `*` = n'importe quoi, `?` = un caractère, le reste à l'identique. */
export function correspond(motif: string, valeur: string) {
  const re = motif.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")
  return new RegExp(`^${re}$`, "s").test(valeur)
}
