// L'extension « le-labo » : le manifeste lu par l'hôte d'OpenCode avant tout chargement.
// Ce dossier est copié dans gui-extensions/src/le-labo par scripts/preparer.ts : les imports « ../sdk » visent le SDK d'OpenCode.

import { Browser } from "../browser/contract"
import { Extension } from "../sdk"
import en from "./i18n/en"
import { Harnais } from "./ipc"

export default Extension.define({
  id: "le-labo",
  provides: { harnais: Harnais },
  // Facultatif : sert au bouton « Ouvrir la page » des missions du web, tant que le navigateur est allumé.
  uses: { browser: Browser },
  i18n: {
    en,
    fr: () => import("./i18n/fr"),
  },
})
