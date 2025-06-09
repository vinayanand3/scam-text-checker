# Scam Text Checker 🔍

**Scam Text Checker** is a lightweight Chrome extension that helps you detect suspicious or scam-like text messages using Google’s Gemini AI.

---

## 📦 Features

- Paste any suspicious message
- Get an instant AI-based verdict:
  - ✅ Likely Safe
  - ⚠️ Potential Scam
  - 🚨 Likely Scam
- Clear explanation in simple language
- Beautiful TailwindCSS-powered UI

---

## 🚀 Installation Instructions

### Load the Extension in Chrome:
1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **“Load unpacked”**.
5. Select the `scam-text-checker` folder.

You're ready to go!

---

## 🔐 Setup API Key

This extension uses the **Gemini API** by Google:

1. Visit: [https://makersuite.google.com/app](https://makersuite.google.com/app)
2. Generate your API key.
3. In `popup.js`, find the line:

```js
const apiKey = "";
