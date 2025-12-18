      
async function translateText(text) {
    if (!text) return '';

    // This endpoint calls your secure serverless function (gemini-translate.js)
    const endpoint = '/.netlify/functions/gemini-translate';
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Send the Burmese text securely in the request body
        body: JSON.stringify({ text_to_translate: text }),
    });

    if (!response.ok) {
        // Handle server-side errors
        const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
        throw new Error(`Server translation failed: ${response.statusText}. Details: ${errorData.error}`);
    }

    const data = await response.json();
    
    // The server function sends back the final translated prompt
    if (data.final_prompt_en) {
        return data.final_prompt_en;
    } else {
        throw new Error("Invalid response format from the secure translation server.");
    }
}
    
document.addEventListener("DOMContentLoaded", () => {
        const mainToggleBtn = document.getElementById("main-examples-toggle");
        const mainContent = document.getElementById("main-examples-content");
    
            if (mainToggleBtn && mainContent) {
                mainToggleBtn.addEventListener("click", () => {
                    mainToggleBtn.classList.toggle("active");
                    mainContent.classList.toggle("active");
                });
                mainToggleBtn.classList.add("active");
                mainContent.classList.add("active");
            }
    
    
            // 2. Individual Example Accordion Logic (Keep original logic)
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
                generatePromptBtn.addEventListener("click", async (event) => {
                    event.preventDefault(); 
                    localStorage.removeItem('promptData');

                    // 1. Retrieve the Burmese inputs using the CORRECT SSAEL IDs
                    const style_mm = document.getElementById("style-main").value;
                    const subject_mm = document.getElementById("subject-main").value;
                    const action_mm = document.getElementById("action-main").value;
                    const environment_mm = document.getElementById("environment-main").value;
                    const lighting_mm = document.getElementById("lighting-main").value;
    
                    const fullBurmesePrompt = `Image Style: ${style_mm}, Subject: ${subject_mm}, Action: ${action_mm}, Environment: ${environment_mm}, Lighting: ${lighting_mm}`;                    // Display a loading message
                    
                    generatePromptBtn.textContent = 'Translating and Generating...';
                    generatePromptBtn.disabled = true;
    
                    try {
                        // 2. Call the client-side translation function
                        const final_prompt_en = await translateText(fullBurmesePrompt);
    
                        // 3. Package the final result data
                        const dataToSave = {
                            success: true,
                            source: 'image', // **CRITICAL: Set source to 'image'**
                            
                            // Save original Burmese inputs for display on result page
                            style_mm: style_mm,
                            subject_mm: subject_mm,
                            action_mm: action_mm,
                            environment_mm: environment_mm,
                            lighting_mm: lighting_mm,
                            
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
                        alert('Translation Error: ' + error.message + '. Please ensure your browser is connected to the internet.');
                    }
                });
            }
    
            // --- NEW LOGIC: Clear Input Fields ---
            const resetBtn = document.getElementById("reset-cprf-btn");
    
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    // Clear all five SSAEL input fields
                    document.getElementById("style-main").value = '';
                    document.getElementById("subject-main").value = '';
                    document.getElementById("action-main").value = '';
                    document.getElementById("environment-main").value = '';
                    document.getElementById("lighting-main").value = '';
                    
                    document.getElementById("style-main").focus();
                });
            }
        });