# Le terminal

Le terminal est une fenêtre où l'on parle à l'ordinateur en tapant des commandes. Celui de ton harnais n'est pas une imitation : c'est le vrai terminal de ta machine (PowerShell sous Windows, bash ou zsh sous Mac et Linux), ouvert dans ton dossier `LeLabo`.

Les agents comme Claude Code travaillent surtout par là. Comprendre le terminal, c'est comprendre ce que fait ton IA quand elle « agit ».

## Les trois commandes de la mission

| Commande | Ce qu'elle fait | Sous PowerShell, elle s'appelle aussi |
| --- | --- | --- |
| `node --version` | Affiche la version de Node.js installée | — |
| `cd missions` | Entre dans le dossier `missions` | `Set-Location` |
| `ls` | Liste ce qu'il y a dans le dossier | `dir`, `Get-ChildItem` |

## À faire

1. Ouvre le terminal : dans la **zone de saisie** (là où tu écris à l'IA), tape `/terminal` puis Entrée. Le terminal apparaît en bas de la fenêtre, avec une invite qui ressemble à `PS C:\...\LeLabo>`. (Raccourci : Ctrl+`.)
2. **Clique dans le terminal**, puis tape `node --version` et Entrée. Tu dois voir un numéro qui commence par `v`.
3. Tape `cd missions` puis Entrée.
4. Tape `ls` puis Entrée : tu vois les dossiers de tes missions.

Attention : ces commandes se tapent **dans le terminal**, pas dans la conversation. Si tu les écris à l'IA, c'est elle qui les lance. Et le bouton « + » de la zone de saisie, avec son option « commande shell », ressemble à un terminal sans en être un : il lance la commande dans la conversation (tu verras « Shell utilisé »). Le harnais ne le voit pas, la mission ne compte que ce que tu tapes dans le vrai terminal.

Pendant cette mission, le terminal t'est prêté. Une fois les trois commandes faites, il est à toi pour toujours.

> **À retenir** : ton IA n'a pas encore accès au terminal. Pour l'instant, c'est ton outil à toi.
