// File: netlify/functions/gemini-translate.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Get the secret API key securely from Netlify's environment settings
    // NEVER type the actual key here in the code.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("API Key not found in environment variables");
        throw new Error("Server configuration error (API Key missing).");
    }

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use 'gemini-pro' or the model you have access to
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        
    // 3. Get the Burmese text from the frontend request
    const requestBody = JSON.parse(event.body);
    const burmeseTextToTranslate = requestBody.text_to_translate;

    if (!burmeseTextToTranslate) {
      throw new Error("No text provided for translation.");
    }

    // 4. Create the Mega-Prompt for Gemini
    // This instructs Gemini to act as a translator and output ONLY English.
    const systemPrompt = `
    You are an expert AI prompt engineer and professional translator.
    Your Task: Translate the following structured Burmese input into a single, high-quality, fluent English AI prompt.
    Crucial Rules:
    1. Output ONLY the final English translation.
    2. Do NOT add introductory text like "Here is the translation:".
    3. Do NOT add markdown formatting like bolding ** unless necessary for the prompt structure itself.
    4. Ensure the English is professional and ready to be pasted into another LLM.

    --- Burmese Input ---
    ${burmeseTextToTranslate}
    ---------------------
    `;

    // 5. Generate content
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const translatedText = response.text();

    // 6. Send the result back to your website securely
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Essential for CORS if your frontend and backend are on different domains during dev
        "Access-Control-Allow-Origin": "*", 
      },
      body: JSON.stringify({ final_prompt_en: translatedText.trim() }),
    };

  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to translate via Gemini API." }),
    };
  }
};