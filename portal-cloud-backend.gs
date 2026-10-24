/**
 * =========================================================================
 * פורטל ספריית המשחקים ודפי העבודה - נטלי דוד
 * Google Apps Script Cloud Backend
 * =========================================================================
 * 
 * הוראות התקנה:
 * 1. פתחי גיליון Google Sheets חדש (למשל: "ספריית המשחקים - נטלי דוד").
 * 2. בתפריט העליון לחצי על: "הרחבות" (Extensions) -> "Apps Script".
 * 3. מחקי את כל מה שמופיע בעורך, הדביקי את כל הקוד הזה, ולחצי על שמירה (Ctrl+S / אייקון דיסק).
 * 4. לחצי על "פריסה" (Deploy) בצד שמאל/ימין למעלה -> "פריסה חדשה" (New deployment).
 * 5. סוג פריסה: גלגל שיניים -> "אפליקציית אינטרנט" (Web app).
 * 6. הגדרות:
 *    - תיאור: "Portal Backend"
 *    - ביצוע בשם: "החשבון שלי" (Me)
 *    - למי יש גישה: "כל אחד" (Anyone) -> חשוב מאוד כדי שהאתר יוכל לקרוא ולשמור ללא צורך בהתחברות לגוגל!
 * 7. לחצי על "פריסה" (Deploy), אשרי הרשאות, והעתיקי את ה-Web App URL שנוצר.
 * 8. הדביקי את הקישור בממשק המנהלת של האתר תחת "הגדרות ענן".
 */

const SHEET_NAME_CATALOG = "Portal_Catalog";
const SHEET_NAME_SETTINGS = "Portal_Settings";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const catalogSheet = getOrCreateSheet(ss, SHEET_NAME_CATALOG, [
      "id", "title", "description", "category", "tags", "fileUrl", "teacherUrl", 
      "status", "pinCode", "icon", "featured", "orderIndex", "createdAt", "updatedAt"
    ]);
    const settingsSheet = getOrCreateSheet(ss, SHEET_NAME_SETTINGS, ["key", "value"]);

    // טעינת פריטי הקטלוג
    const catalogData = catalogSheet.getDataRange().getValues();
    const headers = catalogData[0] || [];
    const games = [];

    for (let i = 1; i < catalogData.length; i++) {
      const row = catalogData[i];
      if (!row[0]) continue; // דילוג על שורות ריקות
      const item = {};
      headers.forEach((h, colIndex) => {
        let val = row[colIndex];
        if (h === "tags" && typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch(err) {
            val = val.split(",").map(t => t.trim()).filter(Boolean);
          }
        }
        if (h === "featured") {
          val = (val === true || val === "true" || val === 1);
        }
        if (h === "orderIndex") {
          val = Number(val) || 0;
        }
        item[h] = val;
      });
      games.push(item);
    }

    // טעינת הגדרות אתר
    const settingsData = settingsSheet.getDataRange().getValues();
    const settings = {};
    for (let i = 1; i < settingsData.length; i++) {
      const key = settingsData[i][0];
      const val = settingsData[i][1];
      if (key) {
        settings[key] = val;
      }
    }

    return createJsonResponse({
      success: true,
      games: games,
      settings: settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // ממתין עד 10 שניות למניעת התנגשויות עריכה
    lock.waitLock(10000);

    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // טיפול בשמירת הקטלוג
    if (postData.action === "save_catalog" && Array.isArray(postData.games)) {
      const catalogSheet = getOrCreateSheet(ss, SHEET_NAME_CATALOG, [
        "id", "title", "description", "category", "tags", "fileUrl", "teacherUrl", 
        "status", "pinCode", "icon", "featured", "orderIndex", "createdAt", "updatedAt"
      ]);

      // איפוס שורות קיימות והזנה מחדש מסודרת
      const headers = ["id", "title", "description", "category", "tags", "fileUrl", "teacherUrl", 
                       "status", "pinCode", "icon", "featured", "orderIndex", "createdAt", "updatedAt"];
      
      const rows = postData.games.map((g, index) => {
        return [
          g.id || Utilities.getUuid(),
          g.title || "",
          g.description || "",
          g.category || "כללי",
          JSON.stringify(Array.isArray(g.tags) ? g.tags : []),
          g.fileUrl || "",
          g.teacherUrl || "",
          g.status || "public", // 'public', 'locked', 'hidden'
          g.pinCode || "",
          g.icon || "fa-gamepad",
          g.featured ? true : false,
          g.orderIndex !== undefined ? g.orderIndex : index,
          g.createdAt || new Date().toISOString(),
          new Date().toISOString()
        ];
      });

      // נקה תוכן קיים למעט כותרות
      const lastRow = catalogSheet.getLastRow();
      if (lastRow > 1) {
        catalogSheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
      }

      if (rows.length > 0) {
        catalogSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }

      // שמירת הגדרות אם נשלחו
      if (postData.settings) {
        const settingsSheet = getOrCreateSheet(ss, SHEET_NAME_SETTINGS, ["key", "value"]);
        const settingRows = Object.keys(postData.settings).map(k => [k, postData.settings[k]]);
        
        const sLastRow = settingsSheet.getLastRow();
        if (sLastRow > 1) {
          settingsSheet.getRange(2, 1, sLastRow - 1, 2).clearContent();
        }
        if (settingRows.length > 0) {
          settingsSheet.getRange(2, 1, settingRows.length, 2).setValues(settingRows);
        }
      }

      return createJsonResponse({
        success: true,
        message: "הקטלוג וההגדרות סונכרנו בהצלחה לענן Google Sheets",
        count: rows.length,
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      success: false,
      error: "Unknown action or invalid data payload"
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet(ss, sheetName, defaultHeaders) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.setRightToLeft(true);
    const headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#e0e7ff");
    headerRange.setFontColor("#1e1b4b");
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
