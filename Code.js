// ==========================================
// CONFIGURATION: API KEYS & FOLDER IDS
// ==========================================
const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
const MAIN_CONFERENCE_FOLDER_ID = "YOUR_FOLDER_ID_HERE"; // Paste your Google Drive Conference Folder ID here

// Serves the HTML page to the user's browser
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('HINDUJA MUN 2026 - Chit Portal')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Validates the delegate's login credentials
function validateLogin(portfolio, pin) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Portfolios');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === portfolio.toLowerCase() && data[i][1].toString() === pin.toString()) {
      return true;
    }
  }
  return false;
}

// Helper to load the list of all countries into the webpage dropdown menu
function getPortfolioList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Portfolios');
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return data.map(row => row[0]);
}

// Helper to check if the floor is currently open for chits
function checkFloorStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('POI CHITS');
  if (!sheet) return "OPEN";
  
  // Changed from "H1" to "F7" to match the new merged cell location
  let status = sheet.getRange("F7").getValue();
  return status ? status.toString().toUpperCase() : "OPEN";
}

// Builds the delegate dashboard data and checks floor status
function getDelegateDashboardData(portfolio) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('POI CHITS'); 
  
  const dashboard = {
    floorStatus: checkFloorStatus(),
    inbox: [],
    sentHistory: [],
    stats: {
      questionsSent: 0,
      repliesSent: 0,
      totalReceived: 0
    }
  };
  
  if (!sheet) return dashboard;
  
  const bValues = sheet.getRange("B11:B").getValues();
  let actualLastRow = 10;
  
  for (let i = 0; i < bValues.length; i++) {
    if (bValues[i][0] !== "") {
      actualLastRow = 11 + i;
    } else {
      break;
    }
  }
  
  if (actualLastRow < 11) return dashboard; 
  
  const data = sheet.getRange(11, 1, actualLastRow - 10, 7).getValues();
  const user = portfolio.toString().toUpperCase();
  
  for (let i = data.length - 1; i >= 0; i--) { 
    let rowNum = 11 + i;
    let chitNum = data[i][0] || (i + 1);
    let qSender = data[i][1].toString().toUpperCase();    
    let qText = data[i][2].toString();                      
    let qRecipient = data[i][4].toString().toUpperCase(); 
    let rText = data[i][5].toString();                      
    
    if (qSender === user) {
      dashboard.stats.questionsSent++;
      dashboard.sentHistory.push({
        type: "QUESTION",
        to: qRecipient,
        text: qText,
        timestamp: "Chit #" + chitNum
      });
      
      if (rText !== "") {
        dashboard.stats.totalReceived++;
        dashboard.inbox.push({
          rowNumber: rowNum,
          timestamp: "Reply to Chit #" + chitNum,
          sender: qRecipient,
          message: rText,
          isReply: true,
          hasBeenAnswered: false,
          answerText: ""
        });
      }
    }
    else if (qRecipient === user) {
      dashboard.stats.totalReceived++;
      dashboard.inbox.push({
        rowNumber: rowNum,
        timestamp: "Chit #" + chitNum,
        sender: qSender,
        message: qText,
        isReply: false,
        hasBeenAnswered: (rText !== ""),
        answerText: rText              
      });
      
      if (rText !== "") {
        dashboard.stats.repliesSent++;
        dashboard.sentHistory.push({
          type: "REPLY",
          to: qSender,
          text: rText,
          timestamp: "Reply to Chit #" + chitNum
        });
      }
    }
  }
  
  return dashboard;
}

// Sends chits with Floor Status & LockService protection
function sendChit(sender, recipient, message, targetRowNumber) {
  if (checkFloorStatus() !== "OPEN") {
    throw new Error("The floor for chits is currently closed by the Executive Board.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000); 
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('POI CHITS');
    
    if (!sheet) {
      throw new Error("Sheet 'POI CHITS' not found!");
    }
    
    const cleanSender = sender.toString().toUpperCase();
    const cleanRecipient = recipient.toString().toUpperCase();
    const cleanMessage = message.toString().toUpperCase();
    
    if (targetRowNumber && targetRowNumber >= 11) {
      sheet.getRange(targetRowNumber, 6).setValue(cleanMessage);
      return true;
    }
    
    const bValues = sheet.getRange("B11:B").getValues();
    let nextRow = 11;
    
    for (let i = 0; i < bValues.length; i++) {
      if (bValues[i][0] === "") {
        nextRow = 11 + i;
        break;
      }
    }
    
    sheet.getRange(nextRow, 2).setValue(cleanSender);    
    sheet.getRange(nextRow, 3).setValue(cleanMessage);   
    sheet.getRange(nextRow, 5).setValue(cleanRecipient); 
    
    return true;
    
  } finally {
    lock.releaseLock();
  }
}

// Creates two separate top-level menus inside the spreadsheet toolbar
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Recorder')
    .addItem('Open Speech Recorder', 'showSpeechSidebar')
    .addToUi();
    
  ui.createMenu('Document')
    .addItem('Open Document Uploader', 'showDocSidebar')
    .addToUi();
}

function showSpeechSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('SpeechSidebar')
      .setTitle('Speech Verbatim Recorder')
      .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showDocSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('DocSidebar')
      .setTitle('Document Uploader')
      .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

// Master country extractor from ROLL CALL subsheet (A4:A)
function getCountriesForSession(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('ROLL CALL');
    let startRow = 4; 
    
    if (!sheet || sheet.getLastRow() < startRow) {
      sheet = ss.getSheetByName('Portfolios') || ss.getSheetByName(sheetName);
      startRow = 2;
    }
    
    if (!sheet) return ["Error: ROLL CALL sheet not found"];
    
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return ["No countries found in ROLL CALL"];
    
    const data = sheet.getRange(startRow, 1, lastRow - (startRow - 1), 1).getValues();
    const countries = [];
    
    for (let i = 0; i < data.length; i++) {
      let cellValue = data[i][0];
      if (cellValue && cellValue.toString().trim() !== "") {
        countries.push(cellValue.toString().trim());
      }
    }
    
    return countries.length > 0 ? countries : ["No countries found in ROLL CALL Column A"];
  } catch (e) {
    return ["Error: " + e.message];
  }
}

// =========================================================================
// ON-DEMAND (LAZY) FOLDER CREATION ENGINE
// =========================================================================
function getOrCreateSubFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

function getMainConferenceFolder() {
  if (!MAIN_CONFERENCE_FOLDER_ID || MAIN_CONFERENCE_FOLDER_ID === "YOUR_FOLDER_ID_HERE" || MAIN_CONFERENCE_FOLDER_ID.trim() === "") {
    throw new Error("Missing Main Conference Folder ID! Please paste your Google Drive Folder ID into Code.gs.");
  }
  try {
    return DriveApp.getFolderById(MAIN_CONFERENCE_FOLDER_ID.trim());
  } catch (e) {
    throw new Error("Invalid Main Conference Folder ID! Please check the ID in Code.gs. Error: " + e.message);
  }
}

// ==========================================
// AI TRANSCRIPTION ENGINE (GROQ WHISPER-V3)
// ==========================================
function transcribeAudioGroq(audioBlob) {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === "") {
    throw new Error("Missing Groq API Key! Please paste your key at the top of Code.gs.");
  }

  const url = "https://api.groq.com/openai/v1/audio/transcriptions";
  
  const munVocabularyPrompt = "Model United Nations delegate speech, UNHRC, GSL, Moderated Caucus, POI, draft resolution, Article 51, yield the floor, sovereignty, human rights, Republic of France, United Kingdom, USA, Russia, China.";

  const payload = {
    "file": audioBlob,
    "model": "whisper-large-v3",
    "language": "en",
    "prompt": munVocabularyPrompt
  };
  
  const options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + GROQ_API_KEY
    },
    "payload": payload,
    "muteHttpExceptions": true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  const json = JSON.parse(responseText);
  
  if (json.text) {
    return json.text;
  } else {
    throw new Error("Groq API Error: " + (json.error ? json.error.message : responseText));
  }
}

// Saves MP3 into dynamic session folder, transcribes, sets HYPERLINK, and enforces classic blue styling
function saveSpeechRecord(sheetName, tableIndex, countryName, base64Data, mimeType, transcriptText) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); 
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet '" + sheetName + "' not found!");
    
    const lastRow = sheet.getLastRow();
    const countries = sheet.getRange(3, 1, Math.max(1, lastRow - 2), 1).getValues();
    let targetRow = -1;
    
    for (let i = 0; i < countries.length; i++) {
      if (countries[i][0].toString().trim().toLowerCase() === countryName.trim().toLowerCase()) {
        targetRow = 3 + i; 
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error("Country '" + countryName + "' not found in Column A of sheet: " + sheetName);
    }
    
    const tblNum = parseInt(tableIndex) || 1;
    const targetCol = 2 + (tblNum - 1) * 8;
    
    const ext = mimeType.includes("mp3") || mimeType.includes("mpeg") ? ".mp3" : ".webm";
    const decoded = Utilities.base64Decode(base64Data);
    const fileName = sheetName + "_Table" + tblNum + "_" + countryName.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now() + ext;
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    // Lazy Folder Creation: Main Conference Folder -> [Session Folder e.g., "GSL" or "MOD 1"]
    const mainFolder = getMainConferenceFolder();
    const sessionFolder = getOrCreateSubFolder(mainFolder, sheetName);
    const file = sessionFolder.createFile(blob);
    const fileUrl = file.getUrl();
    
    let finalTranscript = "";
    try {
      finalTranscript = transcribeAudioGroq(blob);
    } catch (apiError) {
      finalTranscript = (transcriptText ? transcriptText.trim() : "") + " [NOTE: USED BROWSER FALLBACK. AI ERROR: " + apiError.message + "]";
    }
    
    const cleanTranscript = (finalTranscript ? finalTranscript.trim() : "(NO SPEECH DETECTED)").toUpperCase();
    const targetCell = sheet.getRange(targetRow, targetCol);
    
    // =========================================================
    // NEW: MULTI-RECOGNITION LOGIC FOR SELF-MODERATED CONSULTATION
    // (Now applies to any sheet starting with "SELF-MODERATED CONSULTATION")
    // =========================================================
    if (sheetName.trim().toUpperCase().startsWith("SELF-MODERATED CONSULTATION")) {
      
      const existingRichText = targetCell.getRichTextValue();
      const existingText = existingRichText ? existingRichText.getText() : "";
      
      // Determine the next recognition prefix
      const recWords = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH"];
      const recCount = (existingText.match(/RECOGNITION:/g) || []).length;
      const recPrefix = (recWords[recCount] || (recCount + 1) + "TH") + " RECOGNITION: ";
      
      const newTextPart = recPrefix + cleanTranscript;
      
      // If there's already text, append with a double line break for clean formatting
      const fullText = existingText ? existingText + "\n\n" + newTextPart : newTextPart;
      
      let builder = SpreadsheetApp.newRichTextValue().setText(fullText);
      
      // 1. Re-apply hyperlinks to previous recognitions so they aren't lost
      if (existingRichText) {
        const runs = existingRichText.getRuns();
        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          const url = run.getLinkUrl();
          if (url) {
            builder.setLinkUrl(run.getStartIndex(), run.getEndIndex(), url);
            builder.setTextStyle(run.getStartIndex(), run.getEndIndex(), run.getTextStyle());
          }
        }
      }
      
      // 2. Apply the new hyperlink strictly to the verbatim part (excluding the prefix)
      const newLinkStart = fullText.length - cleanTranscript.length;
      const newLinkEnd = fullText.length;
      builder.setLinkUrl(newLinkStart, newLinkEnd, fileUrl);
      
      const linkStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor("#1155cc")
        .setUnderline(true)
        .build();
      builder.setTextStyle(newLinkStart, newLinkEnd, linkStyle);
      
      // Clear standard formula/text, then push the Rich Text object
      targetCell.clearContent(); 
      targetCell.setRichTextValue(builder.build());
      
    } else {
      // =========================================================
      // STANDARD LOGIC FOR GSL, MODS (Overwrites Cell)
      // =========================================================
      const escapedTranscript = cleanTranscript.replace(/"/g, '""');
      targetCell.setFormula('=HYPERLINK("' + fileUrl + '", "' + escapedTranscript + '")');
      targetCell.setFontColor("#1155cc");       
      targetCell.setFontLine("underline");      
    }
    
    return "Saved successfully for " + countryName + ".";
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// DOCUMENT UPLOADER WITH DYNAMIC FOLDERS & MULTI-AUTHOR ROUTING
// =========================================================================
function saveDocumentRecord(tableIndex, countryNamesArray, base64Data, fileName, customName) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); 
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DOCUMENTATION');
    if (!sheet) throw new Error("Sheet 'DOCUMENTATION' not found!");
    
    const countriesList = Array.isArray(countryNamesArray) ? countryNamesArray : [countryNamesArray];
    if (countriesList.length === 0) throw new Error("No authors selected.");
    
    const lastRow = sheet.getLastRow();
    const countries = sheet.getRange(5, 1, Math.max(1, lastRow - 4), 1).getValues();
    
    const tblNum = parseInt(tableIndex, 10) || 1;
    const targetCol = 2 + (tblNum - 1) * 6;
    
    let docLabel = "";
    let driveFileName = "";
    const leadAuthor = countriesList[0].replace(/[^a-zA-Z0-9]/g, "_");
    
    if (tblNum === 1) {
      let drNum = 0;
      for (let c = 0; c < countriesList.length; c++) {
        const cName = countriesList[c].trim().toLowerCase();
        for (let i = 0; i < countries.length; i++) {
          if (countries[i][0].toString().trim().toLowerCase() === cName) {
            const targetRow = 5 + i;
            const existingVal = sheet.getRange(targetRow, targetCol).getDisplayValue().toString().toUpperCase();
            const match = existingVal.match(/DR\s*(\d+)/);
            if (match) {
              drNum = parseInt(match[1], 10);
              break;
            }
          }
        }
        if (drNum > 0) break;
      }
      
      if (drNum === 0) {
        const allDrVals = sheet.getRange(5, 2, Math.max(1, sheet.getLastRow() - 4), 1).getDisplayValues();
        let maxNum = 0;
        for (let i = 0; i < allDrVals.length; i++) {
          const m = allDrVals[i][0].toString().toUpperCase().match(/DR\s*(\d+)/);
          if (m && parseInt(m[1], 10) > maxNum) {
            maxNum = parseInt(m[1], 10);
          }
        }
        drNum = maxNum + 1;
      }
      
      docLabel = "DR " + drNum + ".0";
      driveFileName = "MUN_" + docLabel.replace(/\s+/g, "_") + "_" + leadAuthor + ".pdf";
    } else {
      if (customName && customName.toString().trim() !== "") {
        docLabel = customName.toString().trim().toUpperCase();
      } else {
        docLabel = fileName.replace(/\.[^/.]+$/, "").toUpperCase();
      }
      driveFileName = "MUN_DOC_" + leadAuthor + "_" + fileName;
    }
    
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, 'application/pdf', driveFileName);
    
    // Lazy Folder Creation: Main Conference Folder -> DOCUMENTATION -> [DRAFT RESOLUTIONS or ADDITIONAL DOCUMENTATION]
    const mainFolder = getMainConferenceFolder();
    const docFolder = getOrCreateSubFolder(mainFolder, "DOCUMENTATION");
    const subFolderName = (tblNum === 1) ? "DRAFT RESOLUTIONS" : "ADDITIONAL DOCUMENTATION";
    const targetFolder = getOrCreateSubFolder(docFolder, subFolderName);
    
    const file = targetFolder.createFile(blob);
    const fileUrl = file.getUrl();
    
    const escapedLabel = docLabel.replace(/"/g, '""');
    let updatedCount = 0;
    
    for (let c = 0; c < countriesList.length; c++) {
      const cName = countriesList[c].trim().toLowerCase();
      for (let i = 0; i < countries.length; i++) {
        if (countries[i][0].toString().trim().toLowerCase() === cName) {
          const targetRow = 5 + i;
          const targetCell = sheet.getRange(targetRow, targetCol);
          targetCell.setFormula('=HYPERLINK("' + fileUrl + '", "' + escapedLabel + '")');
          targetCell.setFontColor("#1155cc");       
          targetCell.setFontLine("underline");
          updatedCount++;
          break;
        }
      }
    }
    
    return "Uploaded " + docLabel + " successfully for " + updatedCount + " author(s).";
  } finally {
    lock.releaseLock();
  }
}