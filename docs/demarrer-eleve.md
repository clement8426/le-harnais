# Démarrer avec Le Harnais, de A à Z

Ce guide est pour toi qui découvres l'IA. Il te faut un ordinateur **Windows 10 ou 11**, une connexion internet, et un abonnement ChatGPT **ou** une clé d'API d'un fournisseur d'IA (ton formateur te dit lequel).

## 1. Installer

1. Télécharge `le-harnais-<version>-win-x64.zip` (ton formateur te donne le lien, ou la page *Releases* de ce dépôt).
2. Clic droit sur le fichier, **Extraire tout…**, et choisis un dossier simple, par exemple `C:\LeHarnais`.
3. Dans le dossier extrait, double-clique sur **`Lancer-Le-Harnais.bat`** (ou sur `Le Harnais.exe`, c'est la même chose).

Rien ne s'installe sur ton ordinateur : l'application vit dans ce dossier. Pour la retrouver, crée un raccourci vers le `.bat` sur ton bureau.

> **Premier lancement :** compte une trentaine de secondes. Si Windows affiche « Une stratégie de contrôle d'application a bloqué ce fichier », dis-le à ton formateur : [la page qui l'explique](formateur.md#si-windows-bloque-lapplication).

## 2. L'écran de départ

![L'écran de départ, avec la bande de bienvenue](images/01-ecran-de-depart.png)

Tu vois la zone de saisie (au centre) et, en bas, trois étapes. Le projet **LeLabo** est ton atelier : l'application l'a créé dans tes *Documents*. L'IA ne travaillera que là.

## 3. Brancher ton IA

Sous la zone de saisie, clique sur **le nom du modèle**. La liste des modèles s'ouvre.

![Le menu des modèles](images/02-menu-des-modeles.png)

En bas de la liste, **Gérer les modèles** ouvre les réglages où connecter un fournisseur (les intitulés exacts peuvent varier un peu selon la version). Choisis :

- **ChatGPT** si tu as un abonnement : une page de ton navigateur s'ouvre, clique sur *Autoriser*, puis reviens dans l'application ;
- ou **un fournisseur d'API** (Infomaniak, OpenRouter, OpenAI, Anthropic…) : colle ta clé.

Puis choisis un modèle de ce fournisseur dans le menu. Un abonnement Claude ne se branche pas ici : pour Claude, il faut une clé d'API.

> Le modèle « Gratuit » d'OpenCode **ne répond pas** dans Le Harnais. Si tu écris à l'IA avant de t'être branché, tu vois un message d'erreur : c'est normal, branche ton IA.

## 4. Écrire « Bonjour »

Écris ton premier message et envoie-le. **Le panneau des missions s'ouvre tout seul à droite.**

![Le panneau des missions et la carte d'accueil](images/03-premier-message.png)

À gauche, tu parles à l'IA. À droite, deux volets :

- **la liste des 15 missions**, rangée par chapitre. Les cadenas, ce sont les missions que tu n'as pas encore débloquées ;
- **la mission en cours** : ce qu'on t'explique, ce que le harnais vérifie (une case se coche quand c'est fait), des questions, et un indice si tu bloques.

## 5. Faire une mission

1. Clique sur **Commencer la mission**.
2. Lis le cours, puis fais ce qui est demandé (écrire à l'IA, lancer une commande, ouvrir un fichier…).
3. Les preuves se cochent toutes seules. Quand elles sont toutes vertes, un bandeau jaune annonce **Mission réussie** et la suivante s'ouvre.

Ton IA gagne un droit à chaque mission. Si elle veut faire quelque chose qu'elle n'a pas encore gagné (par exemple lire un fichier), le harnais le lui refuse et te l'explique.

> **Mission 3, le terminal :** pour l'ouvrir, tape `/terminal` puis Entrée dans la zone de saisie (le terminal s'ouvre en bas de la fenêtre). Les trois commandes se tapent **dans le terminal**, pas dans la conversation : si c'est l'IA qui les lance, ou si tu les passes par « + > commande shell » de la zone de saisie, la mission ne les compte pas.

![Le terminal ouvert par /terminal, en bas du panneau](images/t2-terminal-ouvert.png)

## 6. Les missions

| Mission | Ce que tu fais | Capture |
| --- | --- | --- |
| 1. Brancher ton IA | Brancher un modèle et recevoir sa première réponse | [voir](images/m01-brancher-ia.png) |
| 2. Qu'est-ce qu'un harnais ? | Comprendre ce qu'il y a autour d'un modèle | [voir](images/m02-harnais-c-est-quoi.png) |
| 3. Le terminal | Lancer trois vraies commandes | [voir](images/m03-terminal.png) |
| 4. Les fichiers | Explorer ton atelier, ouvrir un fichier | [voir](images/m04-fichiers.png) |
| 5. Ton IA agit, avec ton accord | Accepter ou refuser ce que l'IA propose | [voir](images/m05-ia-et-terminal.png) |
| 6. Dicter | Transformer une voix en texte, sur ton ordinateur | [voir](images/m06-dicter.png) |
| 7. Écouter | Faire lire un résumé à voix haute | [voir](images/m07-ecouter.png) |
| 8. Lire un document | Extraire le texte d'un scan, et le corriger | [voir](images/m08-lire-scan.png) |
| 9. Voir une image | Faire détecter les objets d'une photo | [voir](images/m09-voir-image.png) |
| 10. Le navigateur | Faire ouvrir une page à l'IA | [voir](images/m10-navigateur.png) |
| 11. L'audit Lighthouse | Mesurer la qualité d'un site | [voir](images/m11-audit-lighthouse.png) |
| 12. Les skills | Apprendre une recette à ton IA | [voir](images/m12-skills.png) |
| 13. Les connecteurs MCP | Brancher un outil externe | [voir](images/m13-mcp-lighthouse.png) |
| 14. Les plugins | Ajouter une mémoire au dossier de code | [voir](images/m14-plugins-graphify.png) |
| 15. Le défi final | Traiter un dossier complet de A à Z | [voir](images/m15-defi-dossier-exemple.png) |

![Dicter : la transcription arrive dans la conversation](images/a-dictee-transcription.png)

## 7. Quand ça ne marche pas

| Ce que tu vois | Ce qu'il faut faire |
| --- | --- |
| « OpenCode's free tier can only be used from within OpenCode » | Tu n'as pas branché ton IA : reprends l'étape 3 |
| Une mission ne se coche pas | Relis la preuve : elle dit ce qui manque. Ouvre « Je bloque : un indice » |
| L'IA répond qu'elle n'a pas le droit | C'est voulu : elle gagnera ce droit à une mission suivante |
| « Managed service port … is already in use » | Ferme complètement l'application (fenêtre et barre des tâches), attends 10 secondes, relance. Si ça persiste, redémarre l'ordinateur |
| La dictée ne démarre pas | Autorise le micro dans Windows (*Paramètres > Confidentialité > Microphone*). Le micro peut mettre quelques secondes à s'ouvrir |
| La première dictée ou lecture de scan est très lente | Normal : le modèle se télécharge la première fois (internet), puis il reste sur ton ordinateur |
| Un modèle local met plusieurs minutes à répondre | Normal sans carte graphique. Préfère ChatGPT ou une API |

## 8. Tes données

- Tout ce que tu fais est dans `Documents\LeLabo` (ton atelier) et dans `%APPDATA%\app.leharnais.desktop` (réglages et conversations).
- **Ce que tu écris à l'IA part chez son fournisseur** : regarde toujours où. Pour des données sensibles, préfère un fournisseur suisse (Infomaniak) ou un modèle local. C'est le sujet du défi final.
- La voix, la lecture de scans et la détection d'images **restent sur ton ordinateur**.
