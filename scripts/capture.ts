#!/usr/bin/env bun
// Pilote l'application de bureau lancée en mode développement, par le protocole de débogage de Chrome
// (port OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT, 9333 par défaut ici : le 9222 d'origine tombe dans une plage
// de ports réservée par Windows sur certains postes). Les actions s'enchaînent dans l'ordre donné.
//
//   bun scripts/capture.ts image.png                       capture de la fenêtre principale
//   bun scripts/capture.ts --eval "document.title"         évalue du JavaScript dans la fenêtre
//   bun scripts/capture.ts --clic 800 495 --taper "Bonjour" --touche Enter --attendre 3000 image.png

const port = process.env.OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT ?? "9333"
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
}

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
    const nom = args[++i]!
    const t = TOUCHES[nom] ?? { code: nom, keyCode: 0 }
    for (const type of ["keyDown", "keyUp"]) await appeler("Input.dispatchKeyEvent", { type, key: nom, code: t.code, windowsVirtualKeyCode: t.keyCode })
  } else if (a === "--attendre") {
    await Bun.sleep(Number(args[++i]))
  } else {
    const r = await appeler("Page.captureScreenshot", { format: "png" })
    await Bun.write(a, Buffer.from(r.data, "base64"))
    console.log(`Capture enregistrée : ${a}`)
  }
}
ws.close()
