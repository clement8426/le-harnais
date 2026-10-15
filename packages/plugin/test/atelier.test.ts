import { describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { decider } from "@le-harnais/moteur"
import { Atelier, creerAtelier, estUnAtelier } from "../src/atelier"
import { consignesDuProf } from "../src/prof"

const contenus = path.join(import.meta.dir, "../../../contenus")
const t = (s: number) => new Date(Date.UTC(2026, 9, 15, 10, 0, s)).toISOString()

function nouvelAtelier() {
  const dossier = mkdtempSync(path.join(tmpdir(), "lelabo-"))
  creerAtelier(dossier)
  return new Atelier(dossier, contenus, "windows")
}

describe("atelier", () => {
  test("un dossier n'est un atelier qu'avec .labo/harnais.json", () => {
    const vide = mkdtempSync(path.join(tmpdir(), "autre-"))
    expect(estUnAtelier(vide)).toBe(false)
    creerAtelier(vide)
    expect(estUnAtelier(vide)).toBe(true)
  })

  test("un élève fait les trois premières missions, et l'IA gagne ses droits au bon moment", async () => {
    const a = nouvelAtelier()
    expect(a.etat().prochaine).toBe("brancher-ia")

    a.commencer("brancher-ia")
    expect(a.enregistrer({ quand: new Date().toISOString(), type: "ia.reponse", fournisseur: "opencode" })).toBe(true)

    a.commencer("harnais-c-est-quoi")
    a.enregistrer({ quand: new Date().toISOString(), type: "question", id: "cerveau", reponse: 0 })
    expect(a.enregistrer({ quand: new Date().toISOString(), type: "question", id: "pdf", reponse: 1 })).toBe(true)

    // Pendant la mission « terminal », le terminal est prêté ; l'IA n'a toujours aucun droit de lecture.
    a.commencer("terminal")
    expect(a.capacites().has("terminal.eleve")).toBe(true)
    expect(decider(a.droits().regles, "read", "notes.md")).toBe("deny")
    expect(a.droits().extensions).toEqual(["terminal"])
    expect(existsSync(path.join(a.dossier, "missions/terminal"))).toBe(false) // pas de fichiers fournis pour cette mission

    const etat = a.etat()
    expect(etat.enCours).toBe("terminal")
    expect(etat.etapes.find((e) => e.id === "terminal")!.preuves!.every((p) => !p.ok)).toBe(true)

    a.enregistrer({ quand: new Date().toISOString(), type: "terminal.commande", commande: "node --version", sortie: "v24.15.0" })
    a.enregistrer({ quand: new Date().toISOString(), type: "terminal.commande", commande: "cd missions", sortie: "" })
    expect(a.enregistrer({ quand: new Date().toISOString(), type: "terminal.commande", commande: "ls", sortie: "terminal" })).toBe(true)

    const apres = a.etat()
    expect(apres.annonce).toBe("Mission réussie : Le terminal.")
    expect(apres.etapes.find((e) => e.id === "terminal")!.etat).toBe("reussie")
    expect(apres.prochaine).toBe("fichiers")
    expect(a.capacites().has("terminal.eleve")).toBe(true)
  })

  test("commencer une mission copie ses fichiers dans le dossier de l'élève, une seule fois", () => {
    const a = nouvelAtelier()
    ;["brancher-ia", "harnais-c-est-quoi", "terminal", "fichiers", "ia-et-terminal"].forEach((id) =>
      a["ecrireJson"]("progression.json", { ...a.progression, reussies: { ...a.progression.reussies, [id]: { version: 1, quand: t(0) } } }),
    )
    a.commencer("dicter")
    const wav = path.join(a.dossier, "missions/dicter/fichiers/note-vocale.wav")
    expect(existsSync(wav)).toBe(true)
    writeFileSync(wav, "modifié par l'élève")
    a.commencer("dicter")
    expect(require("node:fs").readFileSync(wav, "utf8")).toBe("modifié par l'élève")
  })

  test("une mission verrouillée ne peut pas être commencée", () => {
    expect(() => nouvelAtelier().commencer("defi-dossier-exemple")).toThrow("encore verrouillée")
  })

  test("les consignes du prof décrivent la mission en cours et ses preuves", () => {
    const a = nouvelAtelier()
    expect(consignesDuProf(a)).toContain("Aucune mission n'est en cours")
    a.commencer("brancher-ia")
    const consignes = consignesDuProf(a)
    expect(consignes).toContain("Mission en cours : « Brancher ton IA »")
    expect(consignes).toContain("[rouge]")
    expect(consignes).toContain("Discuter")
  })
})
