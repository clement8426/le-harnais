// L'entrée « fenêtre » de l'extension :
//   - un onglet épinglé « Missions » dans le panneau latéral de chaque session ;
//   - la synchronisation des extensions d'OpenCode avec les capacités débloquées ;
//   - les outils des sens (voix, lecture de documents, image), qui tournent dans cette fenêtre.

import { createSignal, lazy, Suspense } from "solid-js"
import { Panel, type Setup } from "../sdk"
import type definition from "./index"
import { ecouterLesSens } from "./sens"
import { synchroniserExtensions } from "./synchro"

const setup: Setup<typeof definition> = (ctx) => {
  const Missions = lazy(() => import("./panneau"))
  // Ce que font les sens en ce moment (affiché dans le panneau), par exemple le téléchargement d'un modèle.
  const [statutSens, setStatutSens] = createSignal<string>()

  synchroniserExtensions(() => ctx.sessions.current(), ctx.uses.harnais)
  ecouterLesSens(() => ctx.sessions.current(), setStatutSens)

  ctx.add(Panel, {
    id: "missions",
    region: "side",
    list: () => [{ id: "missions", title: ctx.t("title"), pinned: true, closable: false, fallback: true }],
    render: (props) => (
      <Suspense fallback={<p>{ctx.t("loading")}</p>}>
        <Missions session={props.session} navigateur={ctx.uses.browser} statutSens={statutSens} />
      </Suspense>
    ),
  })
}

export default setup
