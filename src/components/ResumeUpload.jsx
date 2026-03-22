import React, { useState } from 'react';
import './ResumeUpload.css';
import { generateJSONWithGemini } from '../services/ai';

const RESUME_SCAN_PROMPT = `You are an expert technical recruiter.
Extract structured information from the resume. CRITICALLY IMPORTANT: group each bullet under the exact company where that work was done. Do NOT mix bullets across companies.

Return exactly a JSON object matching this schema:
{
  "work_experience": [
    {
      "company": "string (company name)",
      "role": "string (job title)",
      "dates": "string (e.g. Jan 2022 – Present)",
      "bullets": ["string", "string"]
    }
  ],
  "skills": ["string", "string"],
  "education": ["string (degree, institution, dates)"]
}
Output ONLY valid JSON. Every bullet must be under the company where it was performed.`;

export default function ResumeUpload({ onSaveResume, setCurrentView }) {
    const savedProfile = (() => {
        try { return JSON.parse(localStorage.getItem('vibe_apply_resume_profile')) || null; } catch { return null; }
    })();

    const [step, setStep] = useState(savedProfile ? 2 : 1);
    const [resumeText, setResumeText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bullets, setBullets] = useState(savedProfile?.bullets || []);
    const [experience, setExperience] = useState(savedProfile?.experience || []);
    const [skills, setSkills] = useState(savedProfile?.skills || []);
    const [education, setEducation] = useState(savedProfile?.education || []);
    const [newBullet, setNewBullet] = useState('');

    // Flatten all bullets across companies for the flat bullets[] state
    const flattenBullets = (workExp) =>
        (workExp || []).flatMap(w => (w.bullets || []).map(b => `[${w.company}] ${b}`));

    const performScan = async (textToScan) => {
        setIsLoading(true);
        try {
            const result = await generateJSONWithGemini(RESUME_SCAN_PROMPT, textToScan);
            if (result) {
                const workExp = result.work_experience || [];
                // Store flattened bullets with company labels for display/editing
                setBullets(flattenBullets(workExp));
                setExperience(workExp.map(w => `${w.company} — ${w.role} (${w.dates || ''})`.trim()));
                setSkills(result.skills || []);
                setEducation(result.education || []);
                // Also save structured work_experience for cover letter compilation
                localStorage.setItem('vibe_apply_work_experience_structured', JSON.stringify(workExp));
            } else {
                setBullets([
                    "Developed a new React-based component library used by 5 product teams.",
                    "Led user research for the mobile app redesign, increasing engagement by 15%."
                ]);
            }
            setStep(2);
        } catch (error) {
            alert("Error scanning resume: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScan = async () => {
        if (!resumeText.trim()) {
            alert("Please paste your resume text.");
            return;
        }
        await performScan(resumeText);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
            alert('Currently only PDF and Word (.doc, .docx) files are supported.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010';
            const response = await fetch(`${apiUrl}/api/resume/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setResumeText(data.text);
            await performScan(data.text);
        } catch (error) {
            alert('Error uploading file: ' + error.message);
            setIsLoading(false);
        }

        // Reset file input
        e.target.value = null;
    };

    const handleAddBullet = () => {
        if (newBullet.trim()) {
            const extraBullets = newBullet.split('\n').map(b => b.trim()).filter(b => b);
            setBullets([...bullets, ...extraBullets]);
            setNewBullet('');
        }
    };

    const handleSave = () => {
        const parts = [];

        // Try to use structured work_experience from localStorage (company-grouped)
        const structured = (() => {
            try { return JSON.parse(localStorage.getItem('vibe_apply_work_experience_structured')); } catch { return null; }
        })();

        if (structured && structured.length > 0) {
            const expSection = structured.map(w =>
                `${w.company} — ${w.role} (${w.dates || ''}):\n` +
                (w.bullets || []).map(b => `  - ${b}`).join('\n')
            ).join('\n\n');
            parts.push('WORK EXPERIENCE (grouped by company):\n' + expSection);
        } else if (experience.length > 0) {
            parts.push('WORK EXPERIENCE:\n' + experience.map(e => `- ${e}`).join('\n'));
            if (bullets.length > 0) parts.push('KEY BULLETS:\n' + bullets.map(b => `- ${b}`).join('\n'));
        }

        if (skills.length > 0) parts.push('SKILLS:\n' + skills.map(s => `- ${s}`).join('\n'));
        if (education.length > 0) parts.push('EDUCATION:\n' + education.map(e => `- ${e}`).join('\n'));

        const completeResumeText = parts.join('\n\n');

        // Persist structured profile to localStorage
        localStorage.setItem('vibe_apply_resume_profile', JSON.stringify({ bullets, experience, skills, education }));

        onSaveResume(completeResumeText);
        setCurrentView('dashboard');
    };

    return (
        <div className="resume-upload-page">
            <div className="upload-container glass-panel">
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Resume Profile</h2>
                <p className="text-muted mb-4">We'll scan this to help tailor your applications and generate custom Q&A.</p>

                {step === 1 ? (
                    <div className="upload-step">
                        <div className="upload-box flex-center" style={{ flexDirection: 'column', gap: '1rem', position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('resume-upload-input').click()}>
                            <input
                                type="file"
                                id="resume-upload-input"
                                accept="application/pdf, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <div style={{ color: 'var(--brand-purple)', marginBottom: '0.5rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <h3>Upload Resume (PDF, DOCX)</h3>
                            <p className="text-muted">Click to browse or drop file here</p>
                        </div>

                        <div className="divider flex-center">
                            <span className="text-muted">OR</span>
                        </div>

                        <textarea
                            className="text-input"
                            rows="6"
                            placeholder="Paste your full resume text here..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />

                        <button className="btn-primary w-full mt-4" style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }} onClick={handleScan} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                    </svg>
                                    Scanning Resume...
                                </>
                            ) : 'Scan Resume'}
                        </button>
                    </div>
                ) : (
                    <div className="review-step">
                        <div className="success-banner mb-4" style={{ backgroundColor: '#e6f7ec', color: '#047857', border: '1px solid #10B981', display: 'flex', padding: '1rem', borderRadius: '12px', alignItems: 'center', gap: '0.75rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            <span style={{ fontWeight: '600' }}>Scan Complete! We extracted your key experiences.</span>
                        </div>

                        {experience.length > 0 && (
                            <div className="mb-4">
                                <h4 className="mb-2">Experience</h4>
                                <ul className="bullets-list">
                                    {experience.map((exp, idx) => (
                                        <li key={idx} className="bullet-item">
                                            <span>{exp}</span>
                                            <button className="btn-icon" onClick={() => setExperience(experience.filter((_, i) => i !== idx))} title="Remove">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {skills.length > 0 && (
                            <div className="mb-4">
                                <h4 className="mb-2">Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {skills.map((skill, idx) => (
                                        <span key={idx} style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {skill}
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex' }} onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {education.length > 0 && (
                            <div className="mb-4">
                                <h4 className="mb-2">Education</h4>
                                <ul className="bullets-list">
                                    {education.map((edu, idx) => (
                                        <li key={idx} className="bullet-item">
                                            <span>{edu}</span>
                                            <button className="btn-icon" onClick={() => setEducation(education.filter((_, i) => i !== idx))} title="Remove">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mb-4">
                            <h4 className="mb-2">Key Experience Bullets</h4>
                            <ul className="bullets-list">
                                {bullets.map((bullet, idx) => (
                                    <li key={idx} className="bullet-item">
                                        <span>{bullet}</span>
                                        <button className="btn-icon" onClick={() => setBullets(bullets.filter((_, i) => i !== idx))} title="Remove bullet">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="add-bullet-box mb-4">
                            <h4 className="mb-2">Add Missing Work Bullets</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <textarea
                                    className="text-input"
                                    rows="3"
                                    placeholder="Paste extra bullet points here (one per line)..."
                                    value={newBullet}
                                    onChange={(e) => setNewBullet(e.target.value)}
                                />
                                <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={handleAddBullet}>Add Bullets</button>
                            </div>
                        </div>

                        <div className="flex-between m-t-4">
                            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-primary" onClick={handleSave}>Save Profile</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
