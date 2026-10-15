import { describe, expect, test } from "bun:test"
import { correspond, decider, droits, type Catalogue } from "../src"

const catalogue: Catalogue = {
  extensionsGerees: ["terminal"],
  capacites: [
    { id: "chat", titre: "", description: "", effets: [] },
    { id: "fichiers.ia.lire", titre: "", description: "", effets: [{ type: "permission", outil: "read", action: "allow" }, { type: "permission", outil: "glob", action: "allow" }] },
    { id: "terminal.ia.demander", titre: "", description: "", effets: [{ type: "permission", outil: "bash", action: "ask" }, { type: "extension", id: "terminal" }] },
    { id: "ocr", titre: "", description: "", effets: [{ type: "outil", id: "ocr" }] },
  ],
  toujours: [
    { type: "permission", outil: "read", motif: "*.env", action: "deny" },
    { type: "permission", outil: "bash", motif: "rm *", action: "deny" },
    { type: "permission", outil: "external_directory", action: "deny" },
  ],
}

describe("droits", () => {
  test("sans capacité, l'IA n'a droit à rien, sauf les règles « toujours »", () => {
    const d = droits(new Set(["chat"]), catalogue)
    expect(d.extensions).toEqual([])
    expect(decider(d.regles, "read", "notes.md")).toBe("deny")
    expect(decider(d.regles, "bash", "ls")).toBe("deny")
  })

  test("chaque capacité ajoute ses effets, et « toujours » gagne à la fin", () => {
    const d = droits(new Set(["chat", "fichiers.ia.lire", "terminal.ia.demander", "ocr"]), catalogue)
    expect(d.extensions).toEqual(["terminal"])
    expect(d.outils).toEqual(["ocr"])
    expect(decider(d.regles, "read", "notes.md")).toBe("allow")
    expect(decider(d.regles, "read", "secrets.env")).toBe("deny")
    expect(decider(d.regles, "bash", "ls -la")).toBe("ask")
    expect(decider(d.regles, "bash", "rm -rf dossier")).toBe("deny")
  })

  test("les règles gardent l'ordre : tout refuser, puis les capacités, puis « toujours »", () => {
    const d = droits(new Set(["chat", "fichiers.ia.lire"]), catalogue)
    expect(d.regles.map((r) => `${r.outil} ${r.motif} ${r.action}`)).toEqual([
      "* * deny",
      "read * allow",
      "glob * allow",
      "read *.env deny",
      "bash rm * deny",
      "external_directory * deny",
    ])
  })

  test("motifs : * et ? comme dans OpenCode, le reste à l'identique", () => {
    expect(correspond("git *", "git status")).toBe(true)
    expect(correspond("git *", "gitk")).toBe(false)
    expect(correspond("note?.md", "notes.md")).toBe(true)
    expect(correspond("a.b", "axb")).toBe(false)
  })
})
