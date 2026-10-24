[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$env:Path = "$env:LOCALAPPDATA\Programs\Git\cmd;$env:LOCALAPPDATA\Programs\bin;$env:Path"

Clear-Host
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           העלאת האתר ל-GitHub והפעלת כתובת אינטרנט ציבורית            " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. בדיקת התחברות
Write-Host "[1/4] בודק חיבור לחשבון GitHub..." -ForegroundColor White
$authStatus = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "לא נמצא חיבור פעיל. כעת נתחבר לחשבון ה-GitHub שלך:" -ForegroundColor Yellow
    Write-Host "1. כעת ייפתח דפדפן ויוצג קוד אישור." -ForegroundColor White
    Write-Host "2. אשרי את החיבור בדפדפן ולאחר מכן חזרי לחלון זה." -ForegroundColor White
    Write-Host ""
    & gh auth login --web -p https --skip-ssh-key
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ההתחברות לא הושלמה. ניתן להפעיל שוב בכל עת." -ForegroundColor Red
        Read-Host "לחצי Enter לסיום"
        exit
    }
}

Write-Host "[V] מחובר בהצלחה ל-GitHub!" -ForegroundColor Green
Write-Host ""

# 2. שמירת כל השינויים
Write-Host "[2/4] מוודא שכל הקבצים שמורים בגרסה מקומית..." -ForegroundColor White
& git add .
& git commit -m "העלאת האתר ומשחקי הלמידה ל-GitHub" 2>$null
& git branch -M main

# 3. יצירת המאגר והעלאה
Write-Host "[3/4] יוצר ומעלה את הפרויקט ל-GitHub..." -ForegroundColor White
$remote = & git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    & gh repo create MyWebSites --public --source=. --remote=origin --push
} else {
    & git push -u origin main
}

# 4. הפעלת GitHub Pages
Write-Host "[4/4] מפעיל כתובת אתר ציבורית (GitHub Pages)..." -ForegroundColor White
& gh api --method POST repos/:owner/MyWebSites/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/" 2>$null

$user = (& gh api user -q .login).Trim()

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "           ברכות! האתר עלה בהצלחה לאוויר האינטרנט!                     " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "כתובת האתר שלך (נגישה מכל מחשב, טלפון וטאבלט):" -ForegroundColor White
Write-Host "https://$user.github.io/MyWebSites/" -ForegroundColor Cyan
Write-Host ""
Write-Host "מאגר הקבצים ב-GitHub:" -ForegroundColor White
Write-Host "https://github.com/$user/MyWebSites" -ForegroundColor Gray
Write-Host ""
Write-Host "(הערה: ייתכן שייקח כדקה עד ש-GitHub יסיים לבנות את האתר בפעם הראשונה)" -ForegroundColor DarkGray
Write-Host ""

$open = Read-Host "האם לפתוח כעת את כתובת האתר בדפדפן? (Y/N)"
if ($open -eq 'Y' -or $open -eq 'y') {
    Start-Process "https://$user.github.io/MyWebSites/"
}

Read-Host "לחצי Enter לסגירת החלון"