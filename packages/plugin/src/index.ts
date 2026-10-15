// Le plugin serveur du Harnais (API de plugins « Promise » d'OpenCode V2).
// Dans un dossier LeLabo, il :
//   - restreint les droits de l'IA aux capacités débloquées (déclencheur d'évaluation des permissions) ;
//   - retire de la vue du modèle les outils entièrement interdits, et ajoute les consignes du prof ;
//   - note dans le journal les appels d'outils, les permissions et les réponses de l'IA ;
//   - répond au panneau des missions par RPC (état, commencer, répondre, terminal, page).
// Ailleurs, il ne fait rien.

import { decider } from "@le-harnais/moteur"
import { appendFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Contrat, type EntreeCommencer, type EntreePage, type EntreeRepondre } from "../../extension/src/contrat"
import { Atelier, estUnAtelier } from "./atelier"
import { actionDeLOutil, plusStrict, type ContexteOpenCode } from "./opencode"
import { consignesDuProf } from "./prof"

const maintenant = () => new Date().toISOString()

/** Les contenus : variable LABO_CONTENUS, option du plugin, ou le dossier « le-harnais-contenus » à côté du dossier des plugins. */
function trouverContenus(options: Record<string, unknown>) {
  const candidats = [
    process.env.LABO_CONTENUS,
    typeof options.contenus === "string" ? options.contenus : undefined,
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "le-harnais-contenus"),
  ].filter((c): c is string => !!c)
  return candidats.find((c) => existsSync(path.join(c, "capacites.yaml")))
}

function systeme() {
  if (process.platform === "win32") return "windows" as const
  if (process.platform === "darwin") return "macos" as const
  return "linux" as const
}

export default {
  id: "le-harnais",
  setup: async (ctx: ContexteOpenCode) => {
    const dossier = ctx.location.directory
    if (!estUnAtelier(dossier)) return
    const contenus = trouverContenus(ctx.options)
    if (!contenus) throw new Error("Le Harnais : contenus introuvables (LABO_CONTENUS ou dossier le-harnais-contenus).")
    const atelier = new Atelier(dossier, contenus, systeme())
    const trace = (message: string) => {
      if (process.env.LE_HARNAIS_TRACE) appendFileSync(path.join(dossier, ".labo", "trace.log"), `${maintenant()} ${message}\n`)
    }
    trace("setup")

    // Le fournisseur et le modèle utilisés par la dernière requête de chaque session.
    const modeles = new Map<string, { id: string; modele: string }>()
    let dernier: { id: string; modele: string } | undefined

    const rpc = await ctx.rpc.register(Contrat, {
      etat: async () => atelier.etat(dernier),
      commencer: async (entree: EntreeCommencer) => {
        atelier.commencer(entree.mission)
        await changement()
        return atelier.etat(dernier)
      },
      repondre: async (entree: EntreeRepondre) => {
        atelier.enregistrer({ quand: maintenant(), type: "question", id: entree.question, reponse: entree.reponse })
        await changement()
        return atelier.etat(dernier)
      },
      page: async (entree: EntreePage) => {
        atelier.enregistrer({ quand: maintenant(), type: "navigateur.page", url: entree.url })
        await changement()
        return {}
      },
    })

    // Un changement d'état peut ouvrir ou fermer des outils : on recharge la liste, puis on prévient le panneau.
    const changement = async () => {
      await ctx.tool.reload().catch(() => undefined)
      await rpc.events.emit("change", {}).catch(() => undefined)
    }

    await ctx.permission.hook("evaluate", (e) => {
      trace(`permission ${e.action} ${e.resources.join(",")} ${e.effect}`)
      const regles = atelier.droits().regles
      const action = actionDeLOutil(e.action)
      const ressources = e.resources.length ? e.resources : ["*"]
      const notre = ressources.map((r) => decider(regles, action, r)).reduce(plusStrict, "allow")
      const final = plusStrict(e.effect, notre)
      if (final === "deny" && e.effect !== "deny")
        e.message = "Le Harnais : tu n'as pas encore débloqué ce droit pour ton IA. Il viendra avec une prochaine mission."
      e.effect = final
    })

    await ctx.session.hook("context", (e) => {
      trace(`context ${e.model.providerID}/${e.model.id} outils=${Object.keys(e.tools).join(",")}`)
      const fournisseur = { id: e.model.providerID, modele: e.model.id }
      modeles.set(e.sessionID, fournisseur)
      dernier = fournisseur
      const regles = atelier.droits().regles
      // Un outil entièrement interdit est retiré de la vue du modèle : il ne perd pas son temps à essayer.
      for (const outil of Object.keys(e.tools)) {
        const action = actionDeLOutil(outil)
        const toujoursRefuse = decider(regles, action, "*") === "deny" && !regles.some((r) => r.outil === action && r.action !== "deny")
        if (toujoursRefuse) delete e.tools[outil]
      }
      e.system.push({ type: "text", text: consignesDuProf(atelier) })
    })

    await ctx.tool.hook("execute.after", async (e) => {
      const resultat = e.status === "completed" ? texte(e.result?.content ?? e.result?.output) : undefined
      const arguments_ = e.input && typeof e.input === "object" ? (e.input as Record<string, unknown>) : {}
      atelier.enregistrer({
        quand: maintenant(),
        type: "outil.appel",
        outil: e.tool,
        arguments: arguments_,
        ...(resultat !== undefined ? { resultat: resultat.slice(0, 20_000) } : {}),
        ...(e.status === "error" ? { erreur: e.error?.message ?? "erreur" } : {}),
      })
      await changement()
    })

    // Les commandes de l'élève, notées par l'intégration du shell dans .labo/terminal.jsonl : relues chaque seconde.
    // Au démarrage, on saute ce qui est déjà dans le fichier : c'était déjà importé dans le journal.
    atelier.sauterTerminal()
    const releve = setInterval(() => {
      if (atelier.importerTerminal() > 0) void changement()
    }, 1000)
    releve.unref?.()

    // Les événements du serveur : permissions demandées et répondues, fin des réponses de l'IA.
    const demandes = new Map<string, string>()
    void (async () => {
      for await (const evenement of ctx.event.subscribe()) {
        const d = evenement.data
        if (!evenement.type.startsWith("session.reasoning") && !evenement.type.includes("delta")) trace(`evenement ${evenement.type}`)
        if (evenement.type === "permission.asked") demandes.set(String(d.id), actionDeLOutil(String(d.action)))
        if (evenement.type === "permission.replied") {
          const outil = demandes.get(String(d.requestID))
          if (!outil) continue
          atelier.enregistrer({ quand: maintenant(), type: "permission", outil, acceptee: d.reply !== "reject" })
          await changement()
        }
        if (evenement.type === "session.step.ended") {
          const m = modeles.get(String(d.sessionID)) ?? dernier
          atelier.enregistrer({ quand: maintenant(), type: "ia.reponse", ...(m ? { fournisseur: m.id, modele: m.modele } : {}) })
          await changement()
        }
      }
    })().catch(() => undefined)
  },
}

function texte(valeur: unknown): string | undefined {
  if (valeur === undefined || valeur === null) return undefined
  if (typeof valeur === "string") return valeur
  return JSON.stringify(valeur)
}
