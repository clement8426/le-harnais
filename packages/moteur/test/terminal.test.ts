import { describe, expect, test } from "bun:test"
import { extraireCommandes, lireInvite } from "../src/terminal"

describe("lecture du terminal", () => {
  test("PowerShell : commandes terminées et leur sortie", () => {
    const ecran = [
      "Windows PowerShell",
      "Copyright (C) Microsoft Corporation. Tous droits réservés.",
      "",
      "PS C:\\Users\\Clem\\LeLabo> node --version",
      "v24.15.0",
      "PS C:\\Users\\Clem\\LeLabo> cd missions",
      "PS C:\\Users\\Clem\\LeLabo\\missions> ls",
      "",
      "    Répertoire : C:\\Users\\Clem\\LeLabo\\missions",
      "Mode   LastWriteTime   Length Name",
      "d----- 15/10/2026 18:00       terminal",
      "",
      "PS C:\\Users\\Clem\\LeLabo\\missions> ",
    ]
    expect(extraireCommandes(ecran)).toEqual([
      { commande: "node --version", sortie: "v24.15.0" },
      { commande: "cd missions", sortie: "" },
      { commande: "ls", sortie: "Répertoire : C:\\Users\\Clem\\LeLabo\\missions\nMode   LastWriteTime   Length Name\nd----- 15/10/2026 18:00       terminal" },
    ])
  })

  test("la dernière commande n'est lue qu'une fois terminée (nouvelle invite)", () => {
    expect(extraireCommandes(["PS C:\\> node --version"])).toEqual([])
    expect(extraireCommandes(["PS C:\\> node --version", "v24.15.0", "PS C:\\> "])).toHaveLength(1)
  })

  test("une invite vide (Entrée seule) n'est pas une commande", () => {
    expect(extraireCommandes(["PS C:\\> ", "PS C:\\> ", "PS C:\\> pwd", "C:\\", "PS C:\\> "]).map((c) => c.commande)).toEqual(["pwd"])
  })

  test("bash, Git Bash et l'invite de commandes Windows", () => {
    expect(lireInvite("clem@poste:~/LeLabo$ ls -la")).toBe("ls -la")
    expect(lireInvite("$ node --version")).toBe("node --version")
    expect(lireInvite("C:\\Users\\Clem>dir")).toBe("dir")
    expect(lireInvite("v24.15.0")).toBeUndefined()
    expect(lireInvite("Le prix est 5 $ environ")).toBeUndefined()
  })
})
