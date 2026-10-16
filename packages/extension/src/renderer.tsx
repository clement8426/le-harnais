// L'entrée « fenêtre » de l'extension :
//   - un onglet épinglé « Missions » dans le panneau latéral de chaque session ;
//   - la synchronisation des extensions d'OpenCode avec les capacités débloquées ;
//   - les outils des sens (voix, lecture de documents, image), qui tournent dans cette fenêtre.

import { createEffect, createSignal, lazy, Show, Suspense } from "solid-js"
import { Panel, Slot, type Setup } from "../sdk"
import type definition from "./index"
import { ecouterLesSens } from "./sens"
import { synchroniserExtensions } from "./synchro"

const setup: Setup<typeof definition> = (ctx) => {
  const Missions = lazy(() => import("./panneau"))
  // Ce que font les sens en ce moment (affiché dans le panneau), par exemple le téléchargement d'un modèle.
  const [statutSens, setStatutSens] = createSignal<string>()

  synchroniserExtensions(() => ctx.sessions.current(), ctx.uses.harnais)
  ecouterLesSens(() => ctx.sessions.current(), setStatutSens)

  // Avant la première conversation, une bande en bas de la fenêtre explique comment ça va se passer.
  const Bienvenue = lazy(() => import("./bienvenue"))
  ctx.add(Slot, {
    at: "window.bottom",
    render: () => (
      <Show when={!ctx.sessions.current()}>
        <Suspense>
          <Bienvenue />
        </Suspense>
      </Show>
    ),
  })

  // Le panneau s'ouvre tout seul la première fois qu'une session s'affiche : un élève ne devine pas qu'il faut cliquer
  // sur « Basculer la revue ». Fermé ensuite par l'élève, il reste fermé (une seule ouverture par session).
  const ouvertes = new Set<string>()
  createEffect(() => {
    const session = ctx.sessions.current()
    if (!session || !ctx.layout.ready() || ouvertes.has(session.key)) return
    ouvertes.add(session.key)
    ctx.layout.open("le-labo:missions", session, { tab: "select" })
  })

  ctx.add(Panel, {
    id: "missions",
    region: "side",
    wide: true,
    list: () => [{ id: "missions", title: ctx.t("title"), pinned: true, closable: false, fallback: true }],
    render: (props) => (
      <Suspense fallback={<p>{ctx.t("loading")}</p>}>
        <Missions session={props.session} navigateur={ctx.uses.browser} statutSens={statutSens} />
      </Suspense>
    ),
  })
}

export default setup
