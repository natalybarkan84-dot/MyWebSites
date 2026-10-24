---
name: worksheet-usage-stats-counter
description: >-
  הוספת טבלת סטטיסטיקה ומונה שימוש כללי בגוגל שיטס עבור יוצרת דף העבודה האינטראקטיבי (נטלי דוד)
  בשלושה שלבים (פתיחת הקובץ, פתיחת ממשק המורה, וחיבור גיליון כיתתי) תוך שמירה מלאה על פרטיות
  המשתמשים וללא שמירת מידע אישי. מופעל כאשר מבקשים להוסיף מונה כניסות מורים או סטטיסטיקת שימוש לדף אינטראקטיבי.
---

# מונה סטטיסטיקת שימוש בדפי עבודה עבור היוצרת (נטלי דוד)

סקיל זה מנחה כיצד להטמיע מנגנון ספירה אנונימי מובנה עבור יוצרת הדפים (נטלי דוד),
המאפשר מעקב כללי אחר מידת השימוש של מורות בקבצי הלימוד, בחלוקה ל-3 שלבים קריטיים,
ותוך שמירה קפדנית ומלאה על פרטיות המשתמשים וללא שום איסוף מידע אישי (Zero PII).

## תיקיית פרויקט ודוגמאות ייחוס (Project Examples)

תיקיית המשחקים ודפי העבודה הקיימים של נטלי דוד נמצאת בנתיב:
`c:\Users\Nataly\Desktop\MyWebSItes\משחקים AI נטלי דוד\`

קובץ הייחוס המרכזי שבו מוטמע המנגנון:
`c:\Users\Nataly\Desktop\MyWebSItes\משחקים AI נטלי דוד\מסע חוויתי ללימוד מילות קישור (נטלידוד1234)- קובץ עבור מורים.HTML`

---

## 1. עקרונות פרטיות מחמירים (Zero PII)

- **איסור מוחלט על שמירת מידע אישי מזהה:** אין לשמור שמות מורים, כתובות אימייל, פרטי תלמידים, ציונים, תשובות, או כתובות URL של גיליונות אישיים של מורות.
- **טבלת 6 העמודות (RTL):**
  הגיליון של נטלי מוגדר מימין לשמאל ומכיל בדיוק 6 עמודות:
  1. `מספר כניסה` – מספור רץ אוטומטי (1, 2, 3...)
  2. `תאריך` – תאריך הפתיחה (למשל `24/10/2026`)
  3. `שעה` – שעת הפתיחה (למשל `13:30`)
  4. `כניסה לקובץ` – ערך קבוע: `כן`
  5. `כניסה לממשק המורה` – מתחיל כ-`לא`, ומתעדכן ל-`כן` באותה שורה ברגע שהמורה מזינה סיסמה ונכנסת
  6. `האם חובר גיליון כיתתי` – מתחיל כ-`לא`, ומתעדכן ל-`כן` באותה שורה כשהמורה שומרת כתובת גיליון אישית

---

## 2. מנגנון עדכון רציף (Session Visit ID)

- בכל פתיחה של קובץ מורה בדפדפן, נוצר בזיכרון הדפדפן מזהה ביקור זמני:
  `const visitId = 'visit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);`
- המזהה נשמר בזיכרון בלבד (`sessionStorage`).
- **שלושת השלבים שמעדכנים את אותה השורה:**
  1. **שלב 1 (פתיחת הדף):** נשלח אירוע ראשוני עם `action: 'file_opened'`, שיוצר שורה חדשה עם עמודות 1-4 מלאות ועמודות 5-6 כ-`לא`.
  2. **שלב 2 (פתיחת ממשק המורה):** כשהמורה מזינה את קוד הגישה (`נטלידוד1234`), נשלח עדכון עם אותו `visitId` ו-`action: 'teacher_opened'`, המעדכן את עמודה 5 ל-`כן`.
  3. **שלב 3 (חיבור גיליון כיתתי):** כשהמורה לוחצת "שמור חיבור", נשלח עדכון עם אותו `visitId` ו-`action: 'sheet_connected'`, המעדכן את עמודה 6 ל-`כן`.
- **כלל ברזל:** המונה פועל **אך ורק בקובץ המורה**. בקובץ תלמיד נקי המונה אינו קיים ואינו מופעל כלל.

---

## 3. ממשק הגדרת הסטטיסטיקה עבור נטלי (התיבה הסגולה)

בתחתית חלונית "מנהלת השיעור" של המורה מוצגת תיבה מעוצבת בצבע סגול המיועדת ליוצרת הדף:

```html
<!-- תיבת סטטיסטיקה ליוצרת (נטלי דוד) -->
<div id="creator-stats-panel" class="bg-purple-900/10 border-2 border-purple-300 rounded-2xl p-5 space-y-3">
    <div class="flex items-center justify-between text-purple-950 font-bold text-sm">
        <span class="flex items-center gap-2">
            <i class="fa-solid fa-chart-line text-purple-700"></i>
            הגדרות מונה שימוש ליוצרת (נטלי דוד)
        </span>
        <span class="text-xs bg-purple-200 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">אנונימי לחלוטין</span>
    </div>
    
    <div class="flex gap-2">
        <input type="text" id="natali-stats-url-input" placeholder="הדביקי את קישור גיליון הסטטיסטיקה של נטלי..."
               class="flex-1 px-3 py-2 border border-purple-200 rounded-xl text-xs bg-white">
        <button onclick="saveNataliStatsUrl()" class="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold">
            שמור קישור
        </button>
    </div>

    <div class="flex flex-wrap gap-2 pt-1 text-xs">
        <button onclick="copyStatsAppsScriptCode()" class="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 rounded-lg font-semibold hover:bg-purple-50">
            <i class="fa-solid fa-copy"></i> העתק קוד Apps Script לסטטיסטיקה
        </button>
        <button onclick="testStatsConnection()" class="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 rounded-lg font-semibold hover:bg-purple-50">
            <i class="fa-solid fa-vial"></i> בדיקת חיבור
        </button>
        <button onclick="downloadMasterTeacherFile()" class="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg font-bold shadow hover:from-purple-800 hover:to-indigo-800">
            <i class="fa-solid fa-box-archive"></i> הורד קובץ מאסטר מוכן להפצה למורים
        </button>
    </div>
</div>
```

---

## 4. הפקת "קובץ מאסטר מוכן להפצה למורים"

לחיצה על **"הורד קובץ מאסטר מוכן להפצה למורים"** מבצעת:
1. הטמעה קבועה של כתובת ה-URL של גיליון הסטטיסטיקה של נטלי בתוך הקוד:
   `const NATALI_STATS_WEBAPP_URL = "https://script.google.com/macros/s/.../exec";`
2. **הסרה מוחלטת של התיבה הסגולה (`creator-stats-panel`) מה-DOM** כך שהמורים שיקבלו את הקובץ לא יראו את התיבה הזו ולא יוכלו לשנות את קישור הסטטיסטיקה.
3. איפוס שדות הגיליון הכיתתי של המורה ואיפוס טבלאות נתונים מקומיות.
4. הורדת קובץ HTML עצמאי שנטלי יכולה לשלוח ישירות לכל מורה או להעלות לדרייב.

---

## 5. קובץ ה-Apps Script לגיליון הסטטיסטיקה

הקוד המלא זמין ב-[stats-apps-script.gs](./resources/stats-apps-script.gs).
הקוד דואג לכך ש:
- אם הגיליון ריק, הוא יוצר את שורת הכותרות המעוצבת ב-6 עמודות מימין לשמאל ומקפיא שורה ראשונה.
- שומר `visitId` בעמודה נסתרת (עמודה 7 או כותרת זיהוי).
- בעת קבלת עדכון לשלב 2 או 3, מעדכן את אותה השורה של ה-`visitId` הספציפי.
