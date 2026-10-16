// Le panneau des missions : le parcours numéroté, la mission en cours (cours, preuves, questions, indice),
// et le bouton pour commencer la suivante. Il parle au plugin serveur par RPC (voir contrat.ts).

import { createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import type { MountedSession } from "../sdk"
import { Contrat, type EtapeUI, type EtatUI } from "./contrat"
import { versHtml } from "./markdown"
import { copier, enregistrer, transcrireSon } from "./micro"
import { STYLE } from "./style"

const ICONES: Record<EtapeUI["etat"], string> = {
  reussie: "✓",
  "mise-a-jour": "✓",
  "en-cours": "●",
  ouverte: "○",
  nouvelle: "✦",
  verrouillee: "🔒",
}

/** Le navigateur d'OpenCode, quand son extension est allumée. */
type Navigateur = () => { status: string; value?: { openFile(session: MountedSession, path: string): void } }

export default function Panneau(props: { session: MountedSession; navigateur: Navigateur; statutSens: () => string | undefined }) {
  const [etat, setEtat] = createSignal<EtatUI>()
  const [erreur, setErreur] = createSignal<string>()
  const [choisie, setChoisie] = createSignal<string>()
  const [annonce, setAnnonce] = createSignal<string>()
  const [indice, setIndice] = createSignal(false)

  const rpc = () => props.session.server.client.rpc(Contrat)
  const options = () => ({ location: { directory: props.session.directory } })

  // La dernière réussite connue à l'ouverture du panneau : seules les suivantes sont fêtées.
  let fetee: string | undefined
  let premier = true
  const appliquer = (nouvel: unknown) => {
    const e = nouvel as EtatUI
    setEtat(e)
    setErreur(undefined)
    const reussite = e.derniereReussite
    if (premier) fetee = reussite?.quand
    premier = false
    if (reussite && reussite.quand !== fetee) {
      fetee = reussite.quand
      // Une mission vient d'être réussie : on la fête, puis on montre la suivante.
      setChoisie(undefined)
      setAnnonce(`Mission réussie : ${reussite.titre}${/[.?!]$/.test(reussite.titre) ? "" : "."}`)
      setTimeout(() => setAnnonce(undefined), 6000)
    }
  }
  const echec = (e: unknown) => setErreur(e instanceof Error ? e.message : String(e))
  const recharger = () => rpc().etat({}, options()).then(appliquer, echec)

  recharger()
  const arreter = rpc().events.on("change", () => void recharger())
  onCleanup(arreter)

  // La mission affichée : celle choisie dans la liste, sinon celle en cours, sinon la prochaine.
  const affichee = createMemo(() => {
    const e = etat()
    if (!e) return undefined
    const id = choisie() ?? e.enCours ?? e.prochaine
    return e.etapes.find((x) => x.id === id) ?? e.etapes[0]
  })
  const reussies = () => etat()?.etapes.filter((e) => e.etat === "reussie" || e.etat === "mise-a-jour").length ?? 0

  const commencer = (id: string) => {
    setIndice(false)
    setChoisie(id)
    rpc().commencer({ mission: id }, options()).then(appliquer, echec)
  }
  const repondre = (question: string, reponse: number) => rpc().repondre({ question, reponse }, options()).then(appliquer, echec)
  const navigateurPret = () => props.navigateur().status === "active"
  const ouvrirPage = (page: string) => {
    props.navigateur().value?.openFile(props.session, page)
    rpc().page({ url: page }, options()).then(recharger, echec)
  }

  return (
    <div class="lh">
      <style>{STYLE}</style>
      <Show when={erreur()}>
        <p class="lh-erreur">Le Harnais ne répond pas : {erreur()}</p>
      </Show>
      <Show when={annonce()}>
        <div class="lh-annonce" role="status">
          {annonce()}
        </div>
      </Show>
      <Show when={props.statutSens()}>
        <p class="lh-sens" role="status">
          {props.statutSens()}
        </p>
      </Show>
      <Show when={etat()} fallback={<p class="lh-discret">Chargement de ton parcours…</p>}>
        {(e) => (
          <>
            <header class="lh-tete">
              <div class="lh-bande" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <h2>{e().parcours?.titre}</h2>
              <p class="lh-discret">
                {reussies()} mission{reussies() > 1 ? "s" : ""} réussie{reussies() > 1 ? "s" : ""} sur {e().etapes.length}
              </p>
              <div class="lh-progres" aria-hidden="true">
                <span style={{ width: `${(100 * reussies()) / Math.max(1, e().etapes.length)}%` }} />
              </div>
            </header>

            <Show when={reussies() === 0 && !e().enCours}>
              <Accueil />
            </Show>

            <Show when={e().capacites.includes("voix.dicter")}>
              <Dictee />
            </Show>

            <Show when={affichee()}>
              {(m) => (
                <Mission
                  etape={m()}
                  enCours={e().enCours === m().id}
                  indice={indice()}
                  montrerIndice={() => setIndice(!indice())}
                  commencer={commencer}
                  repondre={repondre}
                  ouvrirPage={navigateurPret() ? ouvrirPage : undefined}
                />
              )}
            </Show>

            <nav class="lh-parcours" aria-label="Le parcours">
              <For each={e().etapes}>
                {(etape, i) => (
                  <>
                    <Show when={i() === 0 || e().etapes[i() - 1]!.chapitre.id !== etape.chapitre.id}>
                      <p class="lh-chapitre">{etape.chapitre.titre}</p>
                    </Show>
                    <button
                      type="button"
                      class={`lh-etape lh-${etape.etat}`}
                      aria-current={affichee()?.id === etape.id ? "step" : undefined}
                      disabled={etape.etat === "verrouillee"}
                      onClick={() => {
                        setIndice(false)
                        setChoisie(etape.id)
                      }}
                    >
                      <span class="lh-noeud" aria-hidden="true">
                        {ICONES[etape.etat]}
                      </span>
                      <span class="lh-numero">{etape.numero}</span>
                      <span class="lh-titre">{etape.titre}</span>
                    </button>
                  </>
                )}
              </For>
            </nav>
          </>
        )}
      </Show>
    </div>
  )
}

const LIBELLES_DICTEE = {
  repos: "🎙 Dicter un message",
  ouverture: "Ouverture du micro…",
  ecoute: "■ Arrêter et transcrire",
  calcul: "Transcription sur ton ordinateur…",
}

/** L'explication du départ, tant qu'aucune mission n'est réussie : comment ça va se passer. */
function Accueil() {
  return (
    <section class="lh-accueil" aria-labelledby="lh-accueil-titre">
      <h2 id="lh-accueil-titre">Bienvenue dans Le Harnais</h2>
      <p>
        Ton IA arrive avec ses outils <strong>verrouillés</strong>. Tu les débloques un par un, en t'en servant pour de vrai.
        Ici, à droite, tu suis les missions. À gauche, tu parles à l'IA.
      </p>
      <ol>
        <li>
          <strong>Branche ton IA.</strong> Sous la zone de saisie, à gauche, clique sur le nom du modèle, puis connecte ton
          abonnement ChatGPT ou une clé d'API.
        </li>
        <li>
          <strong>Commence la mission</strong> proposée ci-dessous : elle te dit quoi faire, et ce que le harnais vérifie.
        </li>
        <li>
          <strong>Écris un message à l'IA.</strong> La mission se valide toute seule, et la suivante s'ouvre.
        </li>
      </ol>
    </section>
  )
}

/** Dicter un message : le micro, Whisper sur l'ordinateur, puis le presse-papiers. L'élève colle et envoie lui-même. */
function Dictee() {
  const [phase, setPhase] = createSignal<"repos" | "ouverture" | "ecoute" | "calcul">("repos")
  const [texte, setTexte] = createSignal<string>()
  const [message, setMessage] = createSignal<string>()
  let arreter: (() => Promise<Uint8Array<ArrayBuffer>>) | undefined
  const rate = (quoi: string) => (e: unknown) => {
    setPhase("repos")
    setMessage(`${quoi} (${e instanceof Error ? e.message.replace(/\.$/, "") : String(e)}).`)
    return undefined
  }
  const copierTexte = async () => {
    const t = texte()
    if (!t) return
    setMessage(
      (await copier(t))
        ? "Copié. Colle-le dans la zone de saisie (Ctrl+V), relis, puis envoie."
        : "Sélectionne le texte et copie-le (Ctrl+C), puis colle-le dans la zone de saisie.",
    )
  }
  const basculer = async () => {
    if (phase() === "repos") {
      setMessage(undefined)
      setTexte(undefined)
      // Certains micros mettent plusieurs secondes à s'ouvrir : le bouton le dit, pour que l'élève ne reclique pas.
      setPhase("ouverture")
      arreter = await enregistrer().catch(rate("Le micro ne s'ouvre pas : vérifie qu'il est branché et autorisé"))
      if (arreter) setPhase("ecoute")
      return
    }
    if (phase() !== "ecoute" || !arreter) return
    setPhase("calcul")
    const resultat = await transcrireSon(await arreter()).catch(rate("La transcription a échoué"))
    if (resultat === undefined) return
    setPhase("repos")
    if (!resultat) return setMessage("Je n'ai rien entendu. Rapproche-toi du micro et recommence.")
    setTexte(resultat)
    await copierTexte()
  }
  return (
    <div class="lh-dictee">
      <button type="button" class="lh-bouton lh-second" aria-pressed={phase() === "ecoute"} disabled={phase() === "ouverture" || phase() === "calcul"} onClick={() => void basculer()}>
        {LIBELLES_DICTEE[phase()]}
      </button>
      <Show when={texte()}>
        <textarea class="lh-texte-dicte" readonly rows={3} aria-label="Le texte dicté" value={texte()} />
        <button type="button" class="lh-bouton lh-second" onClick={() => void copierTexte()}>
          Copier
        </button>
      </Show>
      <Show when={message()}>
        <p class="lh-discret" role="status">
          {message()}
        </p>
      </Show>
    </div>
  )
}

function Mission(props: {
  etape: EtapeUI
  enCours: boolean
  indice: boolean
  montrerIndice: () => void
  commencer: (id: string) => void
  repondre: (question: string, reponse: number) => void
  ouvrirPage?: (page: string) => void
}) {
  const e = () => props.etape
  const demarrable = () => e().etat === "ouverte" || e().etat === "nouvelle"
  return (
    <section class="lh-mission" aria-labelledby="lh-mission-titre">
      <p class="lh-pastille">
        Mission {e().numero} · {e().chapitre.titre}
      </p>
      <h3 id="lh-mission-titre">{e().titre}</h3>
      <p class="lh-resume">{e().resume}</p>

      <Show when={demarrable()}>
        <button type="button" class="lh-bouton" onClick={() => props.commencer(e().id)}>
          Commencer la mission
        </button>
      </Show>
      <Show when={e().etat === "reussie" || e().etat === "mise-a-jour"}>
        <p class="lh-reussie">✓ Mission réussie{e().etat === "mise-a-jour" ? " (son contenu a été mis à jour depuis)" : ""}.</p>
      </Show>

      <Show when={props.enCours && e().page && props.ouvrirPage}>
        <button type="button" class="lh-bouton lh-second" onClick={() => props.ouvrirPage!(e().page!)}>
          Ouvrir la page dans le navigateur
        </button>
      </Show>

      <Show when={props.enCours && e().preuves}>
        <h4>Ce que le harnais vérifie</h4>
        <ul class="lh-preuves">
          <For each={e().preuves}>
            {(p) => (
              <li class={p.ok ? "lh-vert" : "lh-rouge"}>
                <span aria-hidden="true">{p.ok ? "✓" : "○"}</span> {p.detail}
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={props.enCours && e().questions.length}>
        <For each={e().questions}>
          {(q) => (
            <fieldset class="lh-question">
              <legend>{q.enonce}</legend>
              <For each={q.choix}>
                {(choix, i) => (
                  <label>
                    <input type="radio" name={`lh-${q.id}`} onChange={() => props.repondre(q.id, i())} /> {choix}
                  </label>
                )}
              </For>
            </fieldset>
          )}
        </For>
      </Show>

      <Show when={props.enCours}>
        <button type="button" class="lh-lien" onClick={props.montrerIndice}>
          {props.indice ? "Cacher l'indice" : "Je bloque : un indice"}
        </button>
        <Show when={props.indice}>
          <p class="lh-indice">{e().indice}</p>
        </Show>
      </Show>

      <Show when={e().cours}>
        <details class="lh-cours" open={props.enCours || demarrable()}>
          <summary>Le cours</summary>
          <div innerHTML={versHtml(e().cours!)} />
        </details>
      </Show>
    </section>
  )
}
