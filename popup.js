document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary HTML elements
    const checkButton = document.getElementById('check-button');
    const textInput = document.getElementById('text-input');
    const resultSection = document.getElementById('result-section');
    const resultTitle = document.getElementById('result-title');
    const resultExplanation = document.getElementById('result-explanation');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // !!! IMPORTANT !!!
    // Replace this placeholder with the trigger URL you will get after deploying your Google Cloud Function.
    const CLOUD_FUNCTION_URL = 'https://analyzetext-976519601042.us-central1.run.app';

    checkButton.addEventListener('click', async () => {
        const messageText = textInput.value;

        // --- UI State Management ---
        resultSection.classList.add('hidden');
        errorMessage.classList.add('hidden');

        if (CLOUD_FUNCTION_URL === 'YOUR_CLOUD_FUNCTION_TRIGGER_URL_HERE') {
            showError("The extension is not configured. Please set the Cloud Function URL in popup.js.");
            return;
        }
        
        if (!messageText.trim()) {
            showError("Please paste some text into the box before analyzing.");
            return;
        }

        loader.classList.remove('hidden');
        checkButton.disabled = true;
        checkButton.textContent = "Analyzing...";

        // --- API Call Logic (Now calling our secure backend) ---
        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: messageText }) // Send the text in the request body
            });

            if (!response.ok) {
                // Get error details from our function's response if available
                const errorResult = await response.json();
                throw new Error(errorResult.error || `Request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            const [verdict, explanation] = result.analysis.split('|||');

            if (verdict && explanation) {
                displayResult(verdict.trim(), explanation.trim());
            } else {
                displayResult("Analysis Incomplete", "The response from the server was not in the expected format.");
            }

        } catch (error) {
            console.error("Error calling the backend function:", error);
            showError(`Error: ${error.message}`);
        } finally {
            // --- UI Cleanup ---
            loader.classList.add('hidden');
            checkButton.disabled = false;
            checkButton.textContent = "Analyze Text";
        }
    });

    /**
     * Displays the analysis result in the UI.
     * @param {string} verdict The main conclusion (e.g., "Likely Scam").
     * @param {string} explanation The detailed reason for the verdict.
     */
    function displayResult(verdict, explanation) {
        resultTitle.textContent = verdict;
        resultExplanation.textContent = explanation;

        resultTitle.classList.remove('text-red-400', 'text-yellow-400', 'text-green-400', 'text-slate-300');
        if (verdict.includes('Scam')) {
            resultTitle.classList.add('text-red-400');
        } else if (verdict.includes('Safe')) {
            resultTitle.classList.add('text-green-400');
        } else if (verdict.includes('Potential')) {
             resultTitle.classList.add('text-yellow-400');
        } else {
             resultTitle.classList.add('text-slate-300');
        }

        resultSection.classList.remove('hidden');
    }
    
    /**
     * Displays an error message in the UI.
     * @param {string} message The error message to show.
     */
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});
