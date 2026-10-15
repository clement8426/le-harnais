// La synchronisation des extensions : dès qu'une session d'atelier est ouverte, et à chaque changement d'état,
// on allume les extensions débloquées (ou prêtées par la mission en cours) et on éteint les autres.
// Elle tourne dans l'entrée « fenêtre », que le panneau des missions soit ouvert ou non.

import { onCleanup } from "solid-js"
import { createKeyed, type MountedSession } from "../sdk"
import { Contrat, type EtatUI } from "./contrat"

type Principal = () => { status: string; value?: { appliquer(entree: EtatUI["extensions"]): Promise<void> } }

export function synchroniserExtensions(session: () => MountedSession | undefined, principal: Principal) {
  createKeyed(
    () => {
      const s = session()
      const p = principal()
      return s && p.status === "active" && p.value ? { serveur: s.server, dossier: s.directory, appliquer: p.value.appliquer } : undefined
    },
    (cible) => {
      const rpc = cible.serveur.client.rpc(Contrat)
      const options = { location: { directory: cible.dossier } }
      const appliquer = () =>
        rpc
          .etat({}, options)
          .then((etat) => {
            const e = etat as EtatUI
            // Hors d'un atelier, le plugin ne répond pas : on ne touche à rien.
            if (e.actif && e.extensions) return cible.appliquer(e.extensions)
          })
          .catch(() => undefined)
      void appliquer()
      onCleanup(rpc.events.on("change", () => void appliquer()))
    },
    { equals: (a, b) => a.serveur === b.serveur && a.dossier === b.dossier && a.appliquer === b.appliquer },
  )
}
