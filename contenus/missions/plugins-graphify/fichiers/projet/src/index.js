// La boutique de Tilleul (fictive) : point d'entrée.
import { creerPanier, ajouter } from "./panier.js"
import { total } from "./prix.js"
import { afficherTicket } from "./affichage.js"

const panier = creerPanier()
ajouter(panier, { nom: "Tarte aux pommes", prix: 6.5 })
ajouter(panier, { nom: "Thé vert de saison", prix: 4.8 })
afficherTicket(panier, total(panier))
