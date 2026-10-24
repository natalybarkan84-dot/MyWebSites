@echo off
chcp 65001 >nul
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
echo ========================================================
echo         היסטוריית גרסאות הפרויקט - נטלי דוד
echo ========================================================
echo.
git log --graph --pretty=format:"%%h - %%an, %%ar : %%s" -n 15
echo.
echo ========================================================
pause
