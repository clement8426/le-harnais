// Les outils des sens (voix, lecture de documents, image) : déclarés ici pour l'IA, exécutés dans la fenêtre du harnais.
// Le plugin lit le fichier dans l'atelier (jamais ailleurs), l'envoie à la fenêtre par un événement RPC, et attend
// sa réponse. Les modèles tournent dans la fenêtre, sur l'ordinateur de l'élève : rien ne part sur internet.

import { randomUUID } from "node:crypto"
import { readFileSync, statSync } from "node:fs"
import path from "node:path"
import type { DemandeSens, OutilSens, ReponseSens } from "../../extension/src/contrat"

const fichier = { type: "string", description: "Chemin du fichier, relatif au dossier de l'élève (LeLabo)" }

export const OUTILS_SENS: Record<OutilSens, { description: string; input: Record<string, unknown> }> = {
  transcrire: {
    description:
      "Transcrit un fichier audio (WAV, MP3, OGG) en texte avec Whisper, sur l'ordinateur de l'élève. Le son ne quitte jamais l'ordinateur. La première fois, le modèle se télécharge (quelques minutes).",
    input: {
      type: "object",
      properties: { fichier, langue: { type: "string", enum: ["fr", "de", "en"], description: "Langue parlée (fr par défaut)" } },
      required: ["fichier"],
    },
  },
  ocr: {
    description:
      "Extrait le texte d'un PDF scanné ou d'une image (reconnaissance de texte, Tesseract), sur l'ordinateur de l'élève. Le document ne quitte jamais l'ordinateur. Le texte peut contenir des erreurs : fais-le relire.",
    input: {
      type: "object",
      properties: { fichier, langue: { type: "string", enum: ["fr", "de", "en"], description: "Langue du document (fr par défaut)" } },
      required: ["fichier"],
    },
  },
  lire_a_voix_haute: {
    description: "Lit un texte à voix haute, avec la voix de l'ordinateur de l'élève. Garde les textes courts : moins d'une minute.",
    input: { type: "object", properties: { texte: { type: "string", description: "Le texte à lire" } }, required: ["texte"] },
  },
  detecter_objets: {
    description:
      "Détecte les objets d'une image (JPG, PNG) avec un modèle de détection, sur l'ordinateur de l'élève. Renvoie la liste des objets et leur confiance ; l'image ne quitte jamais l'ordinateur.",
    input: {
      type: "object",
      properties: { fichier, seuil: { type: "number", minimum: 0.05, maximum: 0.99, description: "Confiance minimale, de 0 à 1 (0,9 par défaut)" } },
      required: ["fichier"],
    },
  },
}

const TAILLE_MAX = 25 * 1024 * 1024
const ATTENTE_MAX = 15 * 60 * 1000 // un premier téléchargement de modèle peut être long

/** Les demandes en cours, en attente de la réponse de la fenêtre. */
export class Sens {
  private attentes = new Map<string, { resoudre: (r: ReponseSens) => void }>()

  constructor(
    private readonly atelier: string,
    private readonly envoyer: (demande: DemandeSens) => Promise<void>,
  ) {}

  /** Construit la demande à partir de l'entrée de l'outil. Un chemin hors de l'atelier est refusé. */
  preparer(outil: OutilSens, entree: Record<string, unknown>): DemandeSens {
    const id = randomUUID()
    if (outil === "lire_a_voix_haute") return { id, outil, texte: String(entree.texte ?? "").slice(0, 5000) }
    const relatif = String(entree.fichier ?? "")
    const absolu = path.resolve(this.atelier, relatif)
    if (!absolu.startsWith(path.resolve(this.atelier) + path.sep)) throw new Error("Ce fichier est hors du dossier de l'élève : refusé.")
    if (statSync(absolu, { throwIfNoEntry: false })?.isFile() !== true) throw new Error(`Fichier introuvable : ${relatif}`)
    if (statSync(absolu).size > TAILLE_MAX) throw new Error("Fichier trop lourd (25 Mo au plus).")
    return {
      id,
      outil,
      nom: path.basename(absolu),
      donnees: readFileSync(absolu).toString("base64"),
      ...(typeof entree.langue === "string" ? { langue: entree.langue } : {}),
      ...(typeof entree.seuil === "number" ? { seuil: entree.seuil } : {}),
    }
  }

  /** Envoie la demande à la fenêtre et attend sa réponse. */
  async executer(demande: DemandeSens): Promise<string> {
    const reponse = new Promise<ReponseSens>((resoudre, rejeter) => {
      const minuterie = setTimeout(() => {
        this.attentes.delete(demande.id)
        rejeter(new Error("La fenêtre du harnais n'a pas répondu à temps. Est-elle ouverte ?"))
      }, ATTENTE_MAX)
      this.attentes.set(demande.id, {
        resoudre: (r) => {
          clearTimeout(minuterie)
          resoudre(r)
        },
      })
    })
    await this.envoyer(demande)
    const r = await reponse
    if (r.erreur) throw new Error(r.erreur)
    return r.texte ?? ""
  }

  /** La réponse de la fenêtre. Une réponse inattendue (déjà traitée, ou d'une autre fenêtre) est ignorée. */
  repondre(r: ReponseSens) {
    const attente = this.attentes.get(r.id)
    if (!attente) return false
    this.attentes.delete(r.id)
    attente.resoudre(r)
    return true
  }
}
