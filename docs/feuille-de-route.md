# Feuille de route

La source de vérité sur l'avancement. Une case cochée = fait et vérifié. Le plan complet et ses raisons sont dans [le document de conception](https://claude.ai/code/artifact/5b63229e-b312-4de0-882a-cd217d6d2801).

## Phase 0 · Faisabilité

- [x] Récupérer OpenCode v2.0.29 (`042d083`) et installer ses dépendances (Bun 1.4.3, 2 132 paquets)
- [x] Lancer l'application de bureau en mode développement sous Windows (interface déjà en français)
- [x] Trouver deux pièges Windows et leur parade (voir [docs/developper.md](developper.md))
- [x] Choisir comment voir les commandes de l'élève : lire la sortie du terminal, sans modifier OpenCode
- [ ] Vérifier que le terminal lance PowerShell dans le dossier de l'élève
- [ ] Vérifier le navigateur intégré et l'audit Lighthouse
- [ ] Ajouter une extension « le-labo » aux extensions intégrées (premier patch)
- [ ] Écrire un plugin qui retire un outil à l'IA, puis le lui rend
- [ ] Retirer Sentry et changer l'identifiant de l'application

## Phase 1 · Le moteur

- [x] Capacités, missions, parcours, chargement et validation des contenus
- [x] Vérificateur de parcours (`bun run verifier`)
- [x] Progression rangée par nom, états des missions (ouverte, nouvelle, réussie, mise à jour)
- [x] Preuves (10 types) et droits de l'IA (traduction en permissions OpenCode)
- [x] Lecture des commandes dans l'affichage du terminal
- [ ] Contenus du parcours débutant (15 missions)
- [ ] Panneau des missions dans l'application
- [ ] Journal alimenté par le plugin et l'extension
- [ ] Agent « prof »

## Phases suivantes

- [ ] Phase 2 · Poste de travail et web
- [ ] Phase 3 · Les sens et les extensions
- [ ] Phase 4 · Ouverture (macOS, contenus séparés, autres parcours)
