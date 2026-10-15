// Le calcul du prix, TVA comprise.
import { tauxTva } from "./taxes.js"
import { arrondir } from "./outils.js"

export function sousTotal(panier) {
  return panier.articles.reduce((somme, a) => somme + a.prix, 0)
}

export function total(panier) {
  return arrondir(sousTotal(panier) * (1 + tauxTva("restauration")))
}
