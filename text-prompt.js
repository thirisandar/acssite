document.addEventListener("DOMContentLoaded", () => {
    // 1. Master Examples Toggle Logic (Kept as is)
    const mainToggleBtn = document.getElementById("main-examples-toggle");
    const mainContent = document.getElementById("main-examples-content");

    if (mainToggleBtn && mainContent) {
        mainToggleBtn.addEventListener("click", () => {
            mainToggleBtn.classList.toggle("active");
            mainContent.classList.toggle("active");
        });
        // Set default state: The main toggle should start OPEN
        mainToggleBtn.classList.add("active");
        mainContent.classList.add("active");
    }


    // 2. Individual Example Accordion Logic (Kept as is)
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const targetId = header.getAttribute("data-example");
            const targetContent = document.getElementById(targetId);

            accordionHeaders.forEach(h => {
                if (h !== header) {
                    h.classList.remove("active");
                    document.getElementById(h.getAttribute("data-example")).classList.remove("active");
                }
            });

            targetContent.classList.toggle("active");
            header.classList.toggle("active");
        });
    });

    document.querySelectorAll(".accordion-content").forEach(content => content.classList.remove("active"));
    document.querySelectorAll(".accordion-header").forEach(header => header.classList.remove("active"));
    

    const generatePromptBtn = document.getElementById("generate-prompt-btn");

if (generatePromptBtn) {
// Must use 'async' because the translation process is asynchronous
generatePromptBtn.addEventListener("click", async (event) => {
    event.preventDefault(); 
    localStorage.removeItem('promptData');
    // 1. Retrieve the Burmese inputs
    const context_mm = document.getElementById("content-main").value;
    const persona_mm = document.getElementById("persona-main").value;
    const result_mm = document.getElementById("result-main").value;
    const format_mm = document.getElementById("format-main").value;
    
    // Combine all inputs into a single string for translation
    const fullBurmesePrompt = `${context_mm}${persona_mm}${result_mm}${format_mm}`;

    // Display a loading message
    generatePromptBtn.textContent = 'Translating and Generating...';
    generatePromptBtn.disabled = true;

    try {
        // 2. Call the new client-side translation function
        const final_prompt_en = await translateText(fullBurmesePrompt);

        // 3. Package the final result data
        const dataToSave = {
            success: true,
            source: 'text',
            context_mm: context_mm,
            persona_mm: persona_mm,
            result_mm: result_mm,
            format_mm: format_mm,
            // The dynamically translated result
            final_prompt_en: final_prompt_en
        };

        // 4. Save the data to localStorage
        localStorage.setItem('promptData', JSON.stringify(dataToSave));

        // Restore button state
        generatePromptBtn.textContent = '✅ Generate & View Prompt';
        generatePromptBtn.disabled = false;

        // 5. Redirect to the result page
        window.location.href = `result.html`;

    } catch (error) {
        // Restore button state and show alert
        generatePromptBtn.textContent = '❌ Translation Failed. Try Again.';
        generatePromptBtn.disabled = false;
        console.error('Translation Error:', error);
        alert('Client-Side Translation Error: ' + error.message + '. Please ensure your browser is connected to the internet.');
    }
});
}

// --- NEW SECURE Netlify Function Call using fetch ---
// --- Ensure this is the version used in your frontend JS files ---
// async function translateText(text) {
//     if (!text) return "";

//     // This points to the file we created in Step 3.
//     // Netlify automatically serves files in /netlify/functions/ at this URL path.
//     const endpoint = "/.netlify/functions/gemini-translate";

//     console.log("Sending to Gemini backend...");

//     try {
//         const response = await fetch(endpoint, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             // Sending the combined Burmese text
//             body: JSON.stringify({ prompt: text })
//         });

//         if (!response.ok) {
//             // Try to get error details from the backend
//             const errorData = await response.json().catch(() => ({ error: response.statusText }));
//             throw new Error(errorData.error || `Server error: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.final_prompt_en) {
//             console.log("Gemini Translation successful!");
//             // Return the clean English prompt
//             return data.final_prompt_en;
//         } else {
//             throw new Error("Invalid response format from translation server.");
//         }
//     } catch (error) {
//         console.error("Translation failed:", error);
//         // Re-throw the error so the button click handler sees it and shows the "X Failed" message
//         throw error; 
//     }
// }

// Inside your text-prompt.js file
async function translateText(text) {
    if (!text) return "";

    const endpoint = "/.netlify/functions/gemini-translate";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // CHANGE THIS LINE TO MATCH THE BACKEND exactly
            body: JSON.stringify({ text_to_translate: text }) 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        // The backend returns { final_prompt_en: ... } so this is correct
        if (data.final_prompt_en) {
            return data.final_prompt_en;
        } else {
            throw new Error("Invalid response format from translation server.");
        }
    } catch (error) {
        console.error("Translation failed:", error);
        throw error; 
    }
}
// --- END NEW SECURE FUNCTION ---
// --- Clear Input Fields Logic (Kept as is) ---
const resetBtn = document.getElementById("reset-cprf-btn");

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        document.getElementById("content-main").value = '';
        document.getElementById("persona-main").value = '';
        document.getElementById("result-main").value = '';
        document.getElementById("format-main").value = '';
        
        document.getElementById("content-main").focus();
    });
}
});