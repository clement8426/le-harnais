# Les plugins

Tu connais trois façons d'étendre un harnais :

| | C'est | Exemple |
| --- | --- | --- |
| Une skill | une recette, en texte | `compte-rendu` |
| Un connecteur MCP | une prise vers un programme extérieur | `chrome-devtools-mcp` |
| Un plugin | un paquet qui ajoute d'un coup des outils, des recettes et des règles | Graphify |

[Graphify](https://github.com/Graphify-Labs/graphify) (licence Apache-2.0) analyse un dossier **sur ton ordinateur, sans IA**, et en tire un graphe : quel fichier appelle quel autre, quel document parle de quel code. Il écrit un rapport (`GRAPH_REPORT.md`) avec les fichiers centraux et les liens inattendus. Ton IA le lit avant de chercher : elle sait où regarder au lieu de tout relire.

Ce n'est pas une mémoire de ce que contiennent tes fichiers, mais de **comment ils tiennent ensemble**.

## À faire

1. Demande : « Lance graphify update sur missions/plugins-graphify/fichiers/projet, puis dis-moi quel fichier est le plus central et pourquoi. » Accepte la commande.
2. Ouvre `graphify-out/GRAPH_REPORT.md` et parcours-le.
3. Réponds à la question du panneau.

> **À retenir** : un bon harnais n'est pas celui qui a le plus d'outils, mais celui qui sait où chercher.
