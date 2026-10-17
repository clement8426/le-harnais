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
import { Contrat, type EntreeCommencer, type EntreePage, type EntreeRepondre, type OutilSens, type ReponseSens } from "../../extension/src/contrat"
import { OUTILS_SENS, Sens } from "./sens"
import { Atelier, estUnAtelier } from "./atelier"
import { pagesCitees, rapportsLighthouse } from "./detection"
import { tmpdir } from "node:os"
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
    // La première mission démarre dès l'ouverture de l'atelier : un message envoyé avant d'ouvrir le panneau compte.
    atelier.demarrerLaSuivante()

    // Le fournisseur et le modèle utilisés par la dernière requête de chaque session.
    const modeles = new Map<string, { id: string; modele: string }>()
    let dernier: { id: string; modele: string } | undefined

    // Les outils des sens tournent dans la fenêtre : le plugin lui envoie la demande, elle renvoie le résultat.
    const sens = new Sens(dossier, (demande) => rpc.events.emit("sens", demande as unknown as Record<string, unknown>))

    const rpc = await ctx.rpc.register(Contrat, {
      resultatSens: async (reponse: ReponseSens) => ({ attendue: sens.repondre(reponse) }),
      etat: async () => {
        if (atelier.demarrerLaSuivante()) await changement()
        return atelier.etat(dernier)
      },
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

    // Les outils des sens existent seulement quand leur capacité est active (débloquée ou prêtée par la mission).
    await ctx.tool.transform((editeur) => {
      const actifs = atelier.droits().outils
      trace(`outils des sens actifs : ${actifs.join(",") || "aucun"}`)
      for (const [nom, outil] of Object.entries(OUTILS_SENS) as [OutilSens, (typeof OUTILS_SENS)[OutilSens]][]) {
        if (!actifs.includes(nom)) {
          editeur.remove(nom)
          continue
        }
        try {
          editeur.add({
            name: nom,
            description: outil.description,
            input: outil.input,
            options: { codemode: false },
            execute: async (entree: Record<string, unknown>) => ({ content: await sens.executer(sens.preparer(nom, entree)) }),
          })
        } catch (e) {
          trace(`outil ${nom} : ajout impossible ${String(e)}`)
        }
      }
    })

    // Les connecteurs MCP des capacités actives sont branchés ; les autres connecteurs connus du Harnais, débranchés.
    let mcpActifs = atelier.droits().mcp.join(",")
    await ctx.mcp.transform((editeur) => {
      const actifs = atelier.droits().mcp
      for (const connecteur of atelier.contenus.connecteurs.values()) {
        if (!actifs.includes(connecteur.id)) editeur.remove(connecteur.id)
        else editeur.set(connecteur.id, { type: "local", command: connecteur.commande, codemode: connecteur.codemode })
      }
    })

    // Un changement d'état peut ouvrir ou fermer des outils et des connecteurs : on recharge, puis on prévient le panneau.
    const changement = async () => {
      await ctx.tool.reload().catch(() => undefined)
      const mcp = atelier.droits().mcp.join(",")
      if (mcp !== mcpActifs) {
        mcpActifs = mcp
        await ctx.mcp.reload().catch((e) => trace(`mcp : rechargement impossible ${String(e)}`))
      }
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
      trace(`outils gardés : ${Object.keys(e.tools).join(",")}`)
      e.system.push({ type: "text", text: consignesDuProf(atelier) })
    })

    // Les rapports Lighthouse plus anciens que le démarrage du plugin, ou déjà lus, sont ignorés.
    const debut = Date.now()
    const rapportsLus = new Set<string>()
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
      // Le navigateur d'OpenCode répond dans le texte de l'outil (pages consultées), et enregistre ses rapports
      // Lighthouse sur le disque : on lit les deux, pour ne pas dépendre de ce que l'IA garde du résultat.
      if (resultat) pagesCitees(resultat).forEach((url) => atelier.enregistrer({ quand: maintenant(), type: "navigateur.page", url }))
      if (e.tool === "execute" && JSON.stringify(e.input).includes("lighthouse"))
        rapportsLighthouse(tmpdir(), debut, rapportsLus).forEach((a) =>
          atelier.enregistrer({ quand: maintenant(), type: "audit", categorie: a.categorie, score: a.score }),
        )
      await changement()
    })

    // Chaque seconde : les commandes de l'élève, notées par l'intégration du shell dans .labo/terminal.jsonl,
    // et les fichiers que surveillent les preuves de la mission en cours (l'élève les corrige à la main).
    // Au démarrage, on saute ce qui est déjà dans le fichier du terminal : c'était déjà importé dans le journal.
    atelier.sauterTerminal()
    const releve = setInterval(() => {
      const commandes = atelier.importerTerminal() > 0
      if (atelier.verifierFichiers() || commandes) void changement()
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
