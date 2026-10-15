import { describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pagesCitees, rapportsLighthouse } from "../src/detection"

describe("rapports Lighthouse enregistrés par le navigateur", () => {
  test("lus une seule fois, et seulement les récents ; un score absent est ignoré", () => {
    const temp = mkdtempSync(path.join(tmpdir(), "faux-temp-"))
    const dossier = path.join(temp, "opencode-browser-abc123", "0")
    mkdirSync(dossier, { recursive: true })
    writeFileSync(
      path.join(dossier, "lighthouse.json"),
      JSON.stringify({ categories: { accessibility: { id: "accessibility", score: 0.74 }, seo: { id: "seo", score: null } } }),
    )
    const lus = new Set<string>()
    expect(rapportsLighthouse(temp, Date.now() + 60_000, lus)).toEqual([]) // trop ancien
    expect(rapportsLighthouse(temp, 0, lus)).toEqual([{ categorie: "accessibility", score: 74 }])
    expect(rapportsLighthouse(temp, 0, lus)).toEqual([]) // déjà lu
  })
})

describe("pages citées dans un résultat d'outil", () => {
  test("adresses sans doublon, sans la ponctuation qui les suit", () => {
    const resultat = 'Onglet ouvert : file:///C:/LeLabo/tilleul/index.html, puis "https://exemple.ch/page" et file:///C:/LeLabo/tilleul/index.html'
    expect(pagesCitees(resultat)).toEqual(["file:///C:/LeLabo/tilleul/index.html", "https://exemple.ch/page"])
  })

  test("dans du JSON imbriqué", () => {
    const interne = JSON.stringify({ url: "file:///C:/LeLabo/tilleul/page-piegee.html" })
    expect(pagesCitees(JSON.stringify([{ type: "text", text: interne }]))).toEqual(["file:///C:/LeLabo/tilleul/page-piegee.html"])
  })

  test("rien dans un résultat ordinaire", () => {
    expect(pagesCitees("Read file notes.md, lines 1-1")).toEqual([])
  })
})
