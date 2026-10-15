#!/usr/bin/env bun
// Pilote l'application de bureau lancée en mode développement, par le protocole de débogage de Chrome
// (port OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT, 9333 par défaut ici : le 9222 d'origine tombe dans une plage
// de ports réservée par Windows sur certains postes). Les actions s'enchaînent dans l'ordre donné.
//
//   bun scripts/capture.ts image.png                       capture de la fenêtre principale
//   bun scripts/capture.ts --eval "document.title"         évalue du JavaScript dans la fenêtre
//   bun scripts/capture.ts --clic 800 495 --taper "Bonjour" --touche Enter --attendre 3000 image.png
//   bun scripts/capture.ts --pret image.png                attend que l'application soit prête (en premier seulement)
// --touche accepte les combinaisons : « ctrl+` », « ctrl+shift+p ».

const port = process.env.OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT ?? "9333"

// --pret : attend (jusqu'à 5 minutes) que la fenêtre réponde et que l'interface soit montée.
if (process.argv[2] === "--pret") {
  const fin = Date.now() + 300_000
  while (Date.now() < fin) {
    const pret = await fetch(`http://127.0.0.1:${port}/json/list`)
      .then((r) => r.json() as Promise<{ type: string }[]>)
      .then((l) => l.some((c) => c.type === "page"))
      .catch(() => false)
    if (pret) break
    await Bun.sleep(2000)
  }
  process.argv.splice(2, 1)
  await Bun.sleep(15000) // le temps que la fenêtre se monte et rejoigne le serveur
}

const cibles = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; url: string; webSocketDebuggerUrl: string }[]
const page = cibles.find((c) => c.type === "page" && /index\.html|localhost:5173/.test(c.url)) ?? cibles.find((c) => c.type === "page")
if (!page) throw new Error(`Aucune fenêtre trouvée sur le port ${port}.`)

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((ok) => ws.addEventListener("open", ok, { once: true }))
let suivant = 0
const appeler = (method: string, params: Record<string, unknown> = {}) =>
  new Promise<any>((ok, ko) => {
    const id = ++suivant
    const ecoute = (m: MessageEvent) => {
      const r = JSON.parse(String(m.data))
      if (r.id !== id) return
      ws.removeEventListener("message", ecoute)
      r.error ? ko(new Error(r.error.message)) : ok(r.result)
    }
    ws.addEventListener("message", ecoute)
    ws.send(JSON.stringify({ id, method, params }))
  })

const TOUCHES: Record<string, { code: string; keyCode: number }> = {
  Enter: { code: "Enter", keyCode: 13 },
  Escape: { code: "Escape", keyCode: 27 },
  Tab: { code: "Tab", keyCode: 9 },
  "`": { code: "Backquote", keyCode: 192 },
}
const MODIFICATEURS: Record<string, number> = { alt: 1, ctrl: 2, meta: 4, shift: 8 }

const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
  const a = args[i]!
  if (a === "--eval") {
    const r = await appeler("Runtime.evaluate", { expression: args[++i], awaitPromise: true, returnByValue: true })
    console.log(JSON.stringify(r.result.value ?? r.result.description ?? r.exceptionDetails?.text, null, 2))
  } else if (a === "--clic") {
    const x = Number(args[++i]), y = Number(args[++i])
    for (const type of ["mousePressed", "mouseReleased"]) await appeler("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 })
  } else if (a === "--taper") {
    await appeler("Input.insertText", { text: args[++i] })
  } else if (a === "--touche") {
    // « Enter », « ctrl+` », « ctrl+shift+p »… : la dernière partie est la touche, les autres des modificateurs.
    const parties = args[++i]!.split("+")
    const nom = parties.pop()!
    const modifiers = parties.reduce((m, p) => m | (MODIFICATEURS[p.toLowerCase()] ?? 0), 0)
    const t = TOUCHES[nom] ?? { code: nom.length === 1 ? `Key${nom.toUpperCase()}` : nom, keyCode: nom.length === 1 ? nom.toUpperCase().charCodeAt(0) : 0 }
    for (const type of ["keyDown", "keyUp"]) await appeler("Input.dispatchKeyEvent", { type, key: nom, code: t.code, windowsVirtualKeyCode: t.keyCode, modifiers })
  } else if (a === "--attendre") {
    await Bun.sleep(Number(args[++i]))
  } else {
    const r = await appeler("Page.captureScreenshot", { format: "png" })
    await Bun.write(a, Buffer.from(r.data, "base64"))
    console.log(`Capture enregistrée : ${a}`)
  }
}
ws.close()
