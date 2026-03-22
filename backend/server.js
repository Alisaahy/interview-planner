import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ApifyClient } from 'apify-client';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

dotenv.config({ path: '../.env' }); // Load from parent directory

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.VITE_GEMINI_API_KEY
});

const JOB_PARSER_PROMPT = `You are an expert technical recruiter and job parser.
Extract the following information and return exactly a JSON object matching this schema:
{
  "title": "string (Job Title)",
  "company": "string (Company Name, or 'Unknown')",
  "location": "string (Location or 'Not specified')",
  "salaryRange": "string (Salary range or 'Not specified')",
  "keySkills": ["string", "string"],
  "experience": "string (e.g., 3-5 years, or 'Not specified')",
  "workMode": "string (e.g., Remote, On-site, Hybrid, or 'Not specified')"
}
Output ONLY valid JSON.`;

app.post('/api/jobs/parse', async (req, res) => {
    try {
        const { url, text } = req.body;
        let jobDescription = text;

        if (url) {
            console.log(`Processing URL: ${url}`);

            // LinkedIn: use the public guest API (no login required)
            if (url.includes('linkedin.com/')) {
                console.log(`Detected LinkedIn URL. Extracting job ID...`);

                // Supports formats:
                //   .../jobs/view/1234567890
                //   ...?currentJobId=1234567890
                const jobIdMatch = url.match(/(?:view\/|currentJobId=)(\d+)/);
                const jobId = jobIdMatch?.[1];

                if (!jobId) {
                    throw new Error('Could not extract a LinkedIn job ID from the URL. Please paste the description text instead.');
                }

                console.log(`Fetching LinkedIn guest API for job ID: ${jobId}`);
                const guestApiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
                const liResponse = await fetch(guestApiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                });

                if (!liResponse.ok) {
                    throw new Error(`LinkedIn guest API returned status ${liResponse.status}. Please paste the description text instead.`);
                }

                const html = await liResponse.text();
                // Strip HTML tags and decode entities
                jobDescription = html
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (!jobDescription || jobDescription.length < 100) {
                    throw new Error(`LinkedIn returned an empty response. The job may have expired or require login. Please paste the description text instead.`);
                }
                console.log(`LinkedIn guest API scrape successful. Length: ${jobDescription.length}`);
            }

            // All other URLs use the free Jina AI reader
            else {
                console.log(`Scraping URL with Jina AI Reader...`);
                try {
                    const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
                        headers: {
                            'Accept': 'text/plain',
                            'X-With-Generated-Alt': 'true'
                        }
                    });
                    if (!jinaResponse.ok) {
                        throw new Error(`Jina AI returned status ${jinaResponse.status}`);
                    }
                    jobDescription = await jinaResponse.text();
                    console.log(`Jina AI scrape successful. Length: ${jobDescription?.length}`);
                } catch (err) {
                    throw new Error(`Scraping error: ${err.message}`);
                }
            }
        }

        if (!jobDescription || jobDescription.trim() === '') {
            return res.status(400).json({ error: 'No job description provided or could be extracted.' });
        }

        // Now call AI to parse the structured data
        console.log("Calling AI to parse structured data...");
        const parsedData = await generateWithFallback(
            `Parse this job description:\n\n${jobDescription}`,
            JOB_PARSER_PROMPT,
            true
        );

        res.json(parsedData);

    } catch (error) {
        console.error('Error in /api/jobs/parse:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Helper to parse JSON from Markdown
const parseJSONFromText = (text) => {
    try {
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        return JSON.parse(text);
    } catch (e) {
        console.warn("Failed to parse JSON, returning original text.");
        return text;
    }
};

async function generateWithFallback(prompt, systemInstruction, isJson = false) {
    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                ...(isJson ? { responseMimeType: "application/json" } : {})
            }
        });
        return isJson ? JSON.parse(aiResponse.text) : aiResponse.text;
    } catch (error) {
        if (error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('Quota')))) {
            console.warn("Gemini 429 Error, falling back to Llama 3.2 on local Ollama...");

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2',
                    messages: [
                        { role: 'system', content: systemInstruction + (isJson ? " Output ONLY valid JSON." : "") },
                        { role: 'user', content: prompt }
                    ],
                    stream: false,
                    format: isJson ? 'json' : undefined
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama Fallback Failed: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const text = data.message?.content || "";
            return isJson ? parseJSONFromText(text) : text;
        }
        throw error;
    }
}

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        let resultText = '';

        if (req.file.mimetype === 'application/pdf') {
            const parser = new PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            await parser.destroy();
            resultText = result.text;
        } else if (
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            resultText = result.value;
        } else {
            return res.status(400).json({ error: 'Only PDF and Word (.docx, .doc) files are supported.' });
        }

        res.json({ text: resultText });
    } catch (error) {
        console.error('Error parsing PDF:', error);
        res.status(500).json({ error: error.message || 'Failed to parse PDF.' });
    }
});

app.post('/api/generate/cover-letter', async (req, res) => {
    try {
        const { jobText, resumeText, length } = req.body;
        if (!jobText || !resumeText) {
            return res.status(400).json({ error: 'jobText and resumeText are required.' });
        }

        let lengthInstruction = "Keep it concise (around 200 words).";
        if (length === "medium") lengthInstruction = "Make it a standard length (around 300 words).";
        if (length === "long") lengthInstruction = "Make it detailed and comprehensive (around 400-500 words).";

        const resultText = await generateWithFallback(
            `Write a professional cover letter for the following job.

Rules:
- Open with a strong hook about WHY this specific company excites the candidate, referencing the company's mission, product, or culture from the job description.

- STRICT COMPANY ATTRIBUTION: The resume is structured by company. When referencing an achievement, you MUST only attribute it to the CORRECT company it belongs to.

- NO PROJECT NAMES: Do NOT mention specific project names, internal system names, product codenames, or tool names from the resume (e.g. "Evercast", "ToteASRS", "Kiro", "ASIN CIV", "rebaseline pipeline"). Instead, describe the SKILL or CAPABILITY: e.g. "long-range financial forecasting", "robotics analytics infrastructure", "ML-driven capacity planning" — keep it at the level of what you can DO and what IMPACT it had.

- Highlight 2-3 areas of BROAD, ORGANIZATIONAL-LEVEL impact. Do NOT describe granular internal metrics (e.g. "reduced X by Y%", "20 drives per station"). Speak to SCALE and STRATEGIC VALUE: e.g. "models adopted by Amazon's CFO team to drive capital planning decisions", "analytics infrastructure used across Amazon Robotics' entire network", "forecasting systems that shaped executive-level decisions". Choose impacts that best align with this job description.

- Do NOT mention companies or roles that are unlikely to be relevant to this role.

- Include a dedicated paragraph on how the candidate uses AI tools to boost personal and team productivity, and how they would bring that mindset to this specific role.

- Close with genuine enthusiasm for this company's specific goals.

- ${lengthInstruction}
- Write ONLY the cover letter text.

Job Description:\n${jobText}\n\nCandidate Resume:\n${resumeText}`,
            "You are an expert career coach. Write a cover letter that is personal, impact-driven, and company-specific. Be extremely careful to only attribute work to the correct employer. Speak to organizational-level outcomes, not granular metrics. Avoid internal project codes or niche acronyms.",
            false
        );

        res.json({ result: resultText.replace(/\[Your Name\]/gi, '[User Name]') });
    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate/resume-bullets', async (req, res) => {
    try {
        const { jobText, resumeText } = req.body;
        if (!jobText || !resumeText) {
            return res.status(400).json({ error: 'jobText and resumeText are required.' });
        }

        const bullets = await generateWithFallback(
            `You are a resume editor helping tailor existing resume bullets to better match a job description.

Your job is to REPHRASE — NOT REPLACE — existing bullets. The "adjusted" version must describe the EXACT SAME work as the original. You are only improving framing and keyword alignment.

Instructions:
1. For bullets that should be REPHRASED to better align with the job: return {"original": "exact original text", "adjusted": "improved version of the SAME work"}
2. For NEW bullets to fill genuine gaps (only if truly needed): return {"original": null, "adjusted": "new bullet"}
3. Skip bullets that are already well-phrased for this job.

CRITICAL RULES — follow every one:

CLARITY: The "adjusted" bullet must be CLEANER and MORE READABLE than the original — not longer or more convoluted. Use a strong action verb first, then what was built, then the impact. If you can't make the bullet clearer, keep it unchanged.
Structure: [Strong verb] + [what was built/done] + [specific impact/scale]. Example: "Built ML pipeline predicting site throughput at standardized GCU, enabling capacity planning and capital investment decisions across NA, EU, and AP."
 
SAME WORK: Never change the core technology, methodology, or team. If original is about A/B testing, adjusted must be about A/B testing.
NO FABRICATION: Do not invent projects, metrics, or outcomes not described in the original bullet.

ACRONYM EXPANSION: Every time the "adjusted" version uses a domain-specific acronym (e.g. GCU, SSD, MAPE, AR, NRT), write it as "Acronym (Full Name)" the FIRST time it appears. Examples: "GCU (Gross Cube Utilization)", "SSD (Sub Same-Day)", "MAPE (Mean Absolute Percentage Error)". If you are not confident of the full form, keep the acronym alone.

Return ONLY a valid JSON array.

Job Description:\n${jobText}\n\nCandidate Resume:\n${resumeText}`,
            "You are an expert resume editor. Rephrase bullets to be CLEARER and more job-aligned. Expand domain acronyms as 'Acronym (Full Name)'. Never fabricate different work. Return ONLY a JSON array of {original, adjusted} objects.",
            true
        );

        // Normalize bullets to always be an array of {original, adjusted} objects
        let bulletList = bullets;
        if (!Array.isArray(bulletList)) {
            if (typeof bulletList === 'object' && bulletList !== null) {
                if ('adjusted' in bulletList) {
                    bulletList = [bulletList];
                } else {
                    const nested = Object.values(bulletList).find(v => Array.isArray(v));
                    bulletList = nested || [{ original: null, adjusted: JSON.stringify(bulletList) }];
                }
            } else {
                // String path — FIRST try JSON.parse (handles Ollama wrapping the array in text)
                const str = String(bulletList).trim();
                const jsonStart = str.indexOf('[');
                const jsonEnd = str.lastIndexOf(']');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    try {
                        const parsed = JSON.parse(str.slice(jsonStart, jsonEnd + 1));
                        bulletList = Array.isArray(parsed) ? parsed : [{ original: null, adjusted: str }];
                    } catch {
                        bulletList = str.split('\n')
                            .map(b => b.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean)
                            .map(b => ({ original: null, adjusted: b }));
                    }
                } else {
                    bulletList = str.split('\n')
                        .map(b => b.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean)
                        .map(b => ({ original: null, adjusted: b }));
                }
            }
        }
        // Ensure every element is properly shaped — handle string values that are JSON
        bulletList = bulletList.flatMap(b => {
            if (typeof b === 'string') {
                // Try to parse as JSON first
                try {
                    const p = JSON.parse(b);
                    if (Array.isArray(p)) return p.map(x => typeof x === 'string' ? { original: null, adjusted: x } : x);
                    if (p && typeof p === 'object' && 'adjusted' in p) return [p];
                } catch { }
                return [{ original: null, adjusted: b }];
            }
            if (Array.isArray(b)) return b.map(x => typeof x === 'string' ? { original: null, adjusted: x } : x);
            return [b];
        });

        res.json({ result: bulletList });
    } catch (error) {
        console.error('Error rewriting resume bullets:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate/cold-message', async (req, res) => {
    try {
        const { jobText, resumeText } = req.body;
        if (!jobText || !resumeText) {
            return res.status(400).json({ error: 'jobText and resumeText are required.' });
        }

        const resultText = await generateWithFallback(
            `Write a professional cold outreach LinkedIn message or email from a job candidate to a recruiter or hiring manager. Write in first person ("I", "my").

Follow this EXACT 4-part structure in SHORT paragraphs — this is a message NOT a cover letter, so keep each part to 1–2 sentences max:

PART 1 — Opening hook:
Say you came across the [specific role] at [specific company] and were genuinely impressed by the company. Reference something concrete and specific from the job description (their product, mission, focus area, or what makes them exciting). Make it sound authentic, not generic.

PART 2 — Background & impact (most important part):
Briefly say I have [X years] of data science / ML experience at Amazon. Then mention 1–2 high-level impacts — but:
- Describe them as SKILLS and OUTCOMES, not project names. Do NOT name specific projects, internal systems, or product codenames (e.g. do not say "Evercast", "ToteASRS", "rebaseline pipeline", "ASIN CIV"). Instead say what you DID and what the impact was.
- Keep it at ORGANIZATIONAL LEVEL: e.g. "ML models I built are used by Amazon's CFO team to guide capital decisions", "forecasting infrastructure I developed now shapes executive financial planning", "analytics systems I built are deployed across Amazon Robotics' entire fulfillment network".
- Choose 1–2 impacts that best align with THIS specific job description.

PART 3 — Fit:
1 sentence on why my background aligns specifically with this role and what I could bring to the team. Reference a skill or focus area from the job description.

PART 4 — CTA:
Politely ask if they'd be open to a brief chat specifically about the [exact role title] role. Reference the role by name. Keep it warm and low-pressure. Example: "Would love to chat about the [Role] position if you have 15 minutes."

End with: "Best, [Your Name]"

OUTPUT ONLY the message. No subject line. No preamble like "Here is the message:".

Job Description:\n${jobText}\n\nCandidate Resume:\n${resumeText}`,
            "You are a job candidate writing a polished, natural cold outreach message in first person. Keep it under 150 words. Write in short paragraphs. Be specific, genuine, and professional — like a real human message. Avoid granular internal metrics or project codes.",
            false
        );

        // Strip any preamble the AI may have added before the actual message
        const cleaned = resultText
            .replace(/^(here is|here's|below is|the following is)[^\n]*:\s*/im, '')
            .replace(/^(cold message|outreach message|linkedin message)[^\n]*:\s*/im, '')
            .trim();

        res.json({ result: cleaned.replace(/\[Your Name\]/gi, '[User Name]') });
    } catch (error) {
        console.error('Error generating cold message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate/custom-question', async (req, res) => {
    try {
        const { jobText, resumeText, question } = req.body;
        if (!jobText || !resumeText || !question) {
            return res.status(400).json({ error: 'jobText, resumeText, and question are required.' });
        }

        const resultText = await generateWithFallback(
            `I am the candidate. Please answer this question from my perspective: ${question}\n\nContext - Job Description:\n${jobText}\n\nContext - My Resume:\n${resumeText}`,
            "You ARE the candidate. Answer every question in the FIRST PERSON ('I', 'my', 'me'). DO NOT offer advice. DO NOT use the second person ('you', 'your'). DO NOT address the user. DO NOT start with a preamble or introduction. Provide a direct, plain-text response that I can use as my own words. NO markdown formatting like bold (**) or italics (*).",
            false
        );

        res.json({ result: resultText });
    } catch (error) {
        console.error('Error answering custom question:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
