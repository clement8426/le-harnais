// Écoute les demandes des outils des sens (événement RPC « sens » du plugin), les fait tourner dans cette fenêtre,
// et renvoie le résultat. Une seule fenêtre répond : celle qui affiche une session de l'atelier.

import { onCleanup } from "solid-js"
import { createKeyed, type MountedSession } from "../sdk"
import { Contrat, type DemandeSens } from "./contrat"

export function ecouterLesSens(session: () => MountedSession | undefined, statut: (message: string | undefined) => void) {
  createKeyed(
    () => {
      const s = session()
      return s ? { serveur: s.server, dossier: s.directory } : undefined
    },
    (cible) => {
      const rpc = cible.serveur.client.rpc(Contrat)
      const options = { location: { directory: cible.dossier } }
      const arreter = rpc.events.on("sens", async (evenement) => {
        const demande = evenement.data as unknown as DemandeSens
        statut(MESSAGES[demande.outil])
        try {
          const { executer } = await import("./moteurs")
          const texte = await executer(demande)
          await rpc.resultatSens({ id: demande.id, texte }, options)
        } catch (e) {
          await rpc.resultatSens({ id: demande.id, erreur: e instanceof Error ? e.message : String(e) }, options).catch(() => undefined)
        } finally {
          statut(undefined)
        }
      })
      onCleanup(arreter)
    },
    { equals: (a, b) => a.serveur === b.serveur && a.dossier === b.dossier },
  )
}

const MESSAGES: Record<DemandeSens["outil"], string> = {
  transcrire: "Transcription sur ton ordinateur… La première fois, le modèle Whisper se télécharge (quelques minutes).",
  ocr: "Lecture du document sur ton ordinateur…",
  lire_a_voix_haute: "Lecture à voix haute…",
  detecter_objets: "Détection des objets sur ton ordinateur… La première fois, le modèle se télécharge.",
}
