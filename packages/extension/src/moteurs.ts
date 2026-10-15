// Les moteurs des sens, dans la fenêtre du harnais (un navigateur Chromium) : rien ne quitte l'ordinateur.
// Chargés au premier usage seulement. Les modèles se téléchargent une fois, puis restent dans le cache du navigateur.
// Mêmes bibliothèques que l'exercice 01 du Labo : tesseract.js, pdf.js, transformers.js.

import type { DemandeSens } from "./contrat"

type Octets = Uint8Array<ArrayBuffer>

const depuisBase64 = (donnees: string): Octets => Uint8Array.from(atob(donnees), (c) => c.charCodeAt(0))

const LANGUES_TESSERACT: Record<string, string> = { fr: "fra", de: "deu", en: "eng" }
const LANGUES_WHISPER: Record<string, string> = { fr: "french", de: "german", en: "english" }

export async function executer(demande: DemandeSens): Promise<string> {
  switch (demande.outil) {
    case "ocr":
      return ocr(depuisBase64(demande.donnees ?? ""), demande.nom ?? "", demande.langue ?? "fr")
    case "transcrire":
      return transcrire(depuisBase64(demande.donnees ?? ""), demande.langue ?? "fr")
    case "lire_a_voix_haute":
      return lireAVoixHaute(demande.texte ?? "")
    case "detecter_objets":
      return detecterObjets(depuisBase64(demande.donnees ?? ""), demande.nom ?? "", demande.seuil ?? 0.9)
  }
}

// --- Lire un document : pdf.js pour les pages, Tesseract pour le texte ---

const ouvriers = new Map<string, Promise<{ recognize(image: HTMLCanvasElement): Promise<{ data: { text: string } }> }>>()

async function ocr(octets: Octets, nom: string, langue: string) {
  const code = LANGUES_TESSERACT[langue] ?? "fra"
  if (!ouvriers.has(code)) ouvriers.set(code, import("tesseract.js").then((t) => t.createWorker(code)))
  const ouvrier = await ouvriers.get(code)!
  const pages: string[] = []
  for (const toile of await enImages(octets, nom)) {
    const { data } = await ouvrier.recognize(toile)
    pages.push(data.text.trim() || "[aucun texte reconnu]")
  }
  return pages.map((texte, i) => (pages.length > 1 ? `--- Page ${i + 1} ---\n${texte}` : texte)).join("\n\n")
}

async function enImages(octets: Octets, nom: string): Promise<HTMLCanvasElement[]> {
  if (!nom.toLowerCase().endsWith(".pdf")) {
    const image = await createImageBitmap(new Blob([octets]))
    const toile = document.createElement("canvas")
    toile.width = image.width
    toile.height = image.height
    toile.getContext("2d")!.drawImage(image, 0, 0)
    return [toile]
  }
  const pdfjs = await import("pdfjs-dist")
  const { default: ouvrier } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  pdfjs.GlobalWorkerOptions.workerSrc = ouvrier
  const pdf = await pdfjs.getDocument({ data: octets }).promise
  if (pdf.numPages > 10) throw new Error("PDF trop long : 10 pages au plus.")
  const toiles: HTMLCanvasElement[] = []
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n)
    const vue = page.getViewport({ scale: 2 })
    const toile = document.createElement("canvas")
    toile.width = Math.round(vue.width)
    toile.height = Math.round(vue.height)
    await page.render({ canvas: toile, canvasContext: toile.getContext("2d")!, viewport: vue }).promise
    toiles.push(toile)
  }
  return toiles
}

// --- Dicter : Whisper (transformers.js), sur un son ramené à 16 kHz mono ---

let transcripteur: Promise<(son: Float32Array, options: Record<string, unknown>) => Promise<{ text: string } | { text: string }[]>> | undefined

async function transcrire(octets: Octets, langue: string) {
  transcripteur ??= import("@huggingface/transformers").then(
    ({ pipeline }) => pipeline("automatic-speech-recognition", "Xenova/whisper-base", { dtype: "q8", device: "wasm" }) as never,
  )
  const son = await en16kHzMono(octets)
  const resultat = await (await transcripteur)(son, {
    language: LANGUES_WHISPER[langue] ?? "french",
    task: "transcribe",
    chunk_length_s: 30,
    stride_length_s: 5,
  })
  return (Array.isArray(resultat) ? resultat.map((r) => r.text).join(" ") : resultat.text).trim()
}

async function en16kHzMono(octets: Octets) {
  const decodeur = new AudioContext()
  const son = await decodeur.decodeAudioData(octets.slice().buffer)
  await decodeur.close()
  const hors = new OfflineAudioContext(1, Math.ceil(son.duration * 16000), 16000)
  const source = hors.createBufferSource()
  source.buffer = son
  source.connect(hors.destination)
  source.start()
  return (await hors.startRendering()).getChannelData(0)
}

// --- Écouter : la synthèse vocale de l'ordinateur (voix installées avec le système) ---

async function lireAVoixHaute(texte: string) {
  if (!texte.trim()) throw new Error("Rien à lire.")
  const voix = await voixDisponibles()
  const francaise = voix.find((v) => v.lang.toLowerCase().startsWith("fr") && v.localService) ?? voix.find((v) => v.lang.toLowerCase().startsWith("fr"))
  const enonce = new SpeechSynthesisUtterance(texte)
  enonce.lang = "fr-FR"
  if (francaise) enonce.voice = francaise
  speechSynthesis.cancel()
  await new Promise<void>((fini, rate) => {
    enonce.onend = () => fini()
    enonce.onerror = (e) => rate(new Error(`La lecture a échoué : ${e.error}`))
    speechSynthesis.speak(enonce)
  })
  const mots = texte.trim().split(/\s+/).length
  return `Lu à voix haute : ${mots} mots, voix « ${francaise?.name ?? "par défaut"} »${francaise?.localService ? " (sur l'ordinateur)" : ""}.`
}

// Chromium charge les voix du système en arrière-plan, et « voiceschanged » ne vient pas toujours :
// on redemande la liste toutes les 100 ms, 3 secondes au plus.
async function voixDisponibles() {
  for (let essai = 0; essai < 30; essai++) {
    const voix = speechSynthesis.getVoices()
    if (voix.length) return voix
    await new Promise((ok) => setTimeout(ok, 100))
  }
  return speechSynthesis.getVoices()
}

// --- Voir : détection d'objets (DETR, transformers.js) ---

let detecteur: Promise<(image: string, options: Record<string, unknown>) => Promise<{ label: string; score: number }[]>> | undefined

async function detecterObjets(octets: Octets, nom: string, seuil: number) {
  detecteur ??= import("@huggingface/transformers").then(
    ({ pipeline }) => pipeline("object-detection", "Xenova/detr-resnet-50", { dtype: "q8", device: "wasm" }) as never,
  )
  const type = nom.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"
  const adresse = URL.createObjectURL(new Blob([octets], { type }))
  try {
    const objets = await (await detecteur)(adresse, { threshold: seuil })
    if (!objets.length) return `Aucun objet trouvé avec une confiance d'au moins ${Math.round(seuil * 100)} %.`
    return objets
      .sort((a, b) => b.score - a.score)
      .map((o) => `- ${o.label} : ${Math.round(o.score * 100)} %`)
      .join("\n")
  } finally {
    URL.revokeObjectURL(adresse)
  }
}
