// Un petit convertisseur Markdown → HTML, juste ce qu'il faut pour les cours des missions :
// titres, paragraphes, listes (puces et numérotées), citations, blocs de code, tableaux, gras, code et liens.
// Tout le texte est échappé avant mise en forme : un cours ne peut pas injecter de HTML.

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function enLigne(t: string) {
  return echapper(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

export function versHtml(markdown: string) {
  const lignes = markdown.replace(/\r\n/g, "\n").split("\n")
  const sortie: string[] = []
  let i = 0
  while (i < lignes.length) {
    const ligne = lignes[i]!
    if (!ligne.trim()) {
      i++
      continue
    }
    if (ligne.startsWith("```")) {
      const bloc: string[] = []
      i++
      while (i < lignes.length && !lignes[i]!.startsWith("```")) bloc.push(lignes[i++]!)
      i++
      sortie.push(`<pre><code>${echapper(bloc.join("\n"))}</code></pre>`)
      continue
    }
    const titre = /^(#{1,4})\s+(.*)$/.exec(ligne)
    if (titre) {
      const niveau = Math.min(titre[1]!.length + 1, 5)
      sortie.push(`<h${niveau}>${enLigne(titre[2]!)}</h${niveau}>`)
      i++
      continue
    }
    if (ligne.startsWith("|")) {
      const rangees: string[][] = []
      while (i < lignes.length && lignes[i]!.startsWith("|")) {
        const cellules = lignes[i]!.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
        if (!cellules.every((c) => /^:?-+:?$/.test(c))) rangees.push(cellules)
        i++
      }
      const [tete, ...corps] = rangees
      sortie.push(
        `<table><thead><tr>${(tete ?? []).map((c) => `<th>${enLigne(c)}</th>`).join("")}</tr></thead><tbody>${corps
          .map((r) => `<tr>${r.map((c) => `<td>${enLigne(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`,
      )
      continue
    }
    if (ligne.startsWith(">")) {
      const bloc: string[] = []
      while (i < lignes.length && lignes[i]!.startsWith(">")) bloc.push(lignes[i++]!.replace(/^>\s?/, ""))
      sortie.push(`<blockquote>${enLigne(bloc.join(" "))}</blockquote>`)
      continue
    }
    const puce = /^\s*[-*]\s+/
    const numero = /^\s*\d+\.\s+/
    if (puce.test(ligne) || numero.test(ligne)) {
      const ordonnee = numero.test(ligne)
      const motif = ordonnee ? numero : puce
      const items: string[] = []
      while (i < lignes.length && motif.test(lignes[i]!)) items.push(lignes[i++]!.replace(motif, ""))
      const balise = ordonnee ? "ol" : "ul"
      sortie.push(`<${balise}>${items.map((it) => `<li>${enLigne(it)}</li>`).join("")}</${balise}>`)
      continue
    }
    const paragraphe: string[] = []
    while (i < lignes.length && lignes[i]!.trim() && !/^(#|```|\||>|\s*[-*]\s|\s*\d+\.\s)/.test(lignes[i]!)) paragraphe.push(lignes[i++]!)
    sortie.push(`<p>${enLigne(paragraphe.join(" "))}</p>`)
  }
  return sortie.join("\n")
}
