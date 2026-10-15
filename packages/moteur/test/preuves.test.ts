import { describe, expect, test } from "bun:test"
import { evaluerMission, missionValidee, type Evenement, type Mission } from "../src"

const disqueVide = { existe: () => false, lire: () => undefined }
const disque = (fichiers: Record<string, string>) => ({ existe: (c: string) => c in fichiers, lire: (c: string) => fichiers[c] })

function mission(preuves: Mission["preuves"], questions: Mission["questions"] = []): Mission {
  return { id: "m", titre: "M", version: 1, resume: "", requiert: [], debloque: [], preuves, questions, indice: "", dossier: "" }
}

const t = (minute: number) => `2026-10-15T10:${String(minute).padStart(2, "0")}:00Z`

describe("preuves", () => {
  test("terminal.commande : il faut la commande ET la sortie attendue", () => {
    const m = mission([{ type: "terminal.commande", motif: "^node --version$", sortie: "v\\d+\\." }])
    const rate: Evenement[] = [{ quand: t(1), type: "terminal.commande", commande: "node --versoin", sortie: "" }]
    const echoue: Evenement[] = [{ quand: t(1), type: "terminal.commande", commande: "node --version", sortie: "node : Le terme « node » n'est pas reconnu" }]
    const reussi: Evenement[] = [{ quand: t(2), type: "terminal.commande", commande: " node --version ", sortie: "v24.15.0" }]
    expect(evaluerMission(m, { journal: rate, disque: disqueVide })[0]!.ok).toBe(false)
    expect(evaluerMission(m, { journal: echoue, disque: disqueVide })[0]!.detail).toContain("n'a pas affiché le résultat attendu")
    expect(missionValidee(evaluerMission(m, { journal: reussi, disque: disqueVide }))).toBe(true)
  })

  test("seuls les événements depuis le début de la mission comptent", () => {
    const m = mission([{ type: "ia.reponse" }])
    const journal: Evenement[] = [{ quand: t(1), type: "ia.reponse" }]
    expect(evaluerMission(m, { journal, disque: disqueVide, depuis: t(5) })[0]!.ok).toBe(false)
    expect(evaluerMission(m, { journal, disque: disqueVide, depuis: t(0) })[0]!.ok).toBe(true)
  })

  test("outil.appel vérifie aussi les arguments, sans tenir compte de la casse", () => {
    const m = mission([{ type: "outil.appel", outil: "transcrire", arguments: { fichier: "note-vocale.wav" } }])
    const autre: Evenement[] = [{ quand: t(1), type: "outil.appel", outil: "transcrire", arguments: { fichier: "autre.wav" } }]
    const bon: Evenement[] = [{ quand: t(1), type: "outil.appel", outil: "transcrire", arguments: { fichier: "C:/LeLabo/Note-Vocale.WAV" } }]
    expect(evaluerMission(m, { journal: autre, disque: disqueVide })[0]!.detail).toContain("pas sur le bon élément")
    expect(evaluerMission(m, { journal: bon, disque: disqueVide })[0]!.ok).toBe(true)
  })

  test("un appel d'outil en erreur ne compte pas", () => {
    const m = mission([{ type: "outil.appel", outil: "ocr" }])
    const journal: Evenement[] = [{ quand: t(1), type: "outil.appel", outil: "ocr", arguments: {}, erreur: "fichier illisible" }]
    expect(evaluerMission(m, { journal, disque: disqueVide })[0]!.ok).toBe(false)
  })

  test("outil.resultat et fichier.contient ignorent accents et majuscules, et listent ce qui manque", () => {
    const m = mission([
      { type: "outil.resultat", outil: "transcrire", contient: ["poignet gauche", "12 août"] },
      { type: "fichier.contient", chemin: "compte-rendu.md", contient: ["Morteau"] },
    ])
    const journal: Evenement[] = [{ quand: t(1), type: "outil.appel", outil: "transcrire", arguments: {}, resultat: "fracture du Poignet Gauche le 12 aout" }]
    const resultats = evaluerMission(m, { journal, disque: disque({ "compte-rendu.md": "Client de Lyon" }) })
    expect(resultats[0]!.ok).toBe(true)
    expect(resultats[1]!.detail).toContain("« Morteau »")
  })

  test("question : la dernière réponse compte, et l'explication est donnée", () => {
    const m = mission([{ type: "question", id: "q1" }], [{ id: "q1", enonce: "Qui réfléchit ?", choix: ["le modèle", "un outil"], bonne: 0, explication: "Le modèle est le cerveau." }])
    const faux: Evenement[] = [{ quand: t(1), type: "question", id: "q1", reponse: 1 }]
    const corrige: Evenement[] = [...faux, { quand: t(2), type: "question", id: "q1", reponse: 0 }]
    expect(evaluerMission(m, { journal: [], disque: disqueVide })[0]!.detail).toBe("Qui réfléchit ?")
    expect(evaluerMission(m, { journal: faux, disque: disqueVide })[0]!.detail).toStartWith("Pas tout à fait.")
    expect(evaluerMission(m, { journal: corrige, disque: disqueVide })[0]!.ok).toBe(true)
  })

  test("permission.demandee peut exiger une acceptation", () => {
    const m = mission([{ type: "permission.demandee", outil: "bash", acceptee: true }])
    const refus: Evenement[] = [{ quand: t(1), type: "permission", outil: "bash", acceptee: false }]
    expect(evaluerMission(m, { journal: refus, disque: disqueVide })[0]!.detail).toContain("accepte")
    expect(evaluerMission(m, { journal: [...refus, { quand: t(2), type: "permission", outil: "bash", acceptee: true }], disque: disqueVide })[0]!.ok).toBe(true)
  })

  test("une mission sans preuve n'est jamais validée", () => {
    expect(missionValidee(evaluerMission(mission([]), { journal: [], disque: disqueVide }))).toBe(false)
  })
})
