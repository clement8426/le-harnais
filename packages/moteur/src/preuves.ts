// Les preuves : des fonctions pures du journal et du dossier de l'élève.
// Elles disent « vert » ou « rouge, avec telle explication ». Pas d'effet de bord : faciles à tester et à rejouer.

import type { Evenement, Mission, Preuve } from "./types"

export interface Disque {
  /** Les chemins sont relatifs au dossier de l'élève. */
  existe(chemin: string): boolean
  lire(chemin: string): string | undefined
}

export interface Contexte {
  journal: Evenement[]
  disque: Disque
  /** Seuls les événements à partir de cette date comptent (début de la mission). */
  depuis?: string
}

export interface Resultat {
  preuve: Preuve
  ok: boolean
  /** Ce que l'élève voit sous la preuve : ce qui est attendu, ou ce qui manque. */
  detail: string
}

export function evaluerMission(mission: Mission, contexte: Contexte): Resultat[] {
  const journal = contexte.depuis ? contexte.journal.filter((e) => e.quand >= contexte.depuis!) : contexte.journal
  return mission.preuves.map((preuve) => evaluer(preuve, mission, { ...contexte, journal }))
}

export function missionValidee(resultats: Resultat[]) {
  return resultats.length > 0 && resultats.every((r) => r.ok)
}

function evaluer(preuve: Preuve, mission: Mission, { journal, disque }: Contexte): Resultat {
  const r = (ok: boolean, detail: string): Resultat => ({ preuve, ok, detail })
  const de = <T extends Evenement["type"]>(type: T) => journal.filter((e): e is Extract<Evenement, { type: T }> => e.type === type)

  switch (preuve.type) {
    case "ia.reponse": {
      const reponses = de("ia.reponse")
      if (!reponses.length) return r(false, "Pose une question à ton IA et attends sa réponse.")
      if (!preuve.fournisseurs) return r(true, "Ton IA t'a répondu.")
      return reponses.some((e) => e.fournisseur && preuve.fournisseurs!.includes(e.fournisseur))
        ? r(true, "Ton IA t'a répondu, depuis un fournisseur autorisé pour cette mission.")
        : r(false, `Pour cette mission, ton IA doit passer par : ${preuve.fournisseurs.join(", ")}. Change de modèle, puis recommence.`)
    }

    case "outil.appel": {
      const appels = de("outil.appel").filter((e) => e.outil === preuve.outil && !e.erreur)
      const bons = appels.filter((e) => argumentsCorrespondent(e.arguments, preuve.arguments))
      if (bons.length) return r(true, `L'outil « ${preuve.outil} » a bien été utilisé.`)
      if (appels.length) return r(false, `L'outil « ${preuve.outil} » a été utilisé, mais pas sur le bon élément.`)
      return r(false, `L'outil « ${preuve.outil} » n'a pas encore été utilisé.`)
    }

    case "outil.resultat": {
      const resultats = de("outil.appel").filter((e) => e.outil === preuve.outil && e.resultat !== undefined)
      if (!resultats.length) return r(false, `L'outil « ${preuve.outil} » n'a encore rien produit.`)
      const manque = manquants(resultats.map((e) => e.resultat ?? "").join("\n"), preuve.contient)
      return manque.length ? r(false, `Le résultat ne contient pas encore : ${liste(manque)}.`) : r(true, `Le résultat contient tout ce qui est attendu.`)
    }

    case "permission.demandee": {
      const demandes = de("permission").filter((e) => !preuve.outil || e.outil === preuve.outil)
      const voulues = preuve.acceptee === undefined ? demandes : demandes.filter((e) => e.acceptee === preuve.acceptee)
      if (voulues.length) return r(true, "Ton IA t'a demandé la permission, et tu as répondu.")
      if (demandes.length) return r(false, preuve.acceptee ? "Cette fois, accepte la demande de ton IA." : "Cette fois, refuse la demande de ton IA.")
      return r(false, "Ton IA ne t'a encore rien demandé. Demande-lui d'agir.")
    }

    case "fichier.existe":
      return disque.existe(preuve.chemin) ? r(true, `Le fichier ${preuve.chemin} existe.`) : r(false, `Le fichier ${preuve.chemin} n'existe pas encore.`)

    case "fichier.contient": {
      const contenu = disque.lire(preuve.chemin)
      if (contenu === undefined) return r(false, `Le fichier ${preuve.chemin} n'existe pas encore.`)
      const manque = manquants(contenu, preuve.contient)
      return manque.length ? r(false, `${preuve.chemin} ne contient pas encore : ${liste(manque)}.`) : r(true, `${preuve.chemin} contient tout ce qui est attendu.`)
    }

    case "audit.score": {
      const audit = de("audit").find((e) => e.categorie === preuve.categorie)
      return audit ? r(true, `Audit « ${preuve.categorie} » obtenu : ${audit.score} sur 100.`) : r(false, `Aucun audit « ${preuve.categorie} » pour l'instant.`)
    }

    case "question": {
      const question = mission.questions.find((q) => q.id === preuve.id)
      if (!question) return r(false, `Question « ${preuve.id} » introuvable.`)
      const reponse = de("question").filter((e) => e.id === preuve.id).at(-1)
      if (!reponse) return r(false, question.enonce)
      return reponse.reponse === question.bonne ? r(true, question.explication) : r(false, `Pas tout à fait. ${question.explication}`)
    }

    case "terminal.commande": {
      const motif = new RegExp(preuve.motif, "i")
      const lancees = de("terminal.commande").filter((e) => motif.test(e.commande.trim()))
      if (!lancees.length) return r(false, "La commande n'a pas encore été lancée dans le terminal.")
      if (!preuve.sortie) return r(true, "La commande a été lancée.")
      const sortie = new RegExp(preuve.sortie, "i")
      return lancees.some((e) => sortie.test(e.sortie))
        ? r(true, "La commande a été lancée et a affiché le résultat attendu.")
        : r(false, "La commande a été lancée, mais n'a pas affiché le résultat attendu. Lis le message dans le terminal.")
    }

    case "navigateur.page": {
      const motif = new RegExp(preuve.motif, "i")
      return de("navigateur.page").some((e) => motif.test(e.url))
        ? r(true, "La page a été ouverte dans le navigateur.")
        : r(false, "Ouvre la page demandée dans le navigateur du harnais.")
    }
  }
}

function argumentsCorrespondent(recus: Record<string, unknown>, attendus?: Record<string, string>) {
  if (!attendus) return true
  return Object.entries(attendus).every(([cle, valeur]) => String(recus[cle] ?? "").toLowerCase().includes(valeur.toLowerCase()))
}

/** Comparaison tolérante : sans accents, sans casse, espaces normalisés. */
export function normaliser(texte: string) {
  return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim()
}

function manquants(texte: string, attendus: string[]) {
  const t = normaliser(texte)
  return attendus.filter((a) => !t.includes(normaliser(a)))
}

const liste = (mots: string[]) => mots.map((m) => `« ${m} »`).join(", ")
