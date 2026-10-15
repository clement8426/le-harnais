# Les skills

Une skill est une **recette** : un fichier `SKILL.md` qui explique à ton IA comment faire une tâche précise, à ta façon. Elle a un nom et une description ; ton IA voit la liste des descriptions, et charge la recette complète seulement quand le sujet se présente.

C'est le même format que dans Claude Code : une skill écrite ici fonctionne là-bas, dans `.claude/skills/`.

```text
.opencode/skills/
└── compte-rendu/
    └── SKILL.md      le nom, la description, puis la recette
```

## À faire

1. Ouvre le modèle `missions/skills/fichiers/SKILL.md` et lis-le.
2. Demande à ton IA : « Copie ce fichier dans .opencode/skills/compte-rendu/SKILL.md. » Accepte.
3. Demande : « Fais le compte rendu de missions/ecouter/fichiers/compte-rendu.txt. »
4. Dans le fil, repère l'appel de l'outil `skill` : ton IA a chargé ta recette d'elle-même.

> **À retenir** : une skill, c'est du texte. Pas de code : n'importe qui peut en écrire une.
