<#
.SYNOPSIS
  Retire Le Harnais installé par installer.ps1 : le dossier de l'application et le raccourci du bureau.

.DESCRIPTION
  Par défaut, tes conversations, ta connexion à l'IA et ta progression sont CONSERVÉES : elles vivent dans
  %APPDATA%\app.leharnais.desktop et Documents\LeLabo. Avec -Donnees, ces deux dossiers sont supprimés aussi,
  après une confirmation (c'est définitif).
#>
param(
  [string]$Dossier = (Join-Path $env:LOCALAPPDATA 'LeHarnais'),
  [switch]$Donnees
)

$ErrorActionPreference = 'Stop'
function Etape($texte) { Write-Host "`n==> $texte" -ForegroundColor Cyan }

Write-Host 'Désinstallation de Le Harnais' -ForegroundColor White

Etape "Fermeture de l'application"
Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and ($_.Path -like "$Dossier\*" -or $_.Path -like "$env:APPDATA\app.leharnais.desktop\*") } |
  Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Etape "Suppression de l'application"
if (Test-Path $Dossier) {
  if (-not (Test-Path (Join-Path $Dossier 'Le Harnais.exe'))) {
    Write-Host "Le dossier '$Dossier' ne contient pas Le Harnais : il n'est pas supprimé." -ForegroundColor Yellow
  } else {
    Remove-Item $Dossier -Recurse -Force
    Write-Host "Dossier supprimé : $Dossier" -ForegroundColor Green
  }
} else {
  Write-Host "Aucun dossier à $Dossier : rien à supprimer."
}
$lien = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Le Harnais.lnk'
if (Test-Path $lien) { Remove-Item $lien -Force; Write-Host 'Raccourci supprimé.' -ForegroundColor Green }

if ($Donnees) {
  $profil = Join-Path $env:APPDATA 'app.leharnais.desktop'
  $atelier = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'LeLabo'
  Etape 'Suppression des données'
  Write-Host "Ceci supprime DÉFINITIVEMENT :`n  $profil   (conversations, connexion à l'IA)`n  $atelier   (ton atelier et ta progression)" -ForegroundColor Yellow
  if ((Read-Host 'Tape OUI pour confirmer') -eq 'OUI') {
    foreach ($chemin in @($profil, $atelier)) { if (Test-Path $chemin) { Remove-Item $chemin -Recurse -Force; Write-Host "Supprimé : $chemin" -ForegroundColor Green } }
  } else {
    Write-Host 'Données conservées.'
  }
} else {
  Write-Host "`nTes données sont conservées (relance avec -Donnees pour les supprimer aussi)."
}
Write-Host "`nTerminé." -ForegroundColor Green
