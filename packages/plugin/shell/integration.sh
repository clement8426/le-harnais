# Intégration bash du Harnais (Git Bash sous Windows, bash sous Linux et macOS).
# Lue avant chaque invite : le patch 04 d'OpenCode met PROMPT_COMMAND='. "<ce fichier>"' quand LE_HARNAIS_BASH_INIT est défini.
# Après chaque commande, note dans .labo/terminal.jsonl de l'atelier : la commande tapée et si elle a réussi.
# Ne fait rien hors d'un atelier, et n'envoie rien nulle part.

__lh_statut=$?
__lh_numero="$(history 1 | awk '{print $1}')"
if [ -z "$__LH_PRET" ]; then
  # Première invite : on retient l'atelier, et on ignore la dernière ligne de l'historique d'une session précédente.
  __LH_PRET=1
  __LH_ATELIER="$PWD"
  __LH_NUMERO="$__lh_numero"
elif [ -f "$__LH_ATELIER/.labo/harnais.json" ] && [ -n "$__lh_numero" ] && [ "$__lh_numero" != "$__LH_NUMERO" ]; then
  __LH_NUMERO="$__lh_numero"
  __lh_commande="$(HISTTIMEFORMAT= history 1 | sed 's/^ *[0-9]* *//')"
  __lh_commande="${__lh_commande//\\/\\\\}"
  __lh_commande="${__lh_commande//\"/\\\"}"
  __lh_commande="${__lh_commande//$'\t'/ }"
  if [ "$__lh_statut" -eq 0 ]; then __lh_ok=true; else __lh_ok=false; fi
  printf '{"quand":"%s","commande":"%s","ok":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$__lh_commande" "$__lh_ok" >> "$__LH_ATELIER/.labo/terminal.jsonl"
fi
unset __lh_statut __lh_numero __lh_commande __lh_ok
