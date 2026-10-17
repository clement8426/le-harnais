<#
.SYNOPSIS
  Prépare et lance Le Harnais en développement, de A à Z, depuis une copie du dépôt.

.DESCRIPTION
  1. vérifie Git, Node.js et Bun, et propose d'installer ce qui manque (via winget, sans droits d'administrateur
     pour la plupart des cas) ;
  2. installe les dépendances du dépôt (bun install) ;
  3. lance l'application en développement (bun run dev) : elle récupère OpenCode à la version figée, applique
     nos patchs, construit le plugin, puis ouvre la fenêtre. Compte plusieurs minutes la toute première fois.

  Avec -Verifier, le script ne fait que contrôler les outils : rien n'est installé ni lancé.
#>
param([switch]$Verifier)

$ErrorActionPreference = 'Stop'
$racine = Split-Path $PSScriptRoot -Parent
function Etape($texte) { Write-Host "`n==> $texte" -ForegroundColor Cyan }

$outils = @(
  @{ Nom = 'Git';     Commande = 'git';  Winget = 'Git.Git';            Pourquoi = "récupérer OpenCode à la version figée" },
  @{ Nom = 'Node.js'; Commande = 'node'; Winget = 'OpenJS.NodeJS.LTS';  Pourquoi = "exécuter une partie des outils" },
  @{ Nom = 'Bun';     Commande = 'bun';  Winget = 'Oven-sh.Bun';        Pourquoi = "installer et lancer le projet" }
)

Write-Host 'Le Harnais : démarrage en développement' -ForegroundColor White
Etape 'Vérification des outils'
$manquants = @()
foreach ($o in $outils) {
  $trouve = Get-Command $o.Commande -ErrorAction SilentlyContinue
  if ($trouve) { Write-Host ("  OK       {0,-8} {1}" -f $o.Nom, (& $o.Commande --version 2>$null | Select-Object -First 1)) -ForegroundColor Green }
  else { Write-Host ("  MANQUANT {0,-8} (sert à {1})" -f $o.Nom, $o.Pourquoi) -ForegroundColor Yellow; $manquants += $o }
}
if ($Verifier) { if ($manquants.Count) { exit 1 } else { Write-Host "`nTout est prêt." -ForegroundColor Green; exit 0 } }

if ($manquants.Count) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "`nwinget est introuvable. Installe à la main : $(($manquants | ForEach-Object { $_.Nom }) -join ', ') (voir docs/developper.md)." -ForegroundColor Red
    exit 1
  }
  if ((Read-Host "`nInstaller maintenant $(($manquants | ForEach-Object { $_.Nom }) -join ', ') avec winget ? (O/N)") -notmatch '^[oOyY]') { Write-Host 'Installation annulée.'; exit 1 }
  foreach ($o in $manquants) {
    Etape "Installation de $($o.Nom)"
    winget install --id $o.Winget --exact --silent --accept-package-agreements --accept-source-agreements
  }
  Write-Host "`nLes outils sont installés. Ferme cette fenêtre et relance ce script : Windows doit recharger son PATH." -ForegroundColor Green
  exit 0
}

Set-Location $racine
Etape 'Installation des dépendances (bun install)'
bun install
if ($LASTEXITCODE) { exit $LASTEXITCODE }
Etape 'Lancement (bun run dev) : la première fois, compte plusieurs minutes'
bun run dev
