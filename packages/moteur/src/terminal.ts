// Retrouve les commandes de l'élève dans les lignes affichées par son terminal.
// L'extension rend le flux du terminal dans un terminal invisible (les retouches de PowerShell pendant la frappe
// sont donc déjà appliquées), puis passe ici les lignes telles qu'elles s'affichent.
// Une commande est « terminée » quand une nouvelle invite apparaît après elle : sa sortie est entre les deux.

export interface CommandeLue {
  commande: string
  sortie: string
}

// Les invites reconnues, de la plus précise à la plus large. Le groupe 1 est ce que l'élève a tapé.
const INVITES = [
  /^PS [^>\n]*>\s?(.*)$/, // PowerShell : « PS C:\Users\Clem> »
  /^[A-Za-z]:\\[^>\n]*>(.*)$/, // Invite de commandes : « C:\Users\Clem> »
  /^[^\s@]+@[^\s:]+:[^$#\n]*[$#]\s(.*)$/, // bash, zsh : « clem@poste:~/LeLabo$ »
  /^[$#%]\s(.*)$/, // Git Bash (l'invite tient sur deux lignes, la seconde commence par « $ »)
]

export function lireInvite(ligne: string): string | undefined {
  for (const invite of INVITES) {
    const m = invite.exec(ligne.trimEnd())
    if (m) return (m[1] ?? "").trim()
  }
  return undefined
}

/** Les commandes terminées, dans l'ordre. Une invite vide (Entrée seule) n'est pas une commande. */
export function extraireCommandes(lignes: string[]): CommandeLue[] {
  const invites = lignes.flatMap((ligne, i) => {
    const commande = lireInvite(ligne)
    return commande === undefined ? [] : [{ i, commande }]
  })
  return invites.slice(0, -1).flatMap((invite, n) => {
    if (!invite.commande) return []
    const suivante = invites[n + 1]!.i
    const sortie = lignes
      .slice(invite.i + 1, suivante)
      .map((l) => l.trimEnd())
      .join("\n")
      .trim()
    return [{ commande: invite.commande, sortie }]
  })
}
