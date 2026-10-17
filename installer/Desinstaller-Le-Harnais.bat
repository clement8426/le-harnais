@echo off
rem Retire Le Harnais (tes donnees sont conservees). Double-clique sur ce fichier.
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0desinstaller.ps1" %*
echo.
pause
