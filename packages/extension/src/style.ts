// Le style du panneau. Il suit le thème d'OpenCode (couleur du texte héritée, fonds translucides),
// avec les repères du Labo : la bande des six couleurs, le safran pour ce qui est gagné, le vert pour ce qui est validé.

export const STYLE = `
.lh { padding: 16px 18px 32px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; font-size: 14px; line-height: 1.55; }
.lh h2 { margin: 6px 0 0; font-size: 20px; letter-spacing: -.01em; }
.lh h3 { margin: 2px 0 4px; font-size: 22px; letter-spacing: -.02em; line-height: 1.15; }
.lh h4 { margin: 14px 0 6px; font-size: 13px; text-transform: none; opacity: .8; }
.lh-discret { opacity: .65; margin: 0; }
.lh-erreur { padding: 10px 12px; border-radius: 10px; background: rgba(217, 83, 79, .15); color: #e87d7a; margin: 0; }
.lh-annonce { padding: 12px 14px; border-radius: 12px; background: #FFC23D; color: #2A2105; font-weight: 600; }
.lh-sens { margin: 0; padding: 10px 12px; border-radius: 10px; background: rgba(43, 68, 232, .14); }
.lh-bande { display: flex; height: 4px; border-radius: 2px; overflow: hidden; width: 96px; }
.lh-bande i { flex: 1; }
.lh-bande i:nth-child(1) { background: #6E4A8E; } .lh-bande i:nth-child(2) { background: #A63F17; } .lh-bande i:nth-child(3) { background: #24609A; }
.lh-bande i:nth-child(4) { background: #7A6514; } .lh-bande i:nth-child(5) { background: #2F7356; } .lh-bande i:nth-child(6) { background: #A3304F; }
.lh-progres { height: 6px; border-radius: 3px; background: rgba(127, 127, 127, .2); margin-top: 8px; overflow: hidden; }
.lh-progres span { display: block; height: 100%; background: #FFC23D; border-radius: 3px; transition: width .4s; }
.lh-mission { padding: 16px; border-radius: 14px; background: rgba(127, 127, 127, .08); border: 1px solid rgba(127, 127, 127, .2); }
.lh-pastille { display: inline-block; margin: 0; padding: 2px 10px; border-radius: 999px; background: rgba(43, 68, 232, .18); font-size: 12px; font-weight: 600; }
.lh-resume { margin: 0 0 10px; opacity: .85; }
.lh-bouton { border: 0; border-radius: 10px; padding: 9px 16px; background: #2B44E8; color: #fff; font-weight: 600; cursor: pointer; }
.lh-bouton:hover { filter: brightness(1.1); }
.lh-second { background: transparent; color: inherit; border: 1.5px solid rgba(127, 127, 127, .45); margin-bottom: 4px; }
.lh-lien { border: 0; background: none; padding: 0; margin-top: 10px; color: inherit; text-decoration: underline; opacity: .8; cursor: pointer; }
.lh-reussie { color: #4fc08d; font-weight: 600; margin: 4px 0 0; }
.lh-preuves { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.lh-preuves li { padding: 8px 10px; border-radius: 9px; border: 1px solid rgba(127, 127, 127, .25); }
.lh-vert { border-color: rgba(79, 192, 141, .6) !important; background: rgba(79, 192, 141, .12); }
.lh-rouge { opacity: .9; }
.lh-question { margin: 12px 0 0; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(127, 127, 127, .25); display: grid; gap: 6px; }
.lh-question legend { font-weight: 600; padding: 0 4px; }
.lh-question label { display: flex; gap: 8px; align-items: baseline; cursor: pointer; }
.lh-indice { margin: 6px 0 0; padding: 10px 12px; border-radius: 10px; background: rgba(255, 194, 61, .14); }
.lh-cours { margin-top: 14px; }
.lh-cours summary { cursor: pointer; font-weight: 600; }
.lh-cours h2, .lh-cours h3 { font-size: 15px; margin: 14px 0 6px; }
.lh-cours table { border-collapse: collapse; font-size: 13px; margin: 8px 0; }
.lh-cours th, .lh-cours td { border: 1px solid rgba(127, 127, 127, .3); padding: 4px 8px; text-align: left; vertical-align: top; }
.lh-cours pre { padding: 10px; border-radius: 8px; background: rgba(127, 127, 127, .14); overflow-x: auto; font-size: 12.5px; }
.lh-cours code { font-size: 12.5px; }
.lh-cours blockquote { margin: 10px 0 0; padding: 10px 12px; border-radius: 10px; background: rgba(79, 192, 141, .12); border: 1px solid rgba(79, 192, 141, .5); }
.lh-parcours { display: grid; gap: 2px; }
.lh-chapitre { margin: 12px 0 4px; font-size: 12px; font-weight: 600; opacity: .6; }
.lh-etape { display: grid; grid-template-columns: 22px 22px 1fr; gap: 8px; align-items: center; padding: 6px 8px; border: 0; border-radius: 9px; background: none; color: inherit; text-align: left; cursor: pointer; font: inherit; }
.lh-etape:hover:not(:disabled) { background: rgba(127, 127, 127, .12); }
.lh-etape[aria-current="step"] { background: rgba(43, 68, 232, .16); }
.lh-etape:disabled { opacity: .45; cursor: default; }
.lh-noeud { text-align: center; }
.lh-numero { opacity: .55; font-variant-numeric: tabular-nums; text-align: right; }
.lh-reussie .lh-noeud, .lh-etape.lh-reussie .lh-noeud { color: #4fc08d; }
.lh-en-cours .lh-noeud { color: #FFC23D; }
`
