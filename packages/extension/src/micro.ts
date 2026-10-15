// La dictée de l'élève : le micro enregistre dans la fenêtre, Whisper transcrit sur l'ordinateur,
// le texte s'affiche dans le panneau et va dans le presse-papiers. Rien ne part vers l'IA tant que l'élève ne l'envoie pas lui-même.
// Le patch 06 autorise le micro (audio seul) dans la fenêtre d'OpenCode.

type Octets = Uint8Array<ArrayBuffer>

/** Lance l'enregistrement. La fonction renvoyée l'arrête et rend le son enregistré. */
export async function enregistrer(): Promise<() => Promise<Octets>> {
  const flux = await navigator.mediaDevices.getUserMedia({ audio: true })
  const enregistreur = new MediaRecorder(flux)
  const morceaux: Blob[] = []
  enregistreur.ondataavailable = (e) => morceaux.push(e.data)
  enregistreur.start()
  return () =>
    new Promise((fini) => {
      enregistreur.onstop = async () => {
        flux.getTracks().forEach((piste) => piste.stop())
        fini(new Uint8Array(await new Blob(morceaux).arrayBuffer()))
      }
      enregistreur.stop()
    })
}

/** Transcrit le son avec le même moteur que l'outil « transcrire ». */
export async function transcrireSon(son: Octets) {
  const { transcrire } = await import("./moteurs")
  return transcrire(son, "fr")
}

/** Copie le texte. Faux si le presse-papiers refuse (Chromium l'exige quand la fenêtre a le focus). */
export function copier(texte: string) {
  return navigator.clipboard.writeText(texte).then(
    () => true,
    () => false,
  )
}
