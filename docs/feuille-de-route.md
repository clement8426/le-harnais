# Feuille de route

La source de vérité sur l'avancement. Une case cochée = fait et vérifié. Le plan complet et ses raisons sont dans [le document de conception](https://claude.ai/code/artifact/5b63229e-b312-4de0-882a-cd217d6d2801).

## Phase 0 · Faisabilité

- [x] Récupérer OpenCode v2.0.29 (`042d083`) et installer ses dépendances (Bun 1.4.3, 2 132 paquets)
- [x] Lancer l'application de bureau en mode développement sous Windows (interface déjà en français)
- [x] Trouver deux pièges Windows et leur parade (voir [docs/developper.md](developper.md))
- [x] Choisir comment voir les commandes de l'élève : lire la sortie du terminal, sans modifier OpenCode
- [x] Parler à une IA dans l'application : le modèle gratuit par défaut répond
- [x] Ajouter une extension « le-labo » aux extensions intégrées (patch de 7 lignes, `scripts/preparer.ts`) : l'onglet « Missions » s'affiche
- [x] Écrire un plugin qui retire des outils à l'IA selon les capacités (vérifié : sans capacité, l'IA ne voit plus que `question`)
- [x] Atelier `LeLabo` créé au premier lancement (patch 02)
- [x] Vérifier que le terminal lance PowerShell dans le dossier de l'élève
- [x] Vérifier le navigateur intégré et l'audit Lighthouse (missions « navigateur » et « audit-lighthouse » réussies dans l'application)
- [ ] Retirer Sentry et changer l'identifiant de l'application

## Phase 1 · Le moteur

- [x] Capacités, missions, parcours, chargement et validation des contenus
- [x] Vérificateur de parcours (`bun run verifier`)
- [x] Progression rangée par nom, états des missions (ouverte, nouvelle, réussie, mise à jour)
- [x] Preuves (10 types) et droits de l'IA (traduction en permissions OpenCode)
- [x] Contenus du parcours débutant (15 missions, 6 chapitres), vérifiés par les tests
- [x] Panneau des missions dans l'application : parcours, mission, cours, preuves, questions, indice
- [x] Plugin serveur : droits de l'IA, journal, validation automatique, RPC avec le panneau
- [x] Agent « prof » : consignes ajoutées au prompt système (mission en cours, preuves, droits)
- [x] Missions 1 à 5 jouées de bout en bout dans l'application (IA, questions, terminal PowerShell, lecture de fichier, permissions acceptées et refusées)
- [x] Allumer et éteindre les extensions selon les capacités (patch 03) : le terminal s'allume quand la mission le prête
- [x] Preuves du terminal : intégrations PowerShell et bash (patch 04)

## Phases suivantes

- [ ] Phase 2 · Poste de travail et web
- [ ] Phase 3 · Les sens et les extensions
  - [x] Outils des sens fournis par le plugin, calculés dans la fenêtre (patch 05)
  - [x] Missions « Dicter », « Écouter », « Lire un document » et « Voir une image » jouées dans l'application
- [ ] Phase 4 · Ouverture (macOS, contenus séparés, autres parcours)
