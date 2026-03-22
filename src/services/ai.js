import { GoogleGenAI } from '@google/genai';

function getAiClient() {
    const localKey = localStorage.getItem('user_gemini_api_key');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = localKey || envKey;
    return (apiKey && !apiKey.includes('your_gemini')) ? new GoogleGenAI({ apiKey }) : null;
}

/**
 * Mocks the AI generation if no API key is present for easier local UI dev.
 */
const mockDelay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Generic wrapper to call Gemini 2.5 Flash for JSON-structured generation.
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 */
export async function generateJSONWithGemini(systemPrompt, userPrompt) {
    const ai = getAiClient();
    if (!ai) {
        console.warn("No valid GEMINI_API_KEY found. Simulating an AI delay and returning null to trigger fallback/mock data.");
        await mockDelay(1500);
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        if (error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('Quota')))) {
            console.warn("Gemini 429 Error, falling back to Llama 3.2 on local Ollama...");

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2',
                    messages: [
                        { role: 'system', content: systemPrompt + " Output ONLY valid JSON." },
                        { role: 'user', content: userPrompt }
                    ],
                    stream: false,
                    format: 'json'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama Fallback Failed: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const text = data.message?.content || "";
            return JSON.parse(text);
        }
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

/**
 * Generic wrapper to call Gemini 2.5 Pro for pure text generation.
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 */
export async function generateTextWithGemini(systemPrompt, userPrompt) {
    const ai = getAiClient();
    if (!ai) {
        console.warn("No valid GEMINI_API_KEY found. Simulating an AI delay and returning standard string.");
        await mockDelay(1500);
        return "This is a mock AI generated answer since no API key is present. To get real answers, please add your GEMINI_API_KEY to the .env file.";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        return response.text;
    } catch (error) {
        if (error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('Quota')))) {
            console.warn("Gemini 429 Error, falling back to Llama 3.2 on local Ollama...");

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama Fallback Failed: ${response.status} ${errText}`);
            }

            const data = await response.json();
            return data.message?.content || "";
        }
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}
