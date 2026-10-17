@echo off
rem Installe Le Harnais : double-clique sur ce fichier. Aucun droit d'administrateur n'est necessaire.
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" %*
echo.
pause
