import React, { useState } from 'react';
import './AddJob.css';

const JOB_PARSER_PROMPT = `You are an expert technical recruiter and job parser.
The user provides you with a job description text or link.
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

export default function AddJob({ onAddJob }) {
    const [step, setStep] = useState(1);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [jobText, setJobText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedJob, setParsedJob] = useState(null);

    const handleScan = async () => {
        if (!jobText.trim() && !linkedinUrl.trim()) {
            alert("Please paste the job description text or a LinkedIn URL.");
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010';
            const response = await fetch(`${apiUrl}/api/jobs/parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: linkedinUrl, text: jobText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to parse job');
            }

            const result = await response.json();
            setParsedJob(result);
            setStep(2);
        } catch (error) {
            alert("Error parsing job: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (onAddJob && parsedJob) {
            onAddJob({ ...parsedJob, sourceUrl: linkedinUrl || '' });
        }
    };

    return (
        <div className="add-job-page">
            <div className="upload-container glass-panel">
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Add a New Job</h2>
                <p className="text-muted mb-4">Paste a LinkedIn URL or drop the full job description below.</p>

                {step === 1 ? (
                    <div className="upload-step">
                        <div className="input-group mb-4">
                            <label className="text-muted block mb-2 font-medium">Link to Job Post (Optional)</label>
                            <input
                                type="url"
                                className="text-input"
                                placeholder="https://www.linkedin.com/jobs/view/..."
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                            />
                        </div>

                        <div className="divider flex-center">
                            <span className="text-muted">OR</span>
                        </div>

                        <div className="input-group mb-4">
                            <label className="text-muted block mb-2 font-medium">Paste Job Description</label>
                            <textarea
                                className="text-input"
                                rows="8"
                                placeholder="Title, Company, Responsibilities, Requirements..."
                                value={jobText}
                                onChange={(e) => setJobText(e.target.value)}
                            />
                        </div>

                        <button className="btn-primary w-full mt-4" style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }} onClick={handleScan} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                    </svg>
                                    Analyzing Job Post...
                                </>
                            ) : 'Analyze Job Post'}
                        </button>
                    </div>
                ) : (
                    <div className="review-step">
                        <div className="success-banner mb-4" style={{ backgroundColor: '#e6f7ec', color: '#047857', border: '1px solid #10B981', display: 'flex', padding: '1rem', borderRadius: '12px', alignItems: 'center', gap: '0.75rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            <span style={{ fontWeight: '600' }}>Analysis Complete!</span>
                        </div>

                        {parsedJob && (
                            <div className="parsed-summary glass-panel mb-4 p-4" style={{ borderRadius: '20px', padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{parsedJob.title}</h3>
                                    <div style={{ color: 'var(--brand-purple-dark)', fontWeight: '500' }}>@ {parsedJob.company}</div>
                                </div>
                                <div className="grid-cols-2 text-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <div className="meta-label">Location</div>
                                        <div className="meta-value">{parsedJob.location} • {parsedJob.workMode}</div>
                                    </div>
                                    <div>
                                        <div className="meta-label">Salary Range</div>
                                        <div className="meta-value">{parsedJob.salaryRange}</div>
                                    </div>
                                    <div>
                                        <div className="meta-label">Experience</div>
                                        <div className="meta-value">{parsedJob.experience}</div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                        <div className="meta-label" style={{ marginBottom: '0.75rem' }}>Key Skills</div>
                                        <div className="skills-tags" style={{ justifyContent: 'flex-start' }}>
                                            {parsedJob.keySkills?.map((skill, idx) => (
                                                <span key={idx} className="skill-tag solid-white" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-between m-t-4">
                            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-primary" onClick={handleSave}>Add to Dashboard</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
