// Le contrat RPC entre le plugin serveur (qui tient la progression et le journal) et l'extension (le panneau).
// Partagé tel quel par les deux côtés : le plugin l'importe depuis ce fichier au moment de sa construction.
// Les schémas restent volontairement simples (« un objet ») : les types TypeScript ci-dessous font foi.

const objet = { type: "object" } as const

export const Contrat = {
  id: "le-harnais",
  methods: {
    /** L'état complet à afficher. */
    etat: { input: objet, output: objet },
    /** Commence une mission : prête ses capacités, copie ses fichiers. */
    commencer: { input: objet, output: objet },
    /** Réponse à une question de mission. */
    repondre: { input: objet, output: objet },
    /** Une page ouverte dans le navigateur du harnais. */
    page: { input: objet, output: objet },
  },
  events: {
    /** L'état a changé : le panneau se recharge. */
    change: { schema: objet },
  },
} as const

export type EtatMission = "reussie" | "ouverte" | "nouvelle" | "mise-a-jour" | "verrouillee" | "en-cours"

export interface EtapeUI {
  numero: number
  chapitre: { id: string; titre: string; numero: number }
  id: string
  titre: string
  resume: string
  etat: EtatMission
  cours?: string
  indice: string
  /** Les questions, sans la bonne réponse. */
  questions: { id: string; enonce: string; choix: string[] }[]
  /** Pour la mission en cours seulement : chaque preuve, verte ou rouge. */
  preuves?: { ok: boolean; detail: string }[]
}

export interface EtatUI {
  /** Faux si la session n'est pas ouverte dans un dossier LeLabo. */
  actif: boolean
  dossier: string
  parcours?: { id: string; titre: string }
  etapes: EtapeUI[]
  enCours?: string
  prochaine?: string
  capacites: string[]
  /** Les extensions d'OpenCode à allumer, et celles que le Harnais gère (les autres de cette liste sont éteintes). */
  extensions: { allumees: string[]; gerees: string[] }
  fournisseur?: { id: string; modele: string }
  /** Message à montrer une fois (mission réussie, erreur de contenu…). */
  annonce?: string
}

export interface EntreeCommencer {
  mission: string
}
export interface EntreeRepondre {
  question: string
  reponse: number
}
export interface EntreePage {
  url: string
}
