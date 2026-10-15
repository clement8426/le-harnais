// Le panier : une liste d'articles.
import { verifierArticle } from "./validation.js"

export function creerPanier() {
  return { articles: [] }
}

export function ajouter(panier, article) {
  verifierArticle(article)
  panier.articles.push(article)
}
