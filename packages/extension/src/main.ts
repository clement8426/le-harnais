// L'entrée « processus principal » de l'extension : allume et éteint les extensions d'OpenCode selon les capacités.
// Elle passe par `ctx.leHarnais`, que le patch 03 ajoute au contexte de cette seule extension.

import { appendFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import type { MainSetup } from "../sdk/main"
import { Harnais } from "./ipc"
import type definition from "./index"

interface Gestionnaire {
  enabled(id: string): boolean
  enable(id: string): Promise<void>
  disable(id: string): Promise<void>
}

// Avec LE_HARNAIS_TRACE, chaque bascule est notée dans le dossier temporaire (le-harnais-principal.log).
const trace = (message: string) => {
  if (process.env.LE_HARNAIS_TRACE) appendFileSync(path.join(tmpdir(), "le-harnais-principal.log"), `${new Date().toISOString()} ${message}\n`)
}

const setup: MainSetup<typeof definition> = (ctx) => {
  const gestionnaire = (ctx as unknown as { leHarnais?: Gestionnaire }).leHarnais
  trace(`démarrage, gestionnaire ${gestionnaire ? "présent" : "absent (patch 03 manquant)"}`)
  // Une seule application à la fois : deux états rapprochés ne s'entremêlent pas.
  let file = Promise.resolve()

  ctx.provide(Harnais, {
    appliquer: (entree) => {
      file = file.then(async () => {
        if (!gestionnaire) return
        for (const id of entree.gerees) {
          if (id === "le-labo") continue
          const voulu = entree.allumees.includes(id)
          const actuel = gestionnaire.enabled(id)
          if (actuel === voulu) continue
          trace(`${id} : ${actuel ? "allumée" : "éteinte"} → ${voulu ? "allumée" : "éteinte"}`)
          await (voulu ? gestionnaire.enable(id) : gestionnaire.disable(id)).catch((cause: unknown) => trace(`${id} : échec ${String(cause)}`))
        }
      })
      return file
    },
  })
}

export default setup
