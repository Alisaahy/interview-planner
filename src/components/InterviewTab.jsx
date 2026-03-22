import React, { useState } from 'react';
import './InterviewTab.css';
import { generateJSONWithGemini } from '../services/ai';

const INTERVIEW_PREP_PROMPT = `You are an expert interview coach.
Based on the provided details, generate a list of 5 tailored interview questions and high-quality suggested answers.
Return exactly a JSON object matching this schema:
{
  "questions": [
    {
       "question": "string",
       "answer": "string"
    }
  ]
}
Output ONLY valid JSON.`;

export default function InterviewTab({ job }) {
    const [interviewer, setInterviewer] = useState('HR/Recruiter');
    const [length, setLength] = useState('30 min');
    const [isLoading, setIsLoading] = useState(false);
    const [qaList, setQaList] = useState([]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const context = `Job Title: ${job?.title || 'Unknown'}\nCompany: ${job?.company || 'Unknown'}\nInterviewer Type: ${interviewer}\nInterview Length: ${length}`;
            const result = await generateJSONWithGemini(INTERVIEW_PREP_PROMPT, context);
            if (result && result.questions) {
                setQaList(result.questions);
            } else {
                setQaList([
                    { question: "Tell me about yourself.", answer: "Focus on your professional journey and key achievements in the industry." },
                    { question: "Why do you want to work here?", answer: "Highlight alignment with their mission and the specific role." }
                ]);
            }
        } catch (e) {
            alert("Error generating Q&A: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="interview-tab">
            <div className="setup-panel glass-panel">
                <h3 style={{ marginBottom: '1.5rem' }}>Interview Prep Configuration</h3>

                <div className="config-section">
                    <label className="text-muted block mb-2">Who will you be interviewing with?</label>
                    <div className="options-grid grid-cols-4">
                        {['HR/Recruiter', 'Technical', 'Management', 'Other'].map(opt => (
                            <button key={opt} className={`btn-outline ${interviewer === opt ? 'active' : ''}`} onClick={() => setInterviewer(opt)}>{opt}</button>
                        ))}
                    </div>
                </div>

                <div className="config-section mt-4 mb-4">
                    <label className="text-muted block mb-2">Interview length</label>
                    <div className="options-grid grid-cols-5">
                        {['30 min', '45 min', '1 hr', '1.5 hr', '2 hr'].map(opt => (
                            <button key={opt} className={`btn-outline ${length === opt ? 'active' : ''}`} onClick={() => setLength(opt)}>{opt}</button>
                        ))}
                    </div>
                </div>

                <div className="config-section mt-4 mb-4">
                    <label className="text-muted block mb-2">How do you want to prepare?</label>
                    <div className="options-grid grid-cols-2">
                        <button className="btn-outline active">Let AI generate Q&A</button>
                        <button className="btn-outline">I'll add my own questions</button>
                    </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating Contextual Q&A... 🪄' : 'Generate Interview Prep'}
                </button>

                {qaList.length > 0 && (
                    <div className="generated-qa-section mt-4" style={{ paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Generated Q&A Bank</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {qaList.map((qa, index) => (
                                <div key={index} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-purple)' }}>Q: {qa.question}</div>
                                    <div className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Tip:</strong> {qa.answer}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
