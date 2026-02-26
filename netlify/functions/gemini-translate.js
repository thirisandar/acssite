// // File: netlify/functions/gemini-translate.js
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// exports.handler = async (event, context) => {
//   // Only allow POST requests
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     // 1. Get the secret API key securely from Netlify's environment settings
//     // NEVER type the actual key here in the code.
//     // const apiKey = process.env.GEMINI_API_KEY;
//     const apiKey = process.env.OPENROUTER_API_KEY;

//     if (!apiKey) {
//         console.error("API Key not found in environment variables");
//         throw new Error("Server configuration error (API Key missing).");
//     }

//     // 2. Initialize Gemini
//     const genAI = new GoogleGenerativeAI(apiKey);
//     // Use 'gemini-pro' or the model you have access to
//     const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });        
//     // 3. Get the Burmese text from the frontend request
//     const requestBody = JSON.parse(event.body);
//     const burmeseTextToTranslate = requestBody.text_to_translate;

//     if (!burmeseTextToTranslate) {
//       throw new Error("No text provided for translation.");
//     }

//     // 4. Create the Mega-Prompt for Gemini
//     // This instructs Gemini to act as a translator and output ONLY English.
//     const systemPrompt = `
//     You are an expert AI prompt engineer and professional translator.
//     Your Task: Translate the following structured Burmese input into a single, high-quality, fluent English AI prompt.
//     Crucial Rules:
//     1. Output ONLY the final English translation.
//     2. Do NOT add introductory text like "Here is the translation:".
//     3. Do NOT add markdown formatting like bolding ** unless necessary for the prompt structure itself.
//     4. Ensure the English is professional and ready to be pasted into another LLM.

//     --- Burmese Input ---
//     ${burmeseTextToTranslate}
//     ---------------------
//     `;

//     // 5. Generate content
//     const result = await model.generateContent(systemPrompt);
//     const response = await result.response;
//     const translatedText = response.text();

//     // 6. Send the result back to your website securely
//     return {
//       statusCode: 200,
//       headers: {
//         "Content-Type": "application/json",
//         // Essential for CORS if your frontend and backend are on different domains during dev
//         "Access-Control-Allow-Origin": "*", 
//       },
//       body: JSON.stringify({ final_prompt_en: translatedText.trim() }),
//     };

//   } catch (error) {
//     console.error("Gemini Translation Error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message || "Failed to translate via Gemini API." }),
//     };
//   }
// };


// File: netlify/functions/gemini-translate.js
exports.handler = async (event, context) => {
  // CORS Preflight handling
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API Key missing.");

    const requestBody = JSON.parse(event.body);
    const burmeseTextToTranslate = requestBody.text_to_translate;

    if (!burmeseTextToTranslate) throw new Error("No text provided.");

    // --- ဤနေရာသည် အဓိက Update လုပ်ရမည့် အပိုင်းဖြစ်သည် ---
    // const systemPrompt = `
    // You are a professional AI Prompt Engineer and Translator.
    
    // CRITICAL RULES:
    // 1. If the input contains "Image Style:", "Video Style:", or "[STRICT RULE]", it is a GENERATION PROMPT. 
    //    - Output ONLY a single descriptive English paragraph.
    //    - NEVER provide advice, guides, "Do's and Don'ts", or conversation.
    //    - Focus on visual details, camera movements, and lighting.
    
    // 2. If the input is a general question or text request (e.g., "How to invest..."):
    //    - Provide a well-structured English guide or article.
    
    // 3. ALWAYS output ONLY the English result. No introductory text like "Here is the translation".
    // 4. Remove all markdown bold symbols (**) from the output.
    // `;

    const systemPrompt = `
    You are an Expert AI Prompt Engineer. Your goal is to transform simple Burmese requests into ELABORATE, high-performance English prompts.
    
    CRITICAL BEHAVIOR:
    - NEVER answer the user's question directly.
    - TRANSFORM the input into a professional instruction that is 3-5 sentences long.
    - START with powerful verbs: "Act as an expert...", "Generate a detailed...", "Create a cinematic...".

    TASK RULES:
    1. IMAGE PROMPTS (Visuals):
       - Expand the input into a rich descriptive paragraph.
       - Mandatory additions: Specify lighting (e.g., volumetric, golden hour), camera (e.g., 85mm lens, f/1.8), and technical specs (e.g., Unreal Engine 5 render, ray-tracing, 8k, photorealistic).
    
    2. VIDEO PROMPTS (Motion):
       - Focus on the "Story in Motion." 
       - Mandatory additions: Specify camera movement (e.g., "A slow cinematic tracking shot"), frame rate, and lighting transitions. Describe the start and end of the motion.
    
    3. TEXT PROMPTS (General/Instructional):
       - Don't just translate. Add a "Persona" and "Goal."
       - Example: If the user says "How to invest," rewrite as: "Act as a Senior Financial Advisor. Create a comprehensive, step-by-step investment guide for a beginner, focusing on risk management, asset allocation, and long-term growth strategies in the current 2026 market."

    4. FORMATTING:
       - Output ONLY the English prompt.
       - NO bolding (**), NO introductory text, NO "Here is your prompt."
    `;

    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": burmeseTextToTranslate }
        ],
        "temperature": 0.3 
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let translatedText = data.choices[0].message.content;
    
    // Clean up any stray markdown stars
    translatedText = translatedText.replace(/\*/g, '').trim();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", 
      },
      body: JSON.stringify({ final_prompt_en: translatedText }),
    };

  } catch (error) {
    console.error("Translation Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};