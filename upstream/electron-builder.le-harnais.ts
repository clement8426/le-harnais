// La configuration d'empaquetage du Harnais : celle d'OpenCode (canal « dev », sans mise à jour automatique),
// avec notre nom, notre identifiant, notre icône et nos ressources (plugin, contenus, intégration du shell).
// scripts/empaqueter.ts la copie dans .upstream/opencode/packages/desktop avant de lancer electron-builder.

import type { Configuration } from "electron-builder"
import { getConfig } from "./electron-builder.config"

const base = getConfig() as Configuration
const version = process.env.LE_HARNAIS_VERSION ?? "0.0.0"

const config: Configuration = {
  ...base,
  appId: "app.leharnais.desktop",
  productName: "Le Harnais",
  // La version de l'application reste celle d'OpenCode (le service d'arrière-plan la compare à celle du serveur) :
  // seul le nom du fichier porte la version du Harnais.
  artifactName: `le-harnais-${version}-\${os}-\${arch}.\${ext}`,
  protocols: { name: "Le Harnais", schemes: ["leharnais"] },
  // Pas de serveur de mises à jour : celui d'OpenCode remplacerait Le Harnais par OpenCode.
  publish: null,
  files: [...(base.files as string[]), "!resources/le-harnais{,/**/*}"],
  extraResources: [...(base.extraResources as object[]), { from: "resources/le-harnais", to: "le-harnais" }],
  // On ne retouche pas Electron.exe (nom, icône) : modifié, son empreinte devient inconnue de Windows 11, dont le
  // contrôle intelligent des applications refuse alors de le lancer. Intact, il se lance comme en développement.
  win: { ...base.win, signAndEditExecutable: false },
  // Ni l'empreinte du code (asar) inscrite dans l'exécutable : elle le modifie à chaque construction, et Windows juge
  // chaque nouvelle empreinte au cas par cas. Laissé tel quel, il reste celui d'Electron, que Windows connaît.
  disableAsarIntegrity: true,
  nsis: { ...base.nsis, shortcutName: "Le Harnais", uninstallDisplayName: "Le Harnais" },
}

export default config
