// L'adaptateur : la seule partie du plugin qui connaît l'API de plugins d'OpenCode V2 (@opencode/plugin, API « Promise »).
// On décrit ici uniquement ce qu'on utilise, d'après packages/plugin/src/promise/*.ts de la version figée.
// Si OpenCode change son API, c'est ce fichier (et index.ts) qu'on adapte, jamais le moteur ni les contenus.

export type Effet = "allow" | "ask" | "deny"

export interface Enregistrement {
  dispose(): Promise<void>
}

export interface EvaluationPermission {
  readonly sessionID: string
  readonly action: string
  readonly resources: ReadonlyArray<string>
  effect: Effet
  message?: string
}

export interface ApresOutil {
  readonly tool: string
  readonly sessionID: string
  readonly input: unknown
  readonly status: "completed" | "error"
  readonly result?: { readonly output?: unknown; readonly content?: unknown }
  readonly error?: { readonly message?: string }
}

export interface ContexteSession {
  readonly sessionID: string
  readonly model: { readonly id: string; readonly providerID: string }
  system: Array<{ type: "text"; text: string }>
  tools: Record<string, unknown>
}

export interface EvenementOpenCode {
  readonly type: string
  readonly data: Record<string, unknown>
}

export interface OutilOpenCode {
  readonly name: string
  readonly description: string
  readonly input: unknown
  readonly options?: { readonly codemode?: boolean }
  readonly execute: (input: any, context: unknown) => Promise<{ output?: unknown; content?: string }>
}

export interface ContexteOpenCode {
  readonly location: { readonly directory: string }
  readonly options: Record<string, unknown>
  readonly permission: { hook(nom: "evaluate", rappel: (e: EvaluationPermission) => void | Promise<void>): Promise<Enregistrement> }
  readonly tool: {
    hook(nom: "execute.after", rappel: (e: ApresOutil) => void | Promise<void>): Promise<Enregistrement>
    transform(rappel: (editeur: { add(outil: OutilOpenCode): void; remove(id: string): void }) => void): Promise<Enregistrement>
    reload(): Promise<void>
  }
  readonly session: { hook(nom: "context", rappel: (e: ContexteSession) => void | Promise<void>): Promise<Enregistrement> }
  readonly event: { subscribe(options?: { signal?: AbortSignal }): AsyncIterable<EvenementOpenCode> }
  readonly rpc: {
    register(
      definition: unknown,
      handlers: Record<string, (input: any, context: { signal: AbortSignal }) => Promise<unknown>>,
    ): Promise<Enregistrement & { events: { emit(nom: string, data: Record<string, unknown>): Promise<void> } }>
  }
}

/** L'action de permission qui protège un outil (les anciens noms v1 ont été renommés en V2). */
export function actionDeLOutil(outil: string) {
  if (outil === "write" || outil === "patch") return "edit"
  if (outil === "bash") return "shell"
  if (outil === "task") return "subagent"
  return outil
}

const RIGUEUR: Record<Effet, number> = { allow: 0, ask: 1, deny: 2 }

/** Le plus strict des deux : le Harnais ne fait que restreindre ce qu'OpenCode autoriserait. */
export function plusStrict(a: Effet, b: Effet): Effet {
  return RIGUEUR[a] >= RIGUEUR[b] ? a : b
}
