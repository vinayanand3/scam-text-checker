# Scam Text Checker 🔍

**Scam Text Checker** is a Chrome extension that analyzes a piece of text to determine if it's likely a scam. It uses a Google Cloud Function as a secure backend to process requests with the Google Gemini API.


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


## Architecture

The project is composed of two main parts:
1.  **Frontend**: A browser-based Chrome Extension that serves as the user interface.
2.  **Backend**: A secure Google Cloud Function that receives text from the extension, calls the Gemini API with a secret API key, and returns the analysis.

---

## Setup Instructions

To get this project running, you'll need to set up the backend on Google Cloud and then link it to the frontend extension.

### Prerequisites

* A Google Cloud Platform (GCP) project with **billing enabled**. This is required to use the Vertex AI and Cloud Functions APIs.
* A Google Gemini API Key obtained from [Google AI Studio](https://ai.google.dev/).
* The `gcloud` command-line tool (optional, but recommended for managing your project).

### Part 1: Backend Setup - Google Cloud Function

Follow these steps to create and configure the secure backend.

#### Step 1: Store your Gemini API Key

Never expose your API key in frontend code. We will store it securely using Google's Secret Manager.

1.  In the Google Cloud Console, navigate to **Secret Manager**.
2.  Click **Create Secret**.
3.  **Name**: `gemini-api-key`
4.  **Secret value**: Paste your Gemini API key.
5.  Click **Create secret**.

#### Step 2: Create the Cloud Function

1.  Navigate to **Cloud Functions** in the Google Cloud Console.
2.  Click **Create function**.
3.  Configure the function basics:
    * **Environment**: `2nd gen`
    * **Function name**: `analyzeText`
    * **Region**: Choose a region (e.g., `us-central1`).
    * **Authentication**: Select **"Allow unauthenticated invocations"**. This allows the Chrome extension to call the function.
4.  Click **Next** to go to the code editor.

#### Step 3: Configure Code and Runtime

1.  Set the **Runtime** to `Node.js 20`.
2.  Set the **Entry point** to `analyzeText`.
3.  In the source code editor, replace the contents of `package.json` and `index.js` with the code below.

**`package.json`**
```json
{
  "name": "gemini-scam-analyzer",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@google/generative-ai": "^0.1.0"
  }
}
```

**`index.js`**
```
const functions = require('@google-cloud/functions-framework');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

functions.http('analyzeText', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided for analysis.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            Analyze the following text to determine if it is a scam.
            Provide a clear verdict and a brief explanation separated by "|||".
            The verdict should be one of these: "Highly Likely Scam", "Potentially Suspicious", or "Likely Safe".

            Text to analyze: "${text}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysis = response.text();

        res.status(200).json({ analysis });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to analyze text with Gemini API." });
    }
});
```

### Step 4: Link the Secret Key to the Function

1. Below the code editor, go to the **Variables & Secrets** tab  
   *(may also be under `Runtime, build and connections settings > Security and authentication`)*.
2. Find the section for **Secrets** and click **Reference a secret** or **Add Secret**.
3. Configure the reference:
   - **Secret**: Select the `gemini-api-key` you created.
   - **Reference method**: Choose `Exposed as environment variable`.
   - **Name**: `GEMINI_API_KEY`
4. Click **Done**.

```

### Step 5: Deploy and Fix Permissions

1. Click the **Deploy** button.
2. **IMPORTANT**: The first deployment will likely fail with a `Permission denied` error. This is expected.  
   The error message will mention a service account email address (e.g., `...-compute@developer.gserviceaccount.com`).
3. Copy that service account email address.
4. Go back to **Secret Manager** and select your `gemini-api-key`.
5. Go to the **Permissions** tab and click **Grant Access**.
6. **New principals**: Paste the service account email you copied.
7. **Role**: Select `Secret Manager Secret Accessor`.
8. Click **Save**.
9. Go back to **Cloud Functions** and deploy the function again. It will now succeed.

```

## Part 2: Frontend Setup – Linking the Extension

### Step 1: Get the Deployed Function's URL

1. After the function deploys successfully, navigate to **Cloud Run** in the Google Cloud Console.
2. Click on your `analyzetext` service.
3. At the top of the details page, you will find the **URL**. Copy it.

### Step 2: Update `popup.js`

1. Open the `popup.js` file in the extension's folder.
2. Find the `CLOUD_FUNCTION_URL` constant.
3. Paste the URL you copied from the Cloud Console into the quotes.

```js
// Before
const CLOUD_FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_TRIGGER_URL_HERE';

// After (example)
const CLOUD_FUNCTION_URL = 'https://analyzetext-your-unique-id-uc.a.run.app';
```
### Part 3: Running the Extension

1. Open **Google Chrome** and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the folder containing your extension's files (`manifest.json`, etc.).
4. The extension is now installed and ready to use.



### Updating the Cloud Function

To update the function's code (for example, to change the prompt):

1. Navigate to **Cloud Run** in the Google Cloud Console.
2. Click on your `analyzetext` service.
3. Click **Edit & deploy new revision**.
4. This will take you to the code editor where you can make changes to `index.js` or other settings.
5. Click **Deploy** to publish the new version.  
   The **URL will remain the same**.
