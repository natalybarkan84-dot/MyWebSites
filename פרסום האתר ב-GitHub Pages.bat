@echo off
chcp 65001 >nul
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\bin;%PATH%"

echo ======================================================================
echo           העלאת האתר ל-GitHub והפעלת כתובת אינטרנט ציבורית
echo ======================================================================
echo.

:: 1. בדיקת סטטוס התחברות
echo [1/4] בודק חיבור לחשבון GitHub...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo לא נמצא חיבור לחשבון GitHub. כעת ייפתח דפדפן לצורך התחברות מהירה.
    echo 1. יופיע קוד זמני בן 8 תווים על המסך
    echo 2. לחצי Enter לפתיחת הדפדפן, הדביקי את הקוד ולחצי Authorize
    echo.
    gh auth login --web -p https --skip-ssh-key
    if %errorlevel% neq 0 (
        echo.
        echo ההתחברות לא הושלמה. נסי שוב.
        pause
        exit /b
    )
)

echo [V] מחובר בהצלחה ל-GitHub!
echo.

:: 2. שמירת כל השינויים המקומיים
echo [2/4] מוודא שכל הקבצים והשינויים שמורים...
git add .
git commit -m "העלאת האתר ומשחקי הלמידה ל-GitHub" >nul 2>&1
git branch -M main

:: 3. יצירת הפרויקט או סנכרון
echo [3/4] יוצר ומעלה את הפרויקט ל-GitHub...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    gh repo create MyWebSites --public --source=. --remote=origin --push
) else (
    git push -u origin main
)

:: 4. הפעלת GitHub Pages
echo [4/4] מפעיל את כתובת האתר הציבורית (GitHub Pages)...
gh api --method POST repos/:owner/MyWebSites/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/" >nul 2>&1

:: קבלת שם המשתמש והצגת הקישור
for /f "tokens=*" %%a in ('gh api user -q .login') do set "GH_USER=%%a"

echo.
echo ======================================================================
echo           ברכות! האתר עלה בהצלחה לאוויר האינטרנט!
echo ======================================================================
echo.
echo כתובת האתר שלך (נגישה מכל מחשב, טלפון וטאבלט):
echo https://%GH_USER%.github.io/MyWebSites/
echo.
echo מאגר הקוד ב-GitHub:
echo https://github.com/%GH_USER%/MyWebSites
echo.
echo (שים לב: ייתכן וייקח כדקה-שתיים ל-GitHub להציג את האתר בפעם הראשונה)
echo ======================================================================
echo.
set /p openweb="האם לפתוח כעת את האתר בדפדפן? (Y/N): "
if /i "%openweb%"=="Y" (
    start https://%GH_USER%.github.io/MyWebSites/
)
pause
