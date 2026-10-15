// Le panneau des missions : le parcours numéroté, la mission en cours (cours, preuves, questions, indice),
// et le bouton pour commencer la suivante. Il parle au plugin serveur par RPC (voir contrat.ts).

import { createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import type { MountedSession } from "../sdk"
import { Contrat, type EtapeUI, type EtatUI } from "./contrat"
import { versHtml } from "./markdown"
import { STYLE } from "./style"

const ICONES: Record<EtapeUI["etat"], string> = {
  reussie: "✓",
  "mise-a-jour": "✓",
  "en-cours": "●",
  ouverte: "○",
  nouvelle: "✦",
  verrouillee: "🔒",
}

export default function Panneau(props: { session: MountedSession }) {
  const [etat, setEtat] = createSignal<EtatUI>()
  const [erreur, setErreur] = createSignal<string>()
  const [choisie, setChoisie] = createSignal<string>()
  const [annonce, setAnnonce] = createSignal<string>()
  const [indice, setIndice] = createSignal(false)

  const rpc = () => props.session.server.client.rpc(Contrat)
  const options = () => ({ location: { directory: props.session.directory } })

  const appliquer = (nouvel: unknown) => {
    const e = nouvel as EtatUI
    setEtat(e)
    setErreur(undefined)
    if (e.annonce) {
      setAnnonce(e.annonce)
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

            <Show when={affichee()}>{(m) => <Mission etape={m()} enCours={e().enCours === m().id} indice={indice()} montrerIndice={() => setIndice(!indice())} commencer={commencer} repondre={repondre} />}</Show>

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

function Mission(props: {
  etape: EtapeUI
  enCours: boolean
  indice: boolean
  montrerIndice: () => void
  commencer: (id: string) => void
  repondre: (question: string, reponse: number) => void
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
