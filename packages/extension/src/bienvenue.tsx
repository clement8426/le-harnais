// La bande d'accueil de l'écran de départ, avant la première conversation : comment ça va se passer.
// Le panneau des missions n'existe qu'une fois la conversation commencée (OpenCode n'a pas encore de session),
// c'est pourquoi on l'annonce ici.

import { STYLE } from "./style"

export default function Bienvenue() {
  return (
    <div class="lh-bienvenue" role="region" aria-label="Bienvenue dans Le Harnais">
      <style>{STYLE}</style>
      <p class="lh-bienvenue-titre">Bienvenue dans Le Harnais</p>
      <ol>
        <li>
          <strong>Branche ton IA.</strong> Clique sur le nom du modèle, juste sous la zone de saisie : connecte ton abonnement ChatGPT ou une clé d'API.
        </li>
        <li>
          <strong>Écris « Bonjour ».</strong> Dès ton premier message, le panneau des missions s'ouvre à droite.
        </li>
        <li>
          <strong>Suis les missions.</strong> Elles te disent quoi faire, et chaque outil de ton IA se débloque quand tu réussis la mission.
        </li>
      </ol>
    </div>
  )
}
