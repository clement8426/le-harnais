// Le panneau des missions. Première version : vérifie que l'extension est bien chargée dans l'application.

import type { MountedSession } from "../sdk"

export default function Panneau(props: { session: MountedSession }) {
  return (
    <section style={{ padding: "16px" }}>
      <h2 style={{ margin: "0 0 8px" }}>Construis ton harnais</h2>
      <p>Le Harnais est branché sur cette session.</p>
      <p style={{ opacity: 0.7 }}>{props.session.directory}</p>
    </section>
  )
}
