/**
 * קוד Apps Script עבור דפי עבודה אינטראקטיביים - נטלי דוד
 * הוראות: הדביקי קוד זה בעורך ה-Apps Script בגוגל שיטס שלך, ובצעי Deploy כ-Web App עם הרשאת Anyone.
 */

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.setRightToLeft(true);

    // יצירת כותרות מעוצבות אוטומטית אם הגיליון ריק
    if (sheet.getLastRow() === 0) {
      var headers = [
        "תאריך ושעה",
        "מזהה סשן",
        "שם התלמיד/ה",
        "כיתה",
        "ציון משימה 1",
        "פירוט משימה 1",
        "ציון משימה 2",
        "פירוט משימה 2",
        "ציון משימה 3",
        "פירוט תשובות",
        "ציון סופי משוקלל"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#4338ca")
                 .setFontColor("#ffffff")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // קריאת נתונים עבור טבלת המורה (כשמועבר action=read)
    if (e && e.parameter && e.parameter.action === "read") {
      var rows = sheet.getDataRange().getValues();
      return ContentService.createTextOutput(JSON.stringify({ status: "success", rows: rows }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // פענוח נתוני התלמיד הנשלחים
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "ready" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sessionId = data.sessionId || "";
    var studentName = data.studentName || "ללא שם";
    var timestamp = data.timestamp || new Date().toLocaleString("he-IL");
    var studentClass = data.studentClass || "";
    var score1 = data.score1 || "";
    var details1 = data.details1 || "";
    var score2 = data.score2 || "";
    var details2 = data.details2 || "";
    var score3 = data.score3 || "";
    var answersDetails = data.answersDetails || "";
    var finalGrade = data.finalGrade || "";

    var rowValues = [
      timestamp,
      sessionId,
      studentName,
      studentClass,
      score1,
      details1,
      score2,
      details2,
      score3,
      answersDetails,
      finalGrade
    ];

    // בדיקה האם כבר קיימת שורה עבור מזהה הסשן הזה (עדכון אותה השורה)
    var allData = sheet.getDataRange().getValues();
    var existingRowIndex = -1;
    if (sessionId) {
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][1] === sessionId) {
          existingRowIndex = i + 1; // 1-based index בגוגל שיטס
          break;
        }
      }
    }

    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", updatedRow: existingRowIndex }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
