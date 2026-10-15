// Petites fonctions partagées.
export function arrondir(montant) {
  return Math.round(montant * 20) / 20 // arrondi aux 5 centimes
}

export function formaterChf(montant) {
  return `${montant.toFixed(2)} CHF`
}
