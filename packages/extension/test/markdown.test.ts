import { describe, expect, test } from "bun:test"
import { versHtml } from "../src/markdown"

describe("markdown des cours", () => {
  test("titres, paragraphes, listes, citations", () => {
    const html = versHtml("# Titre\n\nUn **mot** et du `code`.\n\n1. un\n2. deux\n\n- a\n- b\n\n> **À retenir** : ceci.")
    expect(html).toContain("<h2>Titre</h2>")
    expect(html).toContain("<p>Un <strong>mot</strong> et du <code>code</code>.</p>")
    expect(html).toContain("<ol><li>un</li><li>deux</li></ol>")
    expect(html).toContain("<ul><li>a</li><li>b</li></ul>")
    expect(html).toContain("<blockquote><strong>À retenir</strong> : ceci.</blockquote>")
  })

  test("tableaux et blocs de code", () => {
    const html = versHtml("| A | B |\n| --- | --- |\n| 1 | `x` |\n\n```text\n<pas de html>\n```")
    expect(html).toContain("<thead><tr><th>A</th><th>B</th></tr></thead>")
    expect(html).toContain("<td><code>x</code></td>")
    expect(html).toContain("<pre><code>&lt;pas de html&gt;</code></pre>")
  })

  test("le HTML d'un cours est échappé, et seuls les liens http(s) deviennent des liens", () => {
    const html = versHtml('<script>alert(1)</script> [ok](https://exemple.ch) [non](javascript:alert(1))')
    expect(html).not.toContain("<script>")
    expect(html).toContain('<a href="https://exemple.ch"')
    expect(html).not.toContain('href="javascript')
  })

  test("tous les cours du dépôt se convertissent", () => {
    const { readdirSync, readFileSync } = require("node:fs")
    const racine = require("node:path").join(import.meta.dir, "../../../contenus/missions")
    for (const m of readdirSync(racine)) expect(versHtml(readFileSync(`${racine}/${m}/cours.md`, "utf8")).length).toBeGreaterThan(100)
  })
})
