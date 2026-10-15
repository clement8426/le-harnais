// Le ticket de caisse.
import { formaterChf } from "./outils.js"
import { sousTotal } from "./prix.js"

export function afficherTicket(panier, montant) {
  panier.articles.forEach((a) => console.log(`${a.nom.padEnd(24)} ${formaterChf(a.prix)}`))
  console.log(`Sous-total               ${formaterChf(sousTotal(panier))}`)
  console.log(`Total TVA comprise       ${formaterChf(montant)}`)
}
