// Les types partagés par tout le moteur.
// Règle d'or : rien ici ne parle d'OpenCode. Le moteur décrit des capacités, des missions et des preuves ;
// l'adaptateur traduit ensuite en réglages OpenCode.

export type Action = "allow" | "ask" | "deny"

/** Ce qu'une capacité allume concrètement. L'adaptateur sait appliquer chaque effet. */
export type Effet =
  | { type: "extension"; id: string }
  | { type: "permission"; outil: string; motif?: string; action: Action }
  | { type: "outil"; id: string }
  | { type: "mcp"; id: string }

export interface Capacite {
  id: string
  titre: string
  description: string
  effets: Effet[]
}

/** Règles de permission appliquées en dernier, quelles que soient les capacités : elles gagnent toujours. */
export interface Catalogue {
  /** Extensions d'OpenCode éteintes tant qu'aucune capacité active ne les allume. Les autres ne sont pas touchées. */
  extensionsGerees: string[]
  capacites: Capacite[]
  toujours: Effet[]
}

export type Systeme = "windows" | "macos" | "linux"

export type Preuve =
  /** Une réponse de l'IA ; si `fournisseurs` est donné, seulement de l'un d'eux (ids OpenCode : infomaniak, ollama…). */
  | { type: "ia.reponse"; fournisseurs?: string[] }
  | { type: "outil.appel"; outil: string; arguments?: Record<string, string> }
  | { type: "outil.resultat"; outil: string; contient: string[] }
  | { type: "permission.demandee"; outil?: string; acceptee?: boolean }
  | { type: "fichier.existe"; chemin: string }
  | { type: "fichier.contient"; chemin: string; contient: string[] }
  | { type: "audit.score"; categorie: string }
  | { type: "question"; id: string }
  /** Une commande tapée par l'élève dans son terminal (motif), qui a réussi. */
  | { type: "terminal.commande"; motif: string }
  | { type: "navigateur.page"; motif: string }

export interface Question {
  id: string
  enonce: string
  choix: string[]
  bonne: number
  explication: string
}

export interface Mission {
  id: string
  titre: string
  version: number
  resume: string
  requiert: string[]
  /** Capacités prêtées le temps de la mission, pour pouvoir s'en servir avant de les avoir gagnées. */
  prete: string[]
  debloque: string[]
  preuves: Preuve[]
  questions: Question[]
  indice: string
  /** Une page du dossier de l'élève à ouvrir dans le navigateur du harnais (bouton du panneau). */
  page?: string
  os?: Systeme[]
  /** Contenu de cours.md, si le fichier existe. */
  cours?: string
  /** Dossier de la mission sur le disque. */
  dossier: string
}

export interface Chapitre {
  id: string
  titre: string
  missions: string[]
}

export interface Parcours {
  id: string
  titre: string
  socle: string[]
  chapitres: Chapitre[]
}

/** Un connecteur MCP local que le Harnais sait brancher (contenus/mcp.yaml). */
export interface Connecteur {
  id: string
  titre: string
  commande: string[]
  codemode: boolean
}

export interface Contenus {
  catalogue: Catalogue
  connecteurs: Map<string, Connecteur>
  missions: Map<string, Mission>
  parcours: Map<string, Parcours>
}

/** Une ligne du journal. Chaque source (terminal, navigateur, plugin) écrit dans ce format. */
export type Evenement = { quand: string } & (
  | { type: "ia.reponse"; fournisseur?: string; modele?: string }
  | { type: "outil.appel"; outil: string; arguments: Record<string, unknown>; resultat?: string; erreur?: string }
  | { type: "permission"; outil: string; acceptee: boolean }
  /** Une commande de l'élève, notée par l'intégration du shell, et si elle a réussi. */
  | { type: "terminal.commande"; commande: string; ok: boolean }
  | { type: "navigateur.page"; url: string }
  | { type: "question"; id: string; reponse: number }
  | { type: "audit"; categorie: string; score: number }
)

export interface Progression {
  version: 1
  parcours: string
  /** Missions réussies, rangées par nom : réordonner le parcours ne fait rien perdre. */
  reussies: Record<string, { version: number; quand: string }>
  /** Date de début de chaque mission : les preuves ne regardent que ce qui suit. */
  commencees: Record<string, string>
}

export type Niveau = "erreur" | "avertissement"

export interface Diagnostic {
  niveau: Niveau
  code: string
  message: string
}
