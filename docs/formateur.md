# Guide du formateur

Comment préparer et animer une séance avec Le Harnais.

## Ce qu'il faut

**Sur chaque ordinateur d'élève**

- Windows 10 ou 11, 64 bits. macOS n'est pas encore pris en charge.
- 8 Go de mémoire vive conseillés, environ 3 Go d'espace disque (l'application, plus les modèles de voix et d'image téléchargés à la première utilisation).
- Une connexion internet.
- Un micro, pour la mission « Dicter » et la dictée de messages. Des haut-parleurs ou un casque, pour « Écouter ».
- Aucun droit d'administrateur : l'application ne s'installe pas, elle s'exécute depuis son dossier.

**Pour l'IA** : chaque élève doit pouvoir brancher un modèle. Trois voies, à choisir avant la séance :

| Voie | Pour qui | Coût | Remarque |
| --- | --- | --- | --- |
| Abonnement ChatGPT | Ceux qui en ont un | Rien de plus | Le plus simple : connexion par le navigateur |
| Clé d'API (Infomaniak, OpenRouter, OpenAI, Anthropic) | Toute la classe | À l'usage, très faible | Prépare des clés ou fais-en créer en séance |
| Modèle local (Ollama, LM Studio) | Ceux qui ne veulent rien envoyer en ligne | Gratuit | Lent sans carte graphique : plusieurs minutes avant la première réponse |

Un abonnement **Claude** ne se branche pas : il faut une clé d'API.

> Le modèle gratuit d'OpenCode **ne fonctionne pas** dans Le Harnais : OpenCode le réserve à ses propres applications.

## Le défi final et la confidentialité

La dernière mission traite un dossier médical **fictif**. Elle exige que l'IA soit hébergée en Suisse (Infomaniak) ou tourne sur l'ordinateur, pour faire vivre la règle : *regarde où part ce que tu écris*. Avec un fournisseur américain, la première preuve reste rouge. Si ta classe n'a pas de clé suisse, tu peux assouplir cette preuve dans `contenus/missions/defi-dossier-exemple/mission.yaml` (liste `fournisseurs`).

## Distribuer l'application

1. `bun scripts/empaqueter.ts` construit `le-harnais-<version>-win-x64.zip` (voir [developper.md](developper.md)).
2. Publie-le (page *Releases* du dépôt, ou un partage de ton choix). L'archive pèse environ 0,8 Go.
3. Les élèves la décompressent et lancent `Lancer-Le-Harnais.bat`. Le guide à leur donner : [demarrer-eleve.md](demarrer-eleve.md).

## Si Windows bloque l'application

Le Harnais n'est pas signé. Le **contrôle intelligent des applications** de Windows 11 peut refuser de lancer un programme non signé qu'il ne connaît pas, avec le message : *« Une stratégie de contrôle d'application a bloqué ce fichier »*.

Ce que fait le projet pour l'éviter : l'exécutable de l'application est **l'exécutable officiel d'Electron, sans aucune modification** (même empreinte), que Windows connaît. Mais le serveur embarqué (`resources\opencode-cli.exe`) est construit par nous et n'est pas signé, donc rien ne le garantit sur tous les postes.

Si un poste refuse malgré tout :

- vérifie d'abord que le dossier a été **entièrement extrait** (pas lancé depuis l'archive) ;
- sinon, ce contrôle ne se désactive que dans *Sécurité Windows > Contrôle des applications et du navigateur > Contrôle intelligent des applications*, et il ne se réactive plus ensuite sans réinstaller Windows : à décider en connaissance de cause, sur des postes de formation ;
- la vraie solution est de **signer** l'application : c'est la question 4 de [questions.md](questions.md).

## Adapter le contenu

- **Réordonner ou insérer une mission** : change une ligne dans `contenus/parcours/debutant.yaml`. Lance `bun run verifier` : il refuse un ordre impossible et dit pourquoi.
- **Écrire une mission** : [ecrire-une-mission.md](ecrire-une-mission.md) (champs, preuves possibles, exemples).
- **Faire un autre parcours** : copie `debutant.yaml`, change les missions, et indique-le dans l'atelier (`.labo/harnais.json`).

## Pendant la séance

- La progression est **par ordinateur** (dans `Documents\LeLabo\.labo`). Il n'y a pas de tableau de bord formateur pour l'instant (question 6).
- Si un élève bloque : « Je bloque : un indice », dans la mission. Le « prof » (l'IA) a aussi connaissance de la mission en cours.
- Pour repartir de zéro sur un poste, ferme l'application et supprime `Documents\LeLabo` et `%APPDATA%\app.leharnais.desktop`.
