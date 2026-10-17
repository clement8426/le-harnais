<#
.SYNOPSIS
  Installe Le Harnais pour l'utilisateur courant, en un seul geste. Aucun droit d'administrateur.

.DESCRIPTION
  1. trouve l'archive du Harnais : celle donnée avec -Zip, une archive posée à côté de ce script,
     ou la dernière version publiée sur GitHub (téléchargée pour toi) ;
  2. l'extrait dans %LOCALAPPDATA%\LeHarnais (ou le dossier donné avec -Dossier) ;
  3. crée un raccourci « Le Harnais » sur le bureau ;
  4. lance l'application.

  Tes conversations et ta progression sont rangées ailleurs (%APPDATA%\app.leharnais.desktop et
  Documents\LeLabo) : réinstaller ou mettre à jour ne les touche pas.

.EXAMPLE
  .\installer.ps1                              # télécharge la dernière version et l'installe
  .\installer.ps1 -Zip C:\Temp\le-harnais.zip  # installe depuis une archive déjà téléchargée
  .\installer.ps1 -SansLancer                  # installe sans ouvrir l'application
#>
param(
  [string]$Zip,
  [string]$Dossier = (Join-Path $env:LOCALAPPDATA 'LeHarnais'),
  [string]$Depot = 'clement8426/le-harnais',
  [switch]$SansRaccourci,
  [switch]$SansLancer
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # sans cela, Invoke-WebRequest est très lent sous Windows PowerShell 5.1

function Etape($texte) { Write-Host "`n==> $texte" -ForegroundColor Cyan }
function Echec($texte) { Write-Host "`nImpossible de continuer : $texte" -ForegroundColor Red; exit 1 }

Write-Host 'Installation de Le Harnais' -ForegroundColor White
if (-not [Environment]::Is64BitOperatingSystem) { Echec 'Le Harnais demande un Windows 64 bits.' }

# --- 1. L'archive ---------------------------------------------------------------------------------------------
Etape "Recherche de l'archive"
$temporaire = $null
if ($Zip) {
  if (-not (Test-Path $Zip)) { Echec "l'archive '$Zip' n'existe pas." }
  $archive = (Resolve-Path $Zip).Path
  Write-Host "Archive donnée : $archive"
} else {
  # En mode « une ligne » (irm ... | iex), le script n'a pas de dossier : $PSScriptRoot est vide.
  $voisins = @()
  if ($PSScriptRoot) { $voisins = @($PSScriptRoot, (Split-Path $PSScriptRoot -Parent)) }
  $voisine = $voisins |
    Where-Object { $_ -and (Test-Path $_) } |
    ForEach-Object { Get-ChildItem $_ -Filter 'le-harnais-*-win-x64.zip' -ErrorAction SilentlyContinue } |
    Select-Object -First 1
  if ($voisine) {
    $archive = $voisine.FullName
    Write-Host "Archive trouvée à côté du script : $archive"
  } else {
    Write-Host "Recherche de la dernière version sur github.com/$Depot ..."
    try {
      $version = Invoke-RestMethod -Uri "https://api.github.com/repos/$Depot/releases/latest" -Headers @{ 'User-Agent' = 'installateur-le-harnais' }
    } catch {
      Echec ("aucune version publiée n'est accessible sur github.com/$Depot (le dépôt est peut-être privé, ou aucune version n'a encore été publiée).`n" +
             "Demande l'archive à ton formateur, puis relance :  .\installer.ps1 -Zip C:\chemin\le-harnais-...-win-x64.zip")
    }
    $fichier = $version.assets | Where-Object { $_.name -like '*-win-x64.zip' } | Select-Object -First 1
    if (-not $fichier) { Echec "la version $($version.tag_name) ne contient pas d'archive Windows (*-win-x64.zip)." }
    $temporaire = Join-Path $env:TEMP $fichier.name
    $taille = [math]::Round($fichier.size / 1MB)
    Write-Host "Téléchargement de $($fichier.name) ($taille Mo). Cela peut prendre quelques minutes..."
    Invoke-WebRequest -Uri $fichier.browser_download_url -OutFile $temporaire -UseBasicParsing
    $archive = $temporaire
  }
}

# --- 2. Extraction --------------------------------------------------------------------------------------------
Etape "Installation dans $Dossier"
$existant = Test-Path (Join-Path $Dossier 'Le Harnais.exe')
if ((Test-Path $Dossier) -and -not $existant -and (Get-ChildItem $Dossier -Force | Select-Object -First 1)) {
  Echec "le dossier '$Dossier' existe déjà et ne contient pas Le Harnais. Choisis un autre dossier avec -Dossier."
}
# On ferme l'application si elle tourne depuis ce dossier : sinon Windows refuse de remplacer ses fichiers.
Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like "$Dossier\*" } | Stop-Process -Force -ErrorAction SilentlyContinue
if ($existant) { Start-Sleep -Seconds 2; Write-Host 'Une version existe déjà : elle est remplacée (tes données sont conservées).' }

$extraction = Join-Path $env:TEMP 'le-harnais-extraction'
if (Test-Path $extraction) { Remove-Item $extraction -Recurse -Force }
New-Item -ItemType Directory $extraction | Out-Null
Write-Host "Extraction de l'archive (environ 1 Go, patience)..."
if (Get-Command tar.exe -ErrorAction SilentlyContinue) { & tar.exe -xf $archive -C $extraction } else { Expand-Archive -Path $archive -DestinationPath $extraction -Force }
$source = Join-Path $extraction 'win-unpacked'
if (-not (Test-Path (Join-Path $source 'Le Harnais.exe'))) { Echec "l'archive ne contient pas Le Harnais (fichier 'win-unpacked\Le Harnais.exe' introuvable)." }

if (Test-Path $Dossier) { Remove-Item $Dossier -Recurse -Force }
New-Item -ItemType Directory (Split-Path $Dossier -Parent) -Force | Out-Null
Move-Item $source $Dossier
Remove-Item $extraction -Recurse -Force -ErrorAction SilentlyContinue
if ($temporaire) { Remove-Item $temporaire -Force -ErrorAction SilentlyContinue }
Write-Host 'Fichiers installés.' -ForegroundColor Green

# --- 3. Raccourci ---------------------------------------------------------------------------------------------
$exe = Join-Path $Dossier 'Le Harnais.exe'
if (-not $SansRaccourci) {
  Etape 'Raccourci sur le bureau'
  $lien = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Le Harnais.lnk'
  $icone = Join-Path $Dossier 'resources\le-harnais\icone.ico'
  $raccourci = (New-Object -ComObject WScript.Shell).CreateShortcut($lien)
  $raccourci.TargetPath = $exe
  $raccourci.WorkingDirectory = $Dossier
  if (Test-Path $icone) { $raccourci.IconLocation = $icone }
  $raccourci.Description = 'Le Harnais : apprendre l''IA en débloquant ses outils'
  $raccourci.Save()
  Write-Host "Raccourci créé : $lien" -ForegroundColor Green
}

# --- 4. Lancement ---------------------------------------------------------------------------------------------
Write-Host "`nLe Harnais est installé." -ForegroundColor Green
Write-Host "  Dossier   : $Dossier"
Write-Host "  Pour le relancer : double-clique sur « Le Harnais » sur ton bureau."
Write-Host "  Pour le retirer  : lance desinstaller.ps1 (ou Desinstaller-Le-Harnais.bat)."
if (-not $SansLancer) {
  Etape "Lancement (la première ouverture prend une trentaine de secondes : c'est normal)"
  Start-Process -FilePath $exe -WorkingDirectory $Dossier
}
