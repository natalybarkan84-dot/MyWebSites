@echo off
title פרסום האתר ב-GitHub Pages
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish.ps1"
if %errorlevel% neq 0 pause
