import { describe, expect, test } from "bun:test"
import { chargerContenus, numeroter, verifier } from "../src"
import { fabriquer } from "./outils"

// Un mini-parcours : chat → terminal → fichiers → ocr (qui a besoin des fichiers).
const missions = {
  "brancher-ia": { requiert: ["chat"], debloque: [] },
  terminal: { requiert: ["chat"], debloque: ["terminal.eleve"] },
  fichiers: { requiert: ["terminal.eleve"], debloque: ["fichiers.ia.lire"] },
  "lire-scan": { requiert: ["fichiers.ia.lire"], debloque: ["ocr"] },
  dicter: { requiert: ["chat"], debloque: ["voix.dicter"] },
}

describe("numérotation", () => {
  test("les numéros se calculent depuis l'ordre, jamais depuis la mission", () => {
    const contenus = chargerContenus(
      fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia", "terminal"], b: ["fichiers", "lire-scan", "dicter"] } } } }),
    )
    const etapes = numeroter(contenus.parcours.get("p")!, contenus.missions)
    expect(etapes.map((e) => `${e.numero}:${e.mission.id}`)).toEqual(["1:brancher-ia", "2:terminal", "3:fichiers", "4:lire-scan", "5:dicter"])
    expect(etapes.map((e) => e.chapitre.numero)).toEqual([1, 1, 2, 2, 2])
  })

  test("déplacer une ligne déplace la mission et renumérote tout le reste", () => {
    const contenus = chargerContenus(
      fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia", "dicter", "terminal"], b: ["fichiers", "lire-scan"] } } } }),
    )
    const etapes = numeroter(contenus.parcours.get("p")!, contenus.missions)
    expect(etapes.find((e) => e.mission.id === "dicter")!.numero).toBe(2)
    expect(etapes.find((e) => e.mission.id === "lire-scan")!.numero).toBe(5)
    expect(verifier(contenus, "p").filter((d) => d.niveau === "erreur")).toEqual([])
  })

  test("une mission réservée à un autre système est retirée de la numérotation", () => {
    const contenus = chargerContenus(
      fabriquer({
        missions: { ...missions, "terminal-mac": { requiert: ["chat"], os: ["macos"] } },
        parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia", "terminal-mac", "terminal"] } } },
      }),
    )
    const surWindows = numeroter(contenus.parcours.get("p")!, contenus.missions, "windows")
    expect(surWindows.map((e) => e.mission.id)).toEqual(["brancher-ia", "terminal"])
  })
})

describe("vérificateur", () => {
  test("un parcours correct ne donne aucune erreur", () => {
    const contenus = chargerContenus(
      fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia", "terminal", "fichiers", "lire-scan", "dicter"] } } } }),
    )
    expect(verifier(contenus, "p")).toEqual([])
  })

  test("refuse une mission placée avant celle qui débloque ce dont elle a besoin, et dit laquelle", () => {
    const contenus = chargerContenus(
      fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia", "lire-scan", "terminal", "fichiers", "dicter"] } } } }),
    )
    const erreurs = verifier(contenus, "p").filter((d) => d.code === "ordre")
    expect(erreurs).toHaveLength(1)
    expect(erreurs[0]!.message).toContain("« lire-scan » a besoin de « fichiers.ia.lire »")
    expect(erreurs[0]!.message).toContain("« fichiers », qui vient après")
  })

  test("signale une mission inconnue, un doublon, une mission inutilisée et une capacité inconnue", () => {
    const racine = fabriquer({
      capacites: [{ id: "chat" }, { id: "terminal.eleve" }],
      missions: { a: { requiert: ["chat"], debloque: ["terminal.eleve"] }, b: { requiert: ["chat"], debloque: ["fantome"] }, seule: {} },
      parcours: { p: { socle: ["chat"], chapitres: { x: ["a", "b", "a", "absente"] } } },
    })
    const codes = verifier(chargerContenus(racine), "p").map((d) => d.code)
    expect(codes).toContain("mission-en-double")
    expect(codes).toContain("mission-inconnue")
    expect(codes).toContain("mission-inutilisee")
    expect(codes).toContain("capacite-inconnue")
  })

  test("une preuve « question » doit renvoyer à une question définie", () => {
    const racine = fabriquer({
      missions: { quiz: { requiert: ["chat"], preuves: [{ type: "question", id: "q1" }] } },
      parcours: { p: { socle: ["chat"], chapitres: { x: ["quiz"] } } },
    })
    expect(verifier(chargerContenus(racine), "p").map((d) => d.code)).toContain("question-inconnue")
  })

  test("un parcours inconnu est une erreur claire", () => {
    const contenus = chargerContenus(fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { a: ["brancher-ia"] } } } }))
    expect(verifier(contenus, "autre")[0]!.code).toBe("parcours-inconnu")
  })
})

describe("chargement", () => {
  test("refuse une mission dont l'id ne correspond pas au dossier", () => {
    const racine = fabriquer({ missions: { a: {} }, parcours: { p: { chapitres: { x: ["a"] } } } })
    const fichier = `${racine}/missions/a/mission.yaml`
    require("node:fs").writeFileSync(fichier, require("node:fs").readFileSync(fichier, "utf8").replace("id: a", "id: b"))
    expect(() => chargerContenus(racine)).toThrow("doit être le nom du dossier")
  })

  test("refuse un type de preuve inconnu", () => {
    const racine = fabriquer({ missions: { a: { preuves: [{ type: "magie" }] } }, parcours: { p: { chapitres: { x: ["a"] } } } })
    expect(() => chargerContenus(racine)).toThrow("type de preuve « magie » inconnu")
  })
})
