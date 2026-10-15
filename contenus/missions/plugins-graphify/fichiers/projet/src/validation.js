// Refuse un article mal formé avant qu'il n'entre dans le panier.
export function verifierArticle(article) {
  if (!article?.nom || typeof article.prix !== "number" || article.prix < 0) {
    throw new Error("Article invalide")
  }
}
