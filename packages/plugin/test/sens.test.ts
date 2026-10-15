import { describe, expect, test } from "bun:test"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import type { DemandeSens } from "../../extension/src/contrat"
import { OUTILS_SENS, Sens } from "../src/sens"

function atelier() {
  const dossier = mkdtempSync(path.join(tmpdir(), "lelabo-sens-"))
  writeFileSync(path.join(dossier, "note.wav"), "RIFF-faux-son")
  return dossier
}

describe("outils des sens", () => {
  test("les quatre outils sont décrits, en français, avec un schéma d'entrée", () => {
    expect(Object.keys(OUTILS_SENS).sort()).toEqual(["detecter_objets", "lire_a_voix_haute", "ocr", "transcrire"])
    Object.values(OUTILS_SENS).forEach((o) => expect(o.input.type).toBe("object"))
  })

  test("la demande transporte le fichier de l'atelier, et la réponse de la fenêtre revient à l'outil", async () => {
    const envoyees: DemandeSens[] = []
    const sens = new Sens(atelier(), async (d) => void envoyees.push(d))
    const demande = sens.preparer("transcrire", { fichier: "note.wav", langue: "fr" })
    expect(demande.nom).toBe("note.wav")
    expect(Buffer.from(demande.donnees!, "base64").toString()).toBe("RIFF-faux-son")
    const resultat = sens.executer(demande)
    await Bun.sleep(0)
    expect(envoyees).toHaveLength(1)
    expect(sens.repondre({ id: "inconnu", texte: "?" })).toBe(false)
    expect(sens.repondre({ id: demande.id, texte: "poignet gauche, 12 août" })).toBe(true)
    expect(await resultat).toBe("poignet gauche, 12 août")
  })

  test("une erreur de la fenêtre devient une erreur de l'outil", async () => {
    const sens = new Sens(atelier(), async () => {})
    const demande = sens.preparer("lire_a_voix_haute", { texte: "Bonjour" })
    const resultat = sens.executer(demande)
    await Bun.sleep(0)
    sens.repondre({ id: demande.id, erreur: "Aucune voix française sur cet ordinateur." })
    await expect(resultat).rejects.toThrow("Aucune voix française")
  })

  test("un fichier hors de l'atelier, ou absent, est refusé", () => {
    const sens = new Sens(atelier(), async () => {})
    expect(() => sens.preparer("ocr", { fichier: "../../Windows/win.ini" })).toThrow("hors du dossier")
    expect(() => sens.preparer("ocr", { fichier: "absent.pdf" })).toThrow("introuvable")
  })
})
