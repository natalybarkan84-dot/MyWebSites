@echo off
chcp 65001 >nul
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
echo ========================================================
echo         שמירת נקודת שחזור חדשה (גרסה)
echo ========================================================
echo.
git status -s
echo.
set /p msg="נא לרשום תיאור קצר לגרסה החדשה (לדוגמה: הוספת כפתור בדיקה): "
if "%msg%"=="" (
    echo לא הוזן תיאור, השמירה בוטלה.
    pause
    exit /b
)
git add .
git commit -m "%msg%"
echo.
echo הגרסה נשמרה בהצלחה!
echo ========================================================
pause
