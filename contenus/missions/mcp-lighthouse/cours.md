# Les connecteurs MCP

MCP (*Model Context Protocol*) est une **prise standard** : un programme extérieur expose des outils, et n'importe quel harnais compatible (Claude, ChatGPT, OpenCode, le tien) peut les brancher. Un agenda, une base de données, un navigateur.

Ici, tu branches [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp), le connecteur de l'équipe de Chrome (licence Apache-2.0). Il pilote son propre navigateur Chrome et sait lancer un audit Lighthouse (accessibilité, SEO, bonnes pratiques ; pas la performance).

```text
  ton IA  →  le harnais  →  la prise MCP  →  chrome-devtools-mcp  →  Chrome  →  la page
```

## À faire

1. Demande : « Avec le connecteur chrome-devtools, lance un audit Lighthouse de missions/navigateur/fichiers/tilleul/index.html. »
2. Ton IA te demande l'autorisation d'utiliser le connecteur : lis, puis accepte.
3. Compare le score avec celui de la mission précédente.
4. Réponds à la question du panneau.

> **À retenir** : un outil intégré appartient à un harnais ; un connecteur MCP se branche sur tous.
