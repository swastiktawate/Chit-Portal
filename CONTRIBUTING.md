# 🤝 Contributing to HINDUJA MUN 2026 — Chit Portal

Thanks for taking the time to contribute! Whether you're fixing a bug, adding a feature, improving docs, or just asking a question — you're welcome here.

---

## 📌 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Getting Started](#-getting-started)
- [Making Your Changes](#-making-your-changes)
- [Commit Message Convention](#-commit-message-convention)
- [Submitting a Pull Request](#-submitting-a-pull-request)
- [Style Guide](#-style-guide)

---

## 🧭 Code of Conduct

By participating in this project you agree to be respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the full standards.

---

## 💡 How Can I Contribute?

| Type | Examples |
|---|---|
| 🐛 **Bug Fix** | Fix broken chit sending, floor-status sync issues, edge cases in transcription |
| ✨ **New Feature** | New sidebar tools, better inbox filtering, delegate notifications |
| 📖 **Documentation** | Improve README/setup docs, clarify the spreadsheet schema |
| 🎨 **UI/UX** | Improve the portal's layout, accessibility, mobile responsiveness |
| 🔧 **Refactor** | Clean up `Code.gs`, reduce duplication between sidebar HTML files |

---

## 🚀 Getting Started

1. Fork this repository.
2. Clone your fork locally.
3. Since this is a **container-bound** Apps Script project, you'll want a test Google Sheet with the tabs described in the [README's Spreadsheet Schema](README.md#-spreadsheet-schema) to actually run and test changes.
4. Use `clasp` to push your local changes into that test Sheet's Apps Script project (see [README Quick Start](README.md#-quick-start)).
5. Never commit real API keys — Script Properties only (see [README Configuration](README.md#️-configuration-script-properties)).

---

## 🛠️ Making Your Changes

- Keep `Code.gs` functions focused — one responsibility per function where possible.
- Match the existing naming style (`camelCase` functions, `_` suffix for "private" helpers like `getGroqApiKey_`).
- Test against a real (or sandbox) conference Sheet before opening a PR — Apps Script has no local test runner for `SpreadsheetApp`/`DriveApp` calls.
- Don't hardcode folder IDs, API keys, or conference-specific values — everything sensitive or deployment-specific belongs in Script Properties.

---

## 📝 Commit Message Convention

Use clear, imperative commit messages:

```
fix: correct floor-status check on inline replies
feat: add CSV export for sent chit history
docs: clarify ROLL CALL tab requirements
refactor: extract Drive folder helpers into their own section
```

---

## 📬 Submitting a Pull Request

1. Push your branch and open a PR against `main`.
2. Describe **what** changed and **why** — include screenshots/GIFs for UI changes where possible.
3. Note any new Script Properties or spreadsheet tabs/columns your change depends on.
4. Be responsive to review feedback — small, focused PRs get merged faster than large ones.

---

## 🎨 Style Guide

- **HTML/CSS**: match the existing navy/slate color system defined in each file's `:root` block — avoid introducing a new palette.
- **JS**: prefer `const`/`let` over `var` in new code (existing `var` usage in the popup recorder window is kept for compatibility, not as a style target).
- **Server-side**: wrap any multi-step write to the Sheet in `LockService` the same way `sendChit`, `saveSpeechRecord`, and `saveDocumentRecord` already do.

---

## ❓ Need Help?

Open an issue describing what you're trying to do — happy to help point you in the right direction.
