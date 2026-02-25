// async function translateText(text) {
//     if (!text) return '';

//     // This endpoint calls your secure serverless function
//     const endpoint = "/.netlify/functions/gemini-translate";
//     const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         // Send the Burmese text securely in the request body
//         body: JSON.stringify({ text_to_translate: text }),
//     }); 

//     if (!response.ok) {
//         // Handle server-side errors securely
//         const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
//         throw new Error(`Server translation failed: ${response.statusText}. Details: ${errorData.error}`);
//     }

//     const data = await response.json();
    
//     // The server function sends back the final translated prompt
//     if (data.final_prompt_en) {
//         return data.final_prompt_en;
//     } else {
//         throw new Error("Invalid response format from the secure translation server.");
//     }
// }
// // --- END NEW SECURE FUNCTION ---

// document.addEventListener("DOMContentLoaded", () => {
//     // [Keep all existing Accordion and Master Toggle logic here if present]
//      // 1. Master Examples Toggle Logic (Keep original logic)
//      const mainToggleBtn = document.getElementById("main-examples-toggle");
//     const mainContent = document.getElementById("main-examples-content");

//     if (mainToggleBtn && mainContent) {
//         mainToggleBtn.addEventListener("click", () => {
//             mainToggleBtn.classList.toggle("active");
//             mainContent.classList.toggle("active");
//         });
//         mainToggleBtn.classList.add("active");
//         mainContent.classList.add("active");
//     }


//     // 2. Individual Example Accordion Logic (Keep original logic)
//     const accordionHeaders = document.querySelectorAll(".accordion-header");

//     accordionHeaders.forEach(header => {
//         header.addEventListener("click", () => {
//             const targetId = header.getAttribute("data-example");
//             const targetContent = document.getElementById(targetId);

//             accordionHeaders.forEach(h => {
//                 if (h !== header) {
//                     h.classList.remove("active");
//                     document.getElementById(h.getAttribute("data-example")).classList.remove("active");
//                 }
//             });

//             targetContent.classList.toggle("active");
//             header.classList.toggle("active");
//         });
//     });

//     document.querySelectorAll(".accordion-content").forEach(content => content.classList.remove("active"));
//     document.querySelectorAll(".accordion-header").forEach(header => header.classList.remove("active"));


//     const generatePromptBtn = document.getElementById("generate-prompt-btn");

//     if (generatePromptBtn) {
//         generatePromptBtn.addEventListener("click", async (event) => {
//             event.preventDefault(); 
//             localStorage.removeItem('promptData');

//             // 1. Retrieve all seven input values (SSAELSA)
//             const style_mm = document.getElementById("style-main").value;
//             const subject_mm = document.getElementById("subject-main").value;
//             const action_mm = document.getElementById("action-main").value;
//             const environment_mm = document.getElementById("environment-main").value;
//             const lighting_mm = document.getElementById("lighting-main").value;
//             // Assuming you use these IDs for Scene Dynamics and Audio
//             const camera_mm = document.getElementById("scene-main").value; 
//             const audio_mm = document.getElementById("audio-main").value;

            
//             // Combine inputs for translation. Use commas to separate concepts.
//             const fullBurmesePrompt = `Video Style: ${style_mm}, Subject: ${subject_mm}, Action: ${action_mm}, Environment: ${environment_mm}, Lighting: ${lighting_mm}, Camera: ${camera_mm}, Audio: ${audio_mm}`;
//             // Display a loading message
//             generatePromptBtn.textContent = 'Translating and Generating...';
//             generatePromptBtn.disabled = true;

//             try {
//                 // 2. Call the client-side translation function
//                 const final_prompt_en = await translateText(fullBurmesePrompt);

//                 // 3. Package the final result data
//                 const dataToSave = {
//                     success: true,
//                     source: 'video', // **CRITICAL: Set source to 'video'**
                    
//                     // Save original Burmese inputs for display on result page
//                     style_mm: style_mm,
//                     subject_mm: subject_mm,
//                     action_mm: action_mm,
//                     environment_mm: environment_mm,
//                     lighting_mm: lighting_mm,
//                     camera_mm: camera_mm, // Scene Dynamics
//                     audio_mm: audio_mm,   // Audio
                    
//                     // The dynamically translated result
//                     final_prompt_en: final_prompt_en
//                 };

//                 // 4. Save the data to localStorage
//                 localStorage.setItem('promptData', JSON.stringify(dataToSave));

//                 // Restore button state
//                 generatePromptBtn.textContent = '✅ Generate & View Prompt';
//                 generatePromptBtn.disabled = false;

//                 // 5. Redirect to the result page
//                 window.location.href = `result.html`;

//             } catch (error) {
//                 // Restore button state and show alert
//                 generatePromptBtn.textContent = '❌ Translation Failed. Try Again.';
//                 generatePromptBtn.disabled = false;
//                 console.error('Translation Error:', error);
//                 alert('Translation Error: ' + error.message + '. Please ensure your browser is connected to the internet.');
//             }
//         });
//     }

//     // --- NEW LOGIC: Clear Input Fields (Updated for 7 SSAELSA fields) ---
//     const resetBtn = document.getElementById("reset-cprf-btn");

//     if (resetBtn) {
//         resetBtn.addEventListener("click", () => {
//             // Clear all seven SSAELSA input fields
//             document.getElementById("style-main").value = '';
//             document.getElementById("subject-main").value = '';
//             document.getElementById("action-main").value = '';
//             document.getElementById("environment-main").value = '';
//             document.getElementById("lighting-main").value = '';
//             document.getElementById("scene-main").value = ''; // Scene Dynamics
//             document.getElementById("audio-main").value = '';   // Audio
            
//             document.getElementById("style-main").focus();
//         });
//     }
// });


// OpenRouter ကို ခေါ်ယူမည့် Secure Translation Function
async function translateText(text) {
    if (!text) return '';

    // Netlify Function Endpoint
    const endpoint = "/.netlify/functions/gemini-translate";
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text_to_translate: text }),
        }); 

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
            throw new Error(`Server translation failed: ${response.statusText}. Details: ${errorData.error}`);
        }

        const data = await response.json();
        
        if (data.final_prompt_en) {
            return data.final_prompt_en;
        } else {
            throw new Error("Invalid response format.");
        }
    } catch (error) {
        console.error("Translation Error:", error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Accordion & Toggle Logic (Original logic preserved)
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

    // 2. Video Prompt Generation Logic
    const generatePromptBtn = document.getElementById("generate-prompt-btn");

    if (generatePromptBtn) {
        generatePromptBtn.addEventListener("click", async (event) => {
            event.preventDefault(); 
            localStorage.removeItem('promptData');

            // 7 SSAELSA Inputs ရယူခြင်း
            const style_mm = document.getElementById("style-main").value;
            const subject_mm = document.getElementById("subject-main").value;
            const action_mm = document.getElementById("action-main").value;
            const environment_mm = document.getElementById("environment-main").value;
            const lighting_mm = document.getElementById("lighting-main").value;
            const camera_mm = document.getElementById("scene-main").value; 
            const audio_mm = document.getElementById("audio-main").value;

            if(!subject_mm || !action_mm) {
                alert("ကျေးဇူးပြု၍ အဓိကအကြောင်းအရာနှင့် လုပ်ဆောင်ချက်ကို ဖြည့်ပေးပါ!");
                return;
            }

            // AI အတွက် Video Specific Instruction
            // ဤနေရာတွင် AI ကို Video Model များနားလည်အောင် Prompt ထုတ်ခိုင်းပါသည်
            const videoInstruction = `
            [STRICT RULE: OUTPUT ONLY THE VIDEO GENERATION PROMPT. NO INTRO, NO ADVICE, NO TIPS.]

            Task: Create a highly detailed, cinematic English video prompt based on these Burmese inputs:
            - Style: ${style_mm}
            - Subject: ${subject_mm}
            - Action: ${action_mm}
            - Environment: ${environment_mm}
            - Lighting: ${lighting_mm}
            - Camera Motion: ${camera_mm}
            - Audio/Sound Context: ${audio_mm}

            Instructions: 
            Combine these into a single, professional English paragraph (approx 60-100 words). 
            Focus on visual movement, textures, and cinematic atmosphere. 
            Use technical terms like "4k resolution", "highly detailed", "photorealistic", and "fluid motion".
            Output ONLY the English paragraph.
            `;

            generatePromptBtn.textContent = '🎬 Generating Cinematic Prompt...';
            generatePromptBtn.disabled = true;

            try {
                // Call the translation/generation function
                const final_prompt_en = await translateText(videoInstruction);
                final_prompt_en = final_prompt_en.replace(/\*/g, '').trim();
                
                const dataToSave = {
                    success: true,
                    source: 'video', 
                    style_mm, subject_mm, action_mm, environment_mm, lighting_mm, camera_mm, audio_mm,
                    final_prompt_en: final_prompt_en
                };

                localStorage.setItem('promptData', JSON.stringify(dataToSave));
                generatePromptBtn.textContent = '✅ Success! Redirecting...';

                setTimeout(() => {
                    window.location.href = `result.html`;
                }, 800);

            } catch (error) {
                generatePromptBtn.textContent = '❌ Generation Failed. Try Again.';
                generatePromptBtn.disabled = false;
                alert('Error: ' + error.message);
            }
        });
    }

    // 3. Reset Logic (Clear all 7 fields)
    const resetBtn = document.getElementById("reset-cprf-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const fields = ["style-main", "subject-main", "action-main", "environment-main", "lighting-main", "scene-main", "audio-main"];
            fields.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = '';
            });
            document.getElementById("style-main").focus();
        });
    }
});