import { describe, expect, test } from "bun:test"
import { capacitesActives, chargerContenus, etats, numeroter, prochaine, progressionVide, reussir, type Contenus } from "../src"
import { fabriquer } from "./outils"

const missions = {
  a: { requiert: ["chat"], debloque: ["terminal.eleve"] },
  b: { requiert: ["terminal.eleve"], debloque: ["fichiers"] },
  c: { requiert: ["fichiers"], debloque: ["ocr"] },
  nouvelle: { requiert: ["chat"], debloque: ["voix"] },
}

function etatsPour(contenus: Contenus, reussies: string[]) {
  const parcours = contenus.parcours.get("p")!
  const ordre = numeroter(parcours, contenus.missions).map((e) => e.mission)
  const progression = reussies.reduce((p, id) => reussir(p, contenus.missions.get(id)!, "2026-10-15T10:00:00Z"), progressionVide("p"))
  return { progression, etats: etats(progression, ordre, parcours, contenus.missions) }
}

describe("progression", () => {
  const contenus = chargerContenus(fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { x: ["a", "b", "c"] } } } }))

  test("au départ, seule la première mission est ouverte", () => {
    expect([...etatsPour(contenus, []).etats]).toEqual([["a", "ouverte"], ["b", "verrouillee"], ["c", "verrouillee"]])
  })

  test("réussir une mission ouvre la suivante et ajoute ses capacités", () => {
    const { etats: e, progression } = etatsPour(contenus, ["a"])
    expect([...e]).toEqual([["a", "reussie"], ["b", "ouverte"], ["c", "verrouillee"]])
    expect([...capacitesActives(progression, contenus.parcours.get("p")!, contenus.missions)].sort()).toEqual(["chat", "terminal.eleve"])
  })

  test("une mission prête ses capacités le temps de la faire, sans les donner", () => {
    const pret = chargerContenus(
      fabriquer({
        missions: { terminal: { requiert: ["chat"], prete: ["terminal.eleve"], debloque: ["terminal.eleve"] } },
        parcours: { p: { socle: ["chat"], chapitres: { x: ["terminal"] } } },
      }),
    )
    const parcours = pret.parcours.get("p")!
    const terminal = pret.missions.get("terminal")!
    expect(capacitesActives(progressionVide("p"), parcours, pret.missions).has("terminal.eleve")).toBe(false)
    expect(capacitesActives(progressionVide("p"), parcours, pret.missions, terminal).has("terminal.eleve")).toBe(true)
  })

  test("insérer une mission avant celles déjà réussies : elle est « nouvelle », rien n'est reverrouillé", () => {
    const apres = chargerContenus(fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { x: ["a", "nouvelle", "b", "c"] } } } }))
    const { etats: e } = etatsPour(apres, ["a", "b"])
    expect([...e]).toEqual([["a", "reussie"], ["nouvelle", "nouvelle"], ["b", "reussie"], ["c", "ouverte"]])
    expect(prochaine(e)).toBe("c")
  })

  test("réordonner le parcours ne fait perdre aucune réussite", () => {
    const reordonne = chargerContenus(fabriquer({ missions, parcours: { p: { socle: ["chat"], chapitres: { y: ["nouvelle"], x: ["a", "b", "c"] } } } }))
    const { etats: e } = etatsPour(reordonne, ["a", "b"])
    expect(e.get("a")).toBe("reussie")
    expect(e.get("b")).toBe("reussie")
    expect(e.get("nouvelle")).toBe("nouvelle")
  })

  test("une mission passée en version 2 reste réussie, marquée « mise à jour »", () => {
    const v2 = chargerContenus(fabriquer({ missions: { ...missions, a: { ...missions.a, version: 2 } }, parcours: { p: { socle: ["chat"], chapitres: { x: ["a", "b", "c"] } } } }))
    const parcours = v2.parcours.get("p")!
    const ordre = numeroter(parcours, v2.missions).map((m) => m.mission)
    const ancienne = { version: 1 as const, parcours: "p", reussies: { a: { version: 1, quand: "2026-10-01T00:00:00Z" } }, commencees: {} }
    expect(etats(ancienne, ordre, parcours, v2.missions).get("a")).toBe("mise-a-jour")
  })
})
