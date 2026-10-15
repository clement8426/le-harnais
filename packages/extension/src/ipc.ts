// L'Ipc entre la fenêtre et le processus principal de l'extension : allumer ou éteindre les extensions gérées.

import { Schema } from "effect"
import { Ipc } from "../sdk"

export const Harnais = Ipc.define({
  id: "le-labo",
  methods: {
    /** Allume les extensions de `allumees`, éteint les autres de `gerees`. Ne touche à rien d'autre. */
    appliquer: { input: Schema.Struct({ allumees: Schema.Array(Schema.String), gerees: Schema.Array(Schema.String) }) },
  },
})
