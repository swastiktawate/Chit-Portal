# Security Policy

The HINDUJA MUN 2026 Chit Portal handles delegate PINs, POI content, and Drive uploads for a live conference. We take security seriously and appreciate the community's help keeping it safe.

---

## 📌 Table of Contents

- [Supported Versions](#-supported-versions)
- [Reporting a Vulnerability](#-reporting-a-vulnerability)
- [What to Include in Your Report](#-what-to-include-in-your-report)
- [Scope](#-scope)
- [Out of Scope](#-out-of-scope)
- [Security Best Practices for Contributors](#-security-best-practices-for-contributors)
- [Known Security Controls](#-known-security-controls)

---

## 🔢 Supported Versions

This project is under active development. Security fixes are applied to the latest version on the `main` branch only.

| Branch / Version | Supported |
|---|---|
| `main` (latest) | ✅ Yes |
| Older forks / branches | ❌ No |

---

## 🛡️ Reporting a Vulnerability

If you find a security issue, please **do not open a public issue**. Instead, report it privately to the maintainer (via GitHub's private vulnerability reporting, or by contacting the repo owner directly) so it can be fixed before public disclosure.

---

## 📋 What to Include in Your Report

- A clear description of the vulnerability and its potential impact
- Steps to reproduce it
- Any relevant logs, screenshots, or proof-of-concept code
- Suggested fix, if you have one

---

## 🎯 Scope

- `Code.gs` — authentication (`validateLogin`), chit read/write logic, Drive folder routing, Groq API integration
- `Index.html`, `SpeechSidebar.html`, `DocSidebar.html` — client-side code served via `HtmlService`

## 🚫 Out of Scope

- Google's own infrastructure (Apps Script runtime, Sheets, Drive) — report those directly to Google
- Groq's API infrastructure — report those to Groq
- Issues that require physical or account-level access to the bound conference Sheet that a legitimate committee member would already have

---

## 🔧 Security Best Practices for Contributors

- **Never commit API keys, folder IDs, or delegate PINs.** `GROQ_API_KEY` and `MAIN_CONFERENCE_FOLDER_ID` must always be read from Script Properties, never hardcoded.
- If you ever paste a real key into `Code.gs` for local testing, remove it before committing.
- Keep the `Portfolios` sheet (which holds delegate PINs) access-restricted to Executive Board members only.
- Validate and sanitize any new user-supplied input before writing it into `HYPERLINK()` formulas or `RichTextValue` — the existing code escapes quotes for this reason.

---

## ✅ Known Security Controls

- `LockService.getScriptLock()` wraps every chit send, speech save, and document upload to prevent race conditions from concurrent submissions.
- Delegate authentication is PIN-based against the `Portfolios` sheet — no passwords are stored beyond what a spreadsheet owner already controls.
- Secrets (`GROQ_API_KEY`, `MAIN_CONFERENCE_FOLDER_ID`) are stored in Apps Script's Script Properties, not in source.
- User-controlled strings inserted into spreadsheet formulas (`HYPERLINK`) are quote-escaped to avoid formula injection.

---

## 📣 Disclosure Policy

Once a reported vulnerability is fixed, we'll credit the reporter (unless they prefer to stay anonymous) in the release notes or commit message.
