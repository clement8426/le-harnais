// L'extension « le-labo » : le manifeste lu par l'hôte d'OpenCode avant tout chargement.
// Ce dossier est copié dans gui-extensions/src/le-labo par scripts/preparer.ts : les imports « ../sdk » visent le SDK d'OpenCode.

import { Extension } from "../sdk"
import en from "./i18n/en"

export default Extension.define({
  id: "le-labo",
  i18n: {
    en,
    fr: () => import("./i18n/fr"),
  },
})
