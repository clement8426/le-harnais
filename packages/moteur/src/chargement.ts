// Lit les contenus (catalogue, missions, parcours) depuis le disque et les valide.
// Une erreur de forme arrête tout avec un message en français qui nomme le fichier fautif.

import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { parse } from "yaml"
import type { Action, Capacite, Catalogue, Chapitre, Connecteur, Contenus, Effet, Mission, Parcours, Preuve, Question, Systeme } from "./types"

export class ErreurContenu extends Error {
  constructor(fichier: string, message: string) {
    super(`${fichier} : ${message}`)
    this.name = "ErreurContenu"
  }
}

export function chargerContenus(racine: string): Contenus {
  const catalogue = chargerCatalogue(path.join(racine, "capacites.yaml"))
  const connecteurs = chargerConnecteurs(path.join(racine, "mcp.yaml"))
  const missions = new Map(
    sousDossiers(path.join(racine, "missions")).map((dossier) => {
      const mission = chargerMission(dossier)
      return [mission.id, mission] as const
    }),
  )
  const parcours = new Map(
    fichiersYaml(path.join(racine, "parcours")).map((fichier) => {
      const p = chargerParcours(fichier)
      return [p.id, p] as const
    }),
  )
  return { catalogue, connecteurs, missions, parcours }
}

/** Facultatif : sans mcp.yaml, aucun connecteur. */
export function chargerConnecteurs(fichier: string): Map<string, Connecteur> {
  if (!existsSync(fichier)) return new Map()
  const brut = lireYaml(fichier)
  return new Map(
    tableau(fichier, brut, "connecteurs").map((valeur) => {
      const o = objet(fichier, valeur)
      const c: Connecteur = {
        id: texte(fichier, o, "id"),
        titre: texte(fichier, o, "titre"),
        commande: listeTextes(fichier, o, "commande"),
        codemode: o.codemode === undefined ? true : booleen(fichier, o, "codemode"),
      }
      return [c.id, c] as const
    }),
  )
}

export function chargerCatalogue(fichier: string): Catalogue {
  const brut = lireYaml(fichier)
  const capacites = tableau(fichier, brut, "capacites").map((c, i) => capacite(`${fichier} (capacité ${i + 1})`, c))
  const toujours = tableau(fichier, brut, "toujours", true).map((e) => effet(fichier, e))
  const extensionsGerees = brut.extensions_gerees === undefined ? [] : listeTextes(fichier, brut, "extensions_gerees")
  return { extensionsGerees, capacites, toujours }
}

export function chargerMission(dossier: string): Mission {
  const fichier = path.join(dossier, "mission.yaml")
  const brut = lireYaml(fichier)
  const id = texte(fichier, brut, "id")
  if (id !== path.basename(dossier)) throw new ErreurContenu(fichier, `l'id « ${id} » doit être le nom du dossier (« ${path.basename(dossier)} »)`)
  const coursFichier = path.join(dossier, "cours.md")
  const os = brut.os === undefined ? undefined : tableau(fichier, brut, "os").map((s) => systeme(fichier, s))
  return {
    id,
    titre: texte(fichier, brut, "titre"),
    version: entier(fichier, brut, "version"),
    resume: texte(fichier, brut, "resume"),
    requiert: listeTextes(fichier, brut, "requiert"),
    prete: brut.prete === undefined ? [] : listeTextes(fichier, brut, "prete"),
    debloque: listeTextes(fichier, brut, "debloque"),
    preuves: tableau(fichier, brut, "preuves").map((p) => preuve(fichier, p)),
    questions: tableau(fichier, brut, "questions", true).map((q) => question(fichier, q)),
    indice: texte(fichier, brut, "indice"),
    ...(brut.page === undefined ? {} : { page: texte(fichier, brut, "page") }),
    ...(os ? { os } : {}),
    ...(existsSync(coursFichier) ? { cours: readFileSync(coursFichier, "utf8") } : {}),
    dossier,
  }
}

export function chargerParcours(fichier: string): Parcours {
  const brut = lireYaml(fichier)
  return {
    id: texte(fichier, brut, "id"),
    titre: texte(fichier, brut, "titre"),
    socle: listeTextes(fichier, brut, "socle"),
    chapitres: tableau(fichier, brut, "chapitres").map((c): Chapitre => {
      const o = objet(fichier, c)
      return { id: texte(fichier, o, "id"), titre: texte(fichier, o, "titre"), missions: listeTextes(fichier, o, "missions") }
    }),
  }
}

function capacite(fichier: string, valeur: unknown): Capacite {
  const o = objet(fichier, valeur)
  return {
    id: texte(fichier, o, "id"),
    titre: texte(fichier, o, "titre"),
    description: texte(fichier, o, "description"),
    effets: tableau(fichier, o, "effets", true).map((e) => effet(fichier, e)),
  }
}

const ACTIONS: readonly Action[] = ["allow", "ask", "deny"]

function effet(fichier: string, valeur: unknown): Effet {
  const o = objet(fichier, valeur)
  const type = texte(fichier, o, "type")
  if (type === "extension" || type === "outil" || type === "mcp") return { type, id: texte(fichier, o, "id") }
  if (type === "permission") {
    const action = texte(fichier, o, "action")
    if (!ACTIONS.includes(action as Action)) throw new ErreurContenu(fichier, `action « ${action} » inconnue (allow, ask ou deny)`)
    const motif = o.motif === undefined ? undefined : texte(fichier, o, "motif")
    return { type, outil: texte(fichier, o, "outil"), action: action as Action, ...(motif ? { motif } : {}) }
  }
  throw new ErreurContenu(fichier, `type d'effet « ${type} » inconnu`)
}

function preuve(fichier: string, valeur: unknown): Preuve {
  const o = objet(fichier, valeur)
  const type = texte(fichier, o, "type")
  switch (type) {
    case "ia.reponse":
      return { type, ...(o.fournisseurs === undefined ? {} : { fournisseurs: listeTextes(fichier, o, "fournisseurs") }) }
    case "outil.appel": {
      const args = o.arguments === undefined ? undefined : dictionnaire(fichier, o.arguments)
      return { type, outil: texte(fichier, o, "outil"), ...(args ? { arguments: args } : {}) }
    }
    case "outil.resultat":
      return { type, outil: texte(fichier, o, "outil"), contient: listeTextes(fichier, o, "contient") }
    case "permission.demandee":
      return {
        type,
        ...(o.outil === undefined ? {} : { outil: texte(fichier, o, "outil") }),
        ...(o.acceptee === undefined ? {} : { acceptee: booleen(fichier, o, "acceptee") }),
      }
    case "fichier.existe":
      return { type, chemin: texte(fichier, o, "chemin") }
    case "fichier.contient":
      return { type, chemin: texte(fichier, o, "chemin"), contient: listeTextes(fichier, o, "contient") }
    case "audit.score":
      return { type, categorie: texte(fichier, o, "categorie") }
    case "question":
      return { type, id: texte(fichier, o, "id") }
    case "terminal.commande":
      return { type, motif: motif(fichier, texte(fichier, o, "motif")) }
    case "navigateur.page":
      return { type, motif: motif(fichier, texte(fichier, o, "motif")) }
    default:
      throw new ErreurContenu(fichier, `type de preuve « ${type} » inconnu`)
  }
}

function question(fichier: string, valeur: unknown): Question {
  const o = objet(fichier, valeur)
  const choix = listeTextes(fichier, o, "choix")
  const bonne = entier(fichier, o, "bonne")
  if (bonne < 0 || bonne >= choix.length) throw new ErreurContenu(fichier, `question « ${String(o.id)} » : « bonne » doit désigner un des choix (0 à ${choix.length - 1})`)
  return { id: texte(fichier, o, "id"), enonce: texte(fichier, o, "enonce"), choix, bonne, explication: texte(fichier, o, "explication") }
}

const SYSTEMES: readonly Systeme[] = ["windows", "macos", "linux"]

function systeme(fichier: string, valeur: unknown): Systeme {
  if (typeof valeur === "string" && SYSTEMES.includes(valeur as Systeme)) return valeur as Systeme
  throw new ErreurContenu(fichier, `système « ${String(valeur)} » inconnu (windows, macos ou linux)`)
}

function motif(fichier: string, valeur: string) {
  try {
    new RegExp(valeur, "i")
    return valeur
  } catch {
    throw new ErreurContenu(fichier, `motif « ${valeur} » invalide`)
  }
}

// --- Lecture et petites validations ---

function lireYaml(fichier: string): Record<string, unknown> {
  if (!existsSync(fichier)) throw new ErreurContenu(fichier, "fichier introuvable")
  return objet(fichier, parse(readFileSync(fichier, "utf8")))
}

function sousDossiers(dossier: string) {
  if (!existsSync(dossier)) return []
  return readdirSync(dossier, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dossier, e.name))
    .sort()
}

function fichiersYaml(dossier: string) {
  if (!existsSync(dossier)) return []
  return readdirSync(dossier)
    .filter((nom) => nom.endsWith(".yaml"))
    .map((nom) => path.join(dossier, nom))
    .sort()
}

function objet(fichier: string, valeur: unknown): Record<string, unknown> {
  if (valeur && typeof valeur === "object" && !Array.isArray(valeur)) return valeur as Record<string, unknown>
  throw new ErreurContenu(fichier, "un objet était attendu")
}

function texte(fichier: string, o: Record<string, unknown>, cle: string) {
  const v = o[cle]
  if (typeof v === "string" && v.trim()) return v.trim()
  throw new ErreurContenu(fichier, `le champ « ${cle} » doit être un texte non vide`)
}

function entier(fichier: string, o: Record<string, unknown>, cle: string) {
  const v = o[cle]
  if (typeof v === "number" && Number.isInteger(v)) return v
  throw new ErreurContenu(fichier, `le champ « ${cle} » doit être un nombre entier`)
}

function booleen(fichier: string, o: Record<string, unknown>, cle: string) {
  const v = o[cle]
  if (typeof v === "boolean") return v
  throw new ErreurContenu(fichier, `le champ « ${cle} » doit valoir true ou false`)
}

function tableau(fichier: string, o: Record<string, unknown>, cle: string, facultatif = false): unknown[] {
  const v = o[cle]
  if (v === undefined && facultatif) return []
  if (Array.isArray(v)) return v
  throw new ErreurContenu(fichier, `le champ « ${cle} » doit être une liste`)
}

function listeTextes(fichier: string, o: Record<string, unknown>, cle: string) {
  return tableau(fichier, o, cle).map((v) => {
    if (typeof v === "string" && v.trim()) return v.trim()
    throw new ErreurContenu(fichier, `« ${cle} » ne doit contenir que des textes`)
  })
}

function dictionnaire(fichier: string, valeur: unknown) {
  const o = objet(fichier, valeur)
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      if (typeof v !== "string") throw new ErreurContenu(fichier, `l'argument « ${k} » doit être un texte`)
      return [k, v]
    }),
  )
}
