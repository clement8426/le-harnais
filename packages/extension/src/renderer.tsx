// L'entrée « fenêtre » de l'extension :
//   - un onglet épinglé « Missions » dans le panneau latéral de chaque session ;
//   - la synchronisation des extensions d'OpenCode avec les capacités débloquées.

import { lazy, Suspense } from "solid-js"
import { Panel, type Setup } from "../sdk"
import type definition from "./index"
import { synchroniserExtensions } from "./synchro"

const setup: Setup<typeof definition> = (ctx) => {
  const Missions = lazy(() => import("./panneau"))

  synchroniserExtensions(() => ctx.sessions.current(), ctx.uses.harnais)

  ctx.add(Panel, {
    id: "missions",
    region: "side",
    list: () => [{ id: "missions", title: ctx.t("title"), pinned: true, closable: false, fallback: true }],
    render: (props) => (
      <Suspense fallback={<p>{ctx.t("loading")}</p>}>
        <Missions session={props.session} navigateur={ctx.uses.browser} />
      </Suspense>
    ),
  })
}

export default setup
