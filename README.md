# Hinduja MUN 2026 - Chit & Management Portal

A comprehensive Google Apps Script based web application and spreadsheet integration designed to manage a Model United Nations (MUN) committee. The portal facilitates digital chit-passing, AI-powered speech transcription, and automated document management.

## Features

### 1. Delegate Dashboard (Chit Portal)
- **Secure Login:** Validates delegate credentials (portfolio and PIN) against the committee roster.
- **Real-Time Chit Passing:** Delegates can send and receive Points of Information (POIs) or chits to other delegates.
- **Floor Status Control:** Executive Board can toggle whether the floor is "OPEN" or closed for chits.
- **Inbox & Sent History:** Organizes received questions, replies, and provides detailed statistics on delegate activity.

### 2. Speech Verbatim Recorder
- **In-Spreadsheet Sidebar:** Allows the Executive Board to record delegate speeches directly from the Google Sheets sidebar.
- **AI Transcription:** Integrates with the **Groq Whisper-v3 API** to provide rapid, highly accurate transcriptions of delegate speeches (customized with MUN vocabulary).
- **Dynamic Drive Storage:** Automatically generates necessary folders (e.g., GSL, MOD 1) in Google Drive and saves the `.mp3` or `.webm` audio files.
- **Automated Logging:** Logs transcriptions directly into the spreadsheet, hyperlinked to the original audio recording. Supports advanced multi-recognition logic for Self-Moderated Consultations.

### 3. Document Uploader
- **Draft Resolutions & Evidence:** Allows delegates or the EB to upload PDFs and documents directly via a sidebar.
- **Multi-Author Routing:** Automatically associates uploaded documents (like Draft Resolutions) with multiple sponsors/authors.
- **Drive Integration:** Dynamically categorizes uploads into specific folders (e.g., "DRAFT RESOLUTIONS" vs "ADDITIONAL DOCUMENTATION").
- **Spreadsheet Syncing:** Hyperlinks the uploaded files onto the tracking spreadsheet under the correct delegate rows.

## Setup & Installation

### 1. Google Apps Script Project
1. Create a new Google Sheet and open **Extensions > Apps Script**.
2. Copy the contents of `Code.js`, `Index.html`, `DocSidebar.html`, and `SpeechSidebar.html` into your project.
3. Deploy the project as a **Web App** (Execute as: Me, Who has access: Anyone).

### 2. Configure Script Properties (Security)
To protect your sensitive credentials, API keys are securely stored in Apps Script Properties.
1. In the Apps Script Editor, click the **Gear Icon (Project Settings)** on the left sidebar.
2. Scroll down to **Script Properties** and click **Add script property**.
3. Add the following properties:
   - `GROQ_API_KEY`: Your API key from Groq (for Whisper-v3 transcription).
   - `MAIN_CONFERENCE_FOLDER_ID`: The Google Drive Folder ID where all recordings and documents will be saved.

### 3. Spreadsheet Structure
Your connected Google Sheet must contain the following specific tabs to function correctly:
- `Portfolios`: Requires columns for Country/Portfolio Name and PINs for login validation.
- `POI CHITS`: For logging all sent and received chits. Floor status is read from cell `F7`.
- `ROLL CALL`: Master list of active countries in the current session.
- `DOCUMENTATION`: For tracking uploaded resolutions and evidence.
- *Session Sheets* (e.g., `GSL`, `SELF-MODERATED CONSULTATION`): Dynamic sheets where speech transcriptions are logged.

## Technical Stack
- **Backend:** Google Apps Script (JavaScript)
- **Frontend:** HTML, CSS, client-side JS (HtmlService)
- **AI Integration:** Groq API (whisper-large-v3)
- **Storage:** Google Drive API & Google Sheets API
