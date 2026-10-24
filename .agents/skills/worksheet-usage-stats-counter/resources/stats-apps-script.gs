/**
 * קוד Apps Script עבור גיליון מונה סטטיסטיקה ליוצרת (נטלי דוד)
 * 6 עמודות בלבד מימין לשמאל, שמירה אנונימית מלאה ללא שום מידע אישי.
 */

function doPost(e) {
  return handleStats(e);
}

function doGet(e) {
  return handleStats(e);
}

function handleStats(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.setRightToLeft(true);

    // יצירת 6 העמודות המעוצבות אם הגיליון ריק
    if (sheet.getLastRow() === 0) {
      var headers = [
        "מספר כניסה",
        "תאריך",
        "שעה",
        "כניסה לקובץ",
        "כניסה לממשק המורה",
        "האם חובר גיליון כיתתי",
        "מזהה ביקור זמני" // עמודה 7 לזיהוי פנימי של אותה השורה
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#6b21a8") // סגול עמוק
                 .setFontColor("#ffffff")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      // הסתרת עמודת מזהה הביקור לשמירה על מראה נקי
      sheet.hideColumns(7);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "ready" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var action = data.action || "file_opened";
    var visitId = data.visitId || "";
    var now = new Date();
    var dateStr = now.toLocaleDateString("he-IL");
    var timeStr = now.toLocaleTimeString("he-IL", { hour: '2-digit', minute: '2-digit' });

    var allData = sheet.getDataRange().getValues();
    var existingRowIndex = -1;

    if (visitId) {
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][6] === visitId) {
          existingRowIndex = i + 1; // 1-based index
          break;
        }
      }
    }

    if (action === "file_opened") {
      if (existingRowIndex === -1) {
        var entryNumber = sheet.getLastRow(); // שורה נוכחית פחות כותרת פלוס 1
        var newRow = [
          entryNumber,
          dateStr,
          timeStr,
          "כן",
          "לא",
          "לא",
          visitId
        ];
        sheet.appendRow(newRow);
      }
    } else if (action === "teacher_opened") {
      if (existingRowIndex > 0) {
        // עדכון עמודה 5 ל"כן"
        sheet.getRange(existingRowIndex, 5).setValue("כן");
      }
    } else if (action === "sheet_connected") {
      if (existingRowIndex > 0) {
        // עדכון עמודה 6 ל"כן"
        sheet.getRange(existingRowIndex, 6).setValue("כן");
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: action }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
