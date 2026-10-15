// L'entrée « fenêtre » de l'extension : un onglet épinglé « Missions » dans le panneau latéral de chaque session.

import { lazy, Suspense } from "solid-js"
import { Panel, type Setup } from "../sdk"
import type definition from "./index"

const setup: Setup<typeof definition> = (ctx) => {
  const Missions = lazy(() => import("./panneau"))

  ctx.add(Panel, {
    id: "missions",
    region: "side",
    list: () => [{ id: "missions", title: ctx.t("title"), pinned: true, closable: false, fallback: true }],
    render: (props) => (
      <Suspense fallback={<p>{ctx.t("loading")}</p>}>
        <Missions session={props.session} />
      </Suspense>
    ),
  })
}

export default setup
