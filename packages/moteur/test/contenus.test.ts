// Les vrais contenus du dépôt : ils doivent toujours passer le vérificateur, sans erreur ni avertissement.

import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import path from "node:path"
import { chargerContenus, numeroter, verifier } from "../src"

const racine = path.join(import.meta.dir, "../../../contenus")
const contenus = chargerContenus(racine)

describe("contenus du dépôt", () => {
  test("chaque parcours passe le vérificateur sans rien signaler", () => {
    ;[...contenus.parcours.keys()].forEach((id) => expect(verifier(contenus, id)).toEqual([]))
  })

  test("chaque mission a un cours", () => {
    ;[...contenus.missions.values()].forEach((m) => expect(m.cours, `missions/${m.id}/cours.md`).toBeTruthy())
  })

  test("chaque fichier cité par une preuve « fichier » de départ existe dans la mission (sinon c'est à l'élève de le créer)", () => {
    const fournis = [...contenus.missions.values()].flatMap((m) =>
      m.preuves.flatMap((p) => (p.type === "outil.appel" && p.arguments?.fichier ? [{ m, fichier: p.arguments.fichier }] : [])),
    )
    fournis
      .filter(({ m }) => m.id !== "voir-image")
      .forEach(({ m, fichier }) => {
        const present = [m.dossier, ...[...contenus.missions.values()].map((x) => x.dossier)].some((d) => existsSync(path.join(d, "fichiers", fichier)))
        expect(present, `${m.id} : ${fichier}`).toBe(true)
      })
  })

  test("le parcours débutant compte 15 missions en 6 chapitres", () => {
    const etapes = numeroter(contenus.parcours.get("debutant")!, contenus.missions)
    expect(etapes).toHaveLength(15)
    expect(new Set(etapes.map((e) => e.chapitre.id)).size).toBe(6)
  })
})
