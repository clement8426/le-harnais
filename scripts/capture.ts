#!/usr/bin/env bun
// Capture d'écran et évaluation JavaScript dans l'application de bureau lancée en mode développement,
// par le protocole de débogage de Chrome (port OPENCODE_DESKTOP_REMOTE_DEBUGGING_PORT, 9333 par défaut ici :
// le 9222 d'origine tombe dans une plage de ports réservée par Windows sur certains postes).
//
//   bun scripts/capture.ts image.png            capture de la fenêtre principale
//   bun scripts/capture.ts --eval "document.title"

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

const args = process.argv.slice(2)
if (args[0] === "--eval") {
  const r = await appeler("Runtime.evaluate", { expression: args[1], awaitPromise: true, returnByValue: true })
  console.log(JSON.stringify(r.result.value ?? r.result.description, null, 2))
} else {
  const r = await appeler("Page.captureScreenshot", { format: "png" })
  await Bun.write(args[0] ?? "capture.png", Buffer.from(r.data, "base64"))
  console.log(`Capture enregistrée : ${args[0] ?? "capture.png"} (${page.url})`)
}
ws.close()
