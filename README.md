# AI-Powered Interview Planner

A comprehensive, full-stack application designed to streamline the job application and interview preparation process. Built with **React** (Frontend) and **Express/Node.js** (Backend), this app leverages the **Google Gemini API** to generate highly tailored content based on your resume and targeted job descriptions.

## 🔥 Key Features

- **Job Dashboard & Portfolio Management**: Easily track your applications across different stages (Applying, Interviewing, Offer).
- **Automated Job Parsing**: Instantly scrape and extract structured data from LinkedIn URLs or direct text using the Jina AI reader and Gemini.
- **AI-Generated Cover Letters & Outreach**: Automatically draft personalized cover letters and short, punchy cold outreach messages to recruiters using your exact qualifications.
- **Custom Interview Questions**: Ask an AI "career coach" any question (e.g., "Why am I a good fit for this role?") and receive a strictly first-person, actionable response ready to be used in your interview.
- **Resume Tailoring & Bullet Generation**: Analyze the gap between your uploaded resume and a job description to generate optimized bullet points.
- **Categorized Question Bank**: Practice common behavioral and technical interview questions (A/B Testing, Machine Learning, Deep Learning, etc.).

## 🛠 Tech Stack

- **Frontend**: React, Vite, CSS (Responsive Glassmorphism Design)
- **Backend**: Express, Node.js, Apify Client / Jina AI (for scraping), Multer (file uploads), PDF-Parse (resume extraction)
- **AI Integration**: Google Generative AI (Gemini 2.5 Pro) with local fallback to Ollama (Llama 3.2).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/interview-planner.git
   cd interview-planner
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install Backend Dependencies & Start Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend will start on `http://localhost:3010`.*

4. **Install Frontend Dependencies & Start App:**
   Open a new terminal window in the root directory:
   ```bash
   npm install
   npm run dev
   ```
   *The frontend will start on `http://localhost:5173`.*

## 🔒 Privacy & Security

This project has been scrubbed of all personal identifying information (PII) and hardcoded API keys. Environment variables and node modules are explicitly ignored in `.gitignore`. Custom AI prompts use variables to keep the user's identity dynamically injected rather than hardcoded.

## 🤝 Contributing

Feel free to fork this project, submit pull requests, or open issues to suggest new features or report bugs!
