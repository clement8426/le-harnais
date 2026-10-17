// La bande d'accueil de l'écran de départ, avant la première conversation : comment ça va se passer.
// Le panneau des missions n'existe qu'une fois la conversation commencée (OpenCode n'a pas encore de session),
// c'est pourquoi on l'annonce ici.

import { STYLE } from "./style"

export default function Bienvenue() {
  return (
    <div class="lh-bienvenue" role="region" aria-label="Bienvenue dans Le Harnais">
      <style>{STYLE}</style>
      <p class="lh-bienvenue-titre">Bienvenue dans Le Harnais. Tu commences ici, en trois étapes :</p>
      <ol>
        <li>
          <strong>Branche ton IA.</strong> En bas de la zone de saisie, clique sur le nom du modèle (à gauche, sous « Demandez n’importe quoi… »), puis connecte ton abonnement ChatGPT ou une clé d’API.
        </li>
        <li>
          <strong>Écris « Bonjour »</strong> dans la zone de saisie au centre de l’écran, puis appuie sur Entrée. Le panneau des missions s’ouvre alors à droite.
        </li>
        <li>
          <strong>Suis les missions.</strong> Chacune te dit quoi faire. Quand tu la réussis, un outil de ton IA se débloque.
        </li>
      </ol>
    </div>
  )
}
