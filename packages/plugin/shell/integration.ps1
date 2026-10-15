# Intégration PowerShell du Harnais.
# Chargée au démarrage du terminal (patch 04 d'OpenCode, variable LE_HARNAIS_POWERSHELL_INIT).
# Après chaque commande, note dans .labo/terminal.jsonl de l'atelier : la commande tapée et si elle a réussi.
# Ne fait rien hors d'un atelier, et n'envoie rien nulle part : le fichier reste dans le dossier de l'élève.

$global:LeHarnaisAtelier = (Get-Location).Path
$global:LeHarnaisJournal = Join-Path $global:LeHarnaisAtelier ".labo\terminal.jsonl"
$global:LeHarnaisActif = Test-Path (Join-Path $global:LeHarnaisAtelier ".labo\harnais.json")
$global:LeHarnaisDerniere = -1
$global:LeHarnaisInvite = $function:prompt

function global:prompt {
  # À lire en premier : la moindre instruction écrase la réussite de la commande précédente.
  $reussi = $?
  if ($global:LeHarnaisActif) {
    $derniere = Get-History -Count 1
    if ($derniere -and $derniere.Id -ne $global:LeHarnaisDerniere) {
      $global:LeHarnaisDerniere = $derniere.Id
      $ligne = [ordered]@{
        quand    = (Get-Date).ToUniversalTime().ToString("o")
        commande = $derniere.CommandLine
        ok       = $reussi
      } | ConvertTo-Json -Compress
      try {
        [System.IO.File]::AppendAllText($global:LeHarnaisJournal, $ligne + "`n", (New-Object System.Text.UTF8Encoding $false))
      } catch {}
    }
  }
  & $global:LeHarnaisInvite
}
