@echo off
rem Prepare et lance Le Harnais en developpement (verifie Git, Node et Bun, installe les dependances, ouvre l'application).
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\demarrer-dev.ps1" %*
echo.
pause
