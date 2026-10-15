# Lire un document

La reconnaissance de texte (OCR, pour *optical character recognition*) lit le texte d'une image ou d'un PDF scanné. Ici, elle tourne sur ton ordinateur, avec Tesseract (licence Apache-2.0).

Elle se trompe : un tampon, une photocopie grise, une ligne penchée, et un 1 devient un 7, « Locle » devient « Loc|e ». Le cerveau, lui, ne voit jamais le scan : seulement le texte que tu as vérifié.

```text
  le scan  →  l'OCR (sur ton ordinateur)  →  tu relis et corriges  →  ton IA, le texte seul
```

## À faire

1. Demande : « Fais l'OCR de missions/lire-scan/fichiers/rapport-scan.pdf et écris le texte dans missions/lire-scan/rapport-corrige.md. » Accepte la création du fichier.
2. Ouvre le scan et `rapport-corrige.md` côte à côte. Le tampon « COPIE » cache une partie du texte : vérifie la date de naissance, la commune de l'employeur, le domicile et le numéro de sinistre.
3. Corrige ce qui est faux et enregistre.

> **À retenir** : relire n'est pas facultatif. Une date fausse dans un dossier, c'est un dossier faux.
