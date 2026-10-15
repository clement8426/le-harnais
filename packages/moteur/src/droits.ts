// Traduit les capacités actives en droits concrets : extensions à allumer, outils et connecteurs à fournir,
// règles de permission pour l'IA. Le format des règles est celui d'OpenCode (la dernière règle qui correspond gagne),
// mais le moteur ne dépend pas d'OpenCode : c'est un simple objet.

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
    regles: effets.flatMap((e) => (e.type === "permission" ? [{ outil: e.outil, motif: e.motif ?? "*", action: e.action }] : [])),
  }
}

export type PermissionOpenCode = Record<string, Action | Record<string, Action>>

/**
 * Le bloc `permission` d'opencode.json. Une règle redéfinie plus tard est déplacée en fin de liste,
 * pour que « la dernière qui correspond gagne » reste vrai.
 */
export function versPermissionOpenCode(regles: Regle[]): PermissionOpenCode {
  const parOutil = new Map<string, Map<string, Action>>()
  regles.forEach(({ outil, motif, action }) => {
    const motifs = parOutil.get(outil) ?? new Map<string, Action>()
    motifs.delete(motif)
    motifs.set(motif, action)
    parOutil.delete(outil)
    parOutil.set(outil, motifs)
  })
  // L'entrée globale « * » en premier : les règles par outil, plus précises, viennent après.
  const global = parOutil.get("*")
  parOutil.delete("*")
  return {
    ...(global ? { "*": global.get("*") ?? "deny" } : {}),
    ...Object.fromEntries(
      [...parOutil].map(([outil, motifs]) => [outil, motifs.size === 1 && motifs.has("*") ? motifs.get("*")! : Object.fromEntries(motifs)]),
    ),
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
