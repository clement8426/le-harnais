// L'atelier : le dossier LeLabo d'un élève, avec sa progression et son journal.
// Ne connaît pas OpenCode : le plugin (index.ts) lui transmet des événements déjà traduits.
//
// LeLabo/
// ├── .labo/
// │   ├── harnais.json       marque le dossier comme atelier, et dit quel parcours suivre
// │   ├── progression.json   missions commencées et réussies, rangées par nom
// │   ├── en-cours.json      la mission en cours
// │   ├── journal.jsonl      tout ce qui s'est passé, une ligne par événement
// │   └── terminal.jsonl     les commandes de l'élève, notées par l'intégration du shell (shell/integration.ps1)
// └── missions/<nom>/fichiers/   copiés au début de chaque mission

import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import {
  capacitesActives,
  chargerContenus,
  commencer,
  droits,
  etats,
  evaluerMission,
  Journal,
  missionValidee,
  numeroter,
  prochaine,
  progressionVide,
  reussir,
  type Contenus,
  type Evenement,
  type Mission,
  type Progression,
  type Systeme,
} from "@le-harnais/moteur"
import type { EtapeUI, EtatUI } from "../../extension/src/contrat"

export const DOSSIER_LABO = ".labo"

export function estUnAtelier(dossier: string) {
  return existsSync(path.join(dossier, DOSSIER_LABO, "harnais.json"))
}

/** Crée un atelier vide : utilisé au premier lancement, et par les tests. */
export function creerAtelier(dossier: string, parcours = "debutant") {
  mkdirSync(path.join(dossier, DOSSIER_LABO), { recursive: true })
  mkdirSync(path.join(dossier, "missions"), { recursive: true })
  const marque = path.join(dossier, DOSSIER_LABO, "harnais.json")
  if (!existsSync(marque)) writeFileSync(marque, JSON.stringify({ parcours }, null, 2))
}

export class Atelier {
  readonly contenus: Contenus

  constructor(
    readonly dossier: string,
    racineContenus: string,
    private readonly systeme?: Systeme,
  ) {
    this.contenus = chargerContenus(racineContenus)
    // Le dossier des missions existe dès le départ : la mission « terminal » demande d'y entrer.
    mkdirSync(path.join(dossier, "missions"), { recursive: true })
    // Les recherches de l'IA (grep, glob) respectent .ignore : le dossier .labo n'encombre pas ses résultats.
    const ignore = path.join(dossier, ".ignore")
    if (!existsSync(ignore)) writeFileSync(ignore, ".labo/\n")
  }

  private chemin(nom: string) {
    return path.join(this.dossier, DOSSIER_LABO, nom)
  }

  private lireJson<T>(nom: string, defaut: T): T {
    try {
      return JSON.parse(readFileSync(this.chemin(nom), "utf8")) as T
    } catch {
      return defaut
    }
  }

  private ecrireJson(nom: string, valeur: unknown) {
    writeFileSync(this.chemin(nom), JSON.stringify(valeur, null, 2))
  }

  get parcoursId() {
    return this.lireJson<{ parcours?: string }>("harnais.json", {}).parcours ?? "debutant"
  }

  get parcours() {
    const p = this.contenus.parcours.get(this.parcoursId)
    if (!p) throw new Error(`Parcours « ${this.parcoursId} » introuvable dans les contenus.`)
    return p
  }

  get progression(): Progression {
    return this.lireJson("progression.json", progressionVide(this.parcoursId))
  }

  get enCours(): Mission | undefined {
    const id = this.lireJson<{ mission?: string }>("en-cours.json", {}).mission
    return id ? this.contenus.missions.get(id) : undefined
  }

  get journal() {
    return Journal.lire(this.chemin("journal.jsonl"))
  }

  /** Les capacités actives, y compris celles que prête la mission en cours. */
  capacites() {
    return capacitesActives(this.progression, this.parcours, this.contenus.missions, this.enCours)
  }

  droits() {
    return droits(this.capacites(), this.contenus.catalogue)
  }

  private ordre() {
    return numeroter(this.parcours, this.contenus.missions, this.systeme)
  }

  commencer(id: string) {
    const mission = this.contenus.missions.get(id)
    if (!mission) throw new Error(`Mission « ${id} » inconnue.`)
    const etat = etats(this.progression, this.ordre().map((e) => e.mission), this.parcours, this.contenus.missions).get(id)
    if (etat === "verrouillee") throw new Error(`La mission « ${mission.titre} » est encore verrouillée.`)
    const fichiers = path.join(mission.dossier, "fichiers")
    const cible = path.join(this.dossier, "missions", id, "fichiers")
    if (existsSync(fichiers) && !existsSync(cible)) cpSync(fichiers, cible, { recursive: true })
    this.ecrireJson("progression.json", commencer(this.progression, id))
    this.ecrireJson("en-cours.json", { mission: id })
  }

  private lus = 0

  /** Marque tout le contenu actuel de .labo/terminal.jsonl comme déjà importé. */
  sauterTerminal() {
    const fichier = this.chemin("terminal.jsonl")
    this.lus = existsSync(fichier) ? statSync(fichier).size : 0
  }

  /**
   * Importe dans le journal les commandes que l'intégration du shell a notées depuis la dernière lecture
   * (.labo/terminal.jsonl, une ligne par commande). Renvoie le nombre de commandes importées.
   */
  importerTerminal() {
    const fichier = this.chemin("terminal.jsonl")
    if (!existsSync(fichier)) return 0
    const contenu = readFileSync(fichier)
    if (contenu.length <= this.lus) return 0
    const nouveau = contenu.subarray(this.lus).toString("utf8")
    // Une ligne pas encore terminée (écriture en cours) attend la prochaine lecture.
    const fin = nouveau.lastIndexOf("\n")
    if (fin < 0) return 0
    this.lus += Buffer.byteLength(nouveau.slice(0, fin + 1), "utf8")
    const commandes = nouveau
      .slice(0, fin)
      .split("\n")
      .flatMap((ligne) => {
        try {
          const c = JSON.parse(ligne.replace(/^﻿/, ""))
          return typeof c.commande === "string" ? [{ quand: String(c.quand ?? new Date().toISOString()), commande: c.commande, ok: c.ok === true }] : []
        } catch {
          return []
        }
      })
    commandes.forEach((c) => this.enregistrer({ quand: c.quand, type: "terminal.commande", commande: c.commande, ok: c.ok }))
    return commandes.length
  }

  /** Ajoute un événement au journal, puis valide la mission en cours si toutes ses preuves sont vertes. */
  enregistrer(evenement: Evenement) {
    Journal.ajouter(this.chemin("journal.jsonl"), evenement)
    return this.validerSiPret()
  }

  private empreinte = ""

  /**
   * Relit les fichiers que surveillent les preuves de la mission en cours : l'élève peut les corriger à la main,
   * sans qu'aucun événement ne passe par OpenCode. Vrai s'ils ont changé depuis le dernier appel (après validation éventuelle).
   */
  verifierFichiers() {
    const chemins = (this.enCours?.preuves ?? []).flatMap((p) => (p.type === "fichier.existe" || p.type === "fichier.contient" ? [p.chemin] : []))
    const empreinte = chemins
      .map((c) => {
        const fichier = path.join(this.dossier, c)
        if (!existsSync(fichier)) return `${c}:absent`
        const infos = statSync(fichier)
        return `${c}:${infos.mtimeMs}:${infos.size}`
      })
      .join("|")
    if (empreinte === this.empreinte) return false
    this.empreinte = empreinte
    this.validerSiPret()
    return true
  }

  /** Vrai si la mission en cours vient d'être réussie. */
  validerSiPret() {
    const mission = this.enCours
    if (!mission || !missionValidee(this.resultats(mission))) return false
    this.ecrireJson("progression.json", reussir(this.progression, mission))
    this.ecrireJson("en-cours.json", {})
    return true
  }

  resultats(mission: Mission) {
    return evaluerMission(mission, {
      journal: this.journal,
      disque: {
        existe: (c) => existsSync(path.join(this.dossier, c)),
        lire: (c) => {
          try {
            return readFileSync(path.join(this.dossier, c), "utf8")
          } catch {
            return undefined
          }
        },
      },
      depuis: this.progression.commencees[mission.id],
    })
  }

  etat(fournisseur?: { id: string; modele: string }): EtatUI {
    const progression = this.progression
    const ordre = this.ordre()
    const enCours = this.enCours
    const etatsMissions = etats(progression, ordre.map((e) => e.mission), this.parcours, this.contenus.missions)
    const etapes = ordre.map((e): EtapeUI => {
      const m = e.mission
      const encours = enCours?.id === m.id
      return {
        numero: e.numero,
        chapitre: e.chapitre,
        id: m.id,
        titre: m.titre,
        resume: m.resume,
        etat: encours ? "en-cours" : (etatsMissions.get(m.id) ?? "verrouillee"),
        ...(m.cours ? { cours: m.cours } : {}),
        indice: m.indice,
        ...(m.page ? { page: m.page } : {}),
        questions: m.questions.map((q) => ({ id: q.id, enonce: q.enonce, choix: q.choix })),
        ...(encours ? { preuves: this.resultats(m).map((r) => ({ ok: r.ok, detail: r.detail })) } : {}),
      }
    })
    const [derniere] = Object.entries(progression.reussies).sort(([, a], [, b]) => b.quand.localeCompare(a.quand))
    const derniereMission = derniere && this.contenus.missions.get(derniere[0])
    const suivante = prochaine(etatsMissions)
    return {
      actif: true,
      dossier: this.dossier,
      parcours: { id: this.parcours.id, titre: this.parcours.titre },
      etapes,
      ...(enCours ? { enCours: enCours.id } : {}),
      ...(suivante ? { prochaine: suivante } : {}),
      capacites: [...this.capacites()].sort(),
      extensions: { allumees: this.droits().extensions, gerees: this.contenus.catalogue.extensionsGerees },
      ...(fournisseur ? { fournisseur } : {}),
      ...(derniere && derniereMission ? { derniereReussite: { id: derniere[0], titre: derniereMission.titre, quand: derniere[1].quand } } : {}),
    }
  }
}
