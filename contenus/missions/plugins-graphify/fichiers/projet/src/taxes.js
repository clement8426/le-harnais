// Les taux de TVA suisses (fictifs pour l'exercice).
const TAUX = { restauration: 0.081, emporter: 0.026 }

export function tauxTva(categorie) {
  return TAUX[categorie] ?? 0
}
