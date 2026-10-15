# Écrire, déplacer ou insérer une mission

Une mission est un dossier dans `contenus/missions/<nom>/`. Elle ne porte jamais de numéro : sa place est décidée par le parcours (`contenus/parcours/*.yaml`). Après chaque changement, lance `bun run verifier`.

## Déplacer une mission ou un chapitre

Coupe la ligne (ou le bloc du chapitre) dans `contenus/parcours/debutant.yaml` et colle-la ailleurs. Les numéros se recalculent. La progression des élèves est rangée par nom : personne ne perd rien, et une mission placée avant d'autres déjà réussies apparaît comme « nouvelle », facultative.

Si l'ordre devient impossible, le vérificateur refuse et explique :

```text
✗ « lire-scan » a besoin de « fichiers.ia.lire », débloquée par « fichiers », qui vient après. Déplacez l'une des deux.
```

## Insérer une mission

1. Crée `contenus/missions/<nom>/` avec `mission.yaml` et `cours.md` (et `fichiers/` si besoin).
2. Ajoute `<nom>` à la bonne place dans le parcours.
3. `bun run verifier`.

## Le fichier `mission.yaml`

```yaml
id: dicter                     # le nom du dossier, obligatoirement
titre: Dicter
version: 1                     # à augmenter si la mission change beaucoup : l'élève la voit « mise à jour »
resume: Une phrase.
requiert: [chat]               # capacités nécessaires avant de commencer
prete: [voix.dicter]           # capacités prêtées pendant la mission (pour pouvoir s'en servir)
debloque: [voix.dicter]        # capacités gagnées une fois toutes les preuves vertes
preuves:                       # toutes doivent être vertes
  - type: outil.appel
    outil: transcrire
    arguments: { fichier: note-vocale.wav }
questions: []                  # pour les preuves de type « question »
indice: Ce qu'on dit à l'élève bloqué.
os: [windows, macos]           # facultatif : masque la mission ailleurs
```

Les capacités sont définies dans `contenus/capacites.yaml`, avec ce qu'elles allument concrètement (extensions, permissions de l'IA, outils). Une mission ne parle jamais d'OpenCode : seulement de capacités.

## Les preuves

| Type | Vérifie | Champs |
| --- | --- | --- |
| `ia.reponse` | L'IA a répondu (éventuellement depuis certains fournisseurs) | `fournisseurs` (facultatif) |
| `outil.appel` | L'IA a utilisé tel outil, sans erreur | `outil`, `arguments` (facultatif, comparaison partielle, sans casse) |
| `outil.resultat` | Le résultat d'un outil contient des mots | `outil`, `contient` |
| `permission.demandee` | L'IA a demandé un droit, et l'élève a répondu | `outil`, `acceptee` (facultatifs) |
| `fichier.existe` | Un fichier existe dans le dossier de l'élève | `chemin` |
| `fichier.contient` | Un fichier contient des mots (sans accents ni casse) | `chemin`, `contient` |
| `audit.score` | Un audit Lighthouse a été produit | `categorie` |
| `question` | L'élève a bien répondu à une question | `id` (défini dans `questions`) |
| `terminal.commande` | L'élève a tapé une commande dans son terminal, et elle a réussi | `motif` (expression régulière) |
| `navigateur.page` | L'élève a ouvert une page | `motif` |

Seuls les événements survenus depuis le début de la mission comptent. Les chemins sont relatifs au dossier `LeLabo` de l'élève.

## Le cours

`cours.md` est court : ce que c'est, un schéma en texte, « À faire » en étapes numérotées, et une phrase « À retenir ». On tutoie l'élève.
