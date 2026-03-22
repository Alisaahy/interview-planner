import React, { useState } from 'react';
import './ApplicationTab.css';

export default function ApplicationTab({ job, userResume }) {
    const [activeTab, setActiveTab] = useState('Job Scan');

    // AI Generation State
    const [generatedBullets, setGeneratedBullets] = useState(null);
    const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
    const [generatedColdMessage, setGeneratedColdMessage] = useState(null);
    const [customAnswer, setCustomAnswer] = useState(null);

    const [isGenerating, setIsGenerating] = useState({
        bullets: false,
        coverLetter: false,
        coldMessage: false,
        customQuestion: false
    });

    // Inputs
    const [coverLetterLength, setCoverLetterLength] = useState('medium');
    const [customQuestionInput, setCustomQuestionInput] = useState('');

    const cleanAIResponse = (text) => {
        if (!text || typeof text !== 'string') return text;
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1')     // Remove italics
            .replace(/__(.*?)__/g, '$1')     // Remove double underscore bold
            .replace(/_(.*?)_/g, '$1')       // Remove single underscore italics
            .replace(/^#+\s+/gm, '')         // Remove headers
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
            .trim();
    };

    const generateContent = async (endpoint, type, additionalBody = {}) => {
        if (!userResume) {
            alert("Please scan and save your resume profile first to generate tailored content.");
            return;
        }

        setIsGenerating(prev => ({ ...prev, [type]: true }));
        try {
            const response = await fetch(`http://localhost:3010/api/generate/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobText: JSON.stringify(job), // Since we only have the parsed job object here
                    resumeText: userResume,
                    ...additionalBody
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate');
            }

            const data = await response.json();

            if (type === 'bullets') {
                // Normalize to always be an array of {original, adjusted} objects
                let bullets = data.result;
                if (typeof bullets === 'string') {
                    try { bullets = JSON.parse(bullets); } catch {
                        bullets = bullets.split('\n').map(b => b.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
                            .map(b => ({ original: null, adjusted: b }));
                    }
                }
                if (!Array.isArray(bullets)) bullets = [{ original: null, adjusted: String(bullets) }];
                // Handle if backend still returns flat strings (safety)
                bullets = bullets.map(b => typeof b === 'string' ? { original: null, adjusted: b } : b);
                setGeneratedBullets(bullets.filter(b => b.adjusted));
            }
            if (type === 'coverLetter') setGeneratedCoverLetter(data.result);
            if (type === 'coldMessage') setGeneratedColdMessage(data.result);
            if (type === 'customQuestion') setCustomAnswer(cleanAIResponse(data.result));

        } catch (error) {
            console.error(`Error generating ${type}:`, error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsGenerating(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <div className="application-tab">
            <div className="sub-tabs">
                {['Job Scan', 'Resume Bullets', 'Cover Letter', 'Cold Message', 'Custom Question'].map(tab => (
                    <button
                        key={tab}
                        className={`sub-tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'Job Scan' && <span className="tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /></svg></span>}
                        {tab === 'Resume Bullets' && <span className="tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></span>}
                        {tab === 'Cover Letter' && <span className="tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg></span>}
                        {tab === 'Cold Message' && <span className="tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></span>}
                        {tab === 'Custom Question' && <span className="tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></span>}
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Job Scan' && (
                <div className="job-scan-content">
                    <div className="job-highlights-section">
                        <h4 className="highlights-title">
                            <span style={{ display: 'flex' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></span> Job Highlights
                        </h4>
                        <div className="highlights-meta">
                            <div className="meta-item"><span className="meta-icon" style={{ display: 'flex' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span> {job.location || 'Sunnyvale, CA'}</div>
                            <div className="meta-item"><span className="meta-icon" style={{ display: 'flex' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="22" /><line x1="15" y1="22" x2="15" y2="22" /><line x1="9" y1="6" x2="9.01" y2="6" /><line x1="15" y1="6" x2="15.01" y2="6" /><line x1="9" y1="10" x2="9.01" y2="10" /><line x1="15" y1="10" x2="15.01" y2="10" /><line x1="9" y1="14" x2="9.01" y2="14" /><line x1="15" y1="14" x2="15.01" y2="14" /><line x1="9" y1="18" x2="9.01" y2="18" /><line x1="15" y1="18" x2="15.01" y2="18" /></svg></span> {job.workModel || 'Remote'}</div>
                            <div className="meta-item full-width-item"><span className="meta-icon" style={{ display: 'flex' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></span> {job.type || 'Full-time'}</div>
                        </div>
                    </div>

                    <div className="application-main-content">
                        <div className="highlights-list">
                            <div className="highlight-row warning-bg">
                                <div className="row-left">
                                    <div className="highlight-icon warning-icon">!</div>
                                    <span className="highlight-label">Salary</span>
                                </div>
                                <strong className="highlight-value">{job.salary || '$117,800.00/yr - $184,000.00/yr'}</strong>
                            </div>
                            <div className="highlight-row warning-bg">
                                <div className="row-left">
                                    <div className="highlight-icon warning-icon">!</div>
                                    <span className="highlight-label">Experience</span>
                                </div>
                                <strong className="highlight-value">{job.experience || '5+ years of design experience'}</strong>
                            </div>
                            <div className="highlight-row warning-bg">
                                <div className="row-left">
                                    <div className="highlight-icon warning-icon">!</div>
                                    <span className="highlight-label">Work Authorization</span>
                                </div>
                                <strong className="highlight-value">{job.workAuth || 'Authorized to work in the US'}</strong>
                            </div>
                            <div className="highlight-row warning-bg" style={{ alignItems: 'center' }}>
                                <div className="row-left" style={{ width: '150px' }}>
                                    <div className="highlight-icon warning-icon">!</div>
                                    <span className="highlight-label">Key Skills</span>
                                </div>
                                <div className="skills-tags">
                                    {(job.keySkills || ['Computer vision', 'Sensor fusion', 'Machine learning']).map(skill => (
                                        <span key={skill} className="skill-tag solid-white">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="highlight-row success-bg" style={{ alignItems: 'center' }}>
                                <div className="row-left" style={{ width: '150px' }}>
                                    <div className="highlight-icon success-icon">✓</div>
                                    <span className="highlight-label">Benefits</span>
                                </div>
                                <div className="benefits-tags">
                                    {(job.benefits || ['Health insurance', '401(k) matching', 'Paid time off']).map(benefit => (
                                        <span key={benefit} className="benefit-tag solid-white">✓ {benefit}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="company-info-panel glass-panel">
                            <div className="company-header">
                                <div className="company-logo-square">
                                    {job.company.charAt(0)}
                                </div>
                                <h3>{job.company}</h3>
                            </div>
                            <div className="company-meta-grid">
                                <div>
                                    <div className="meta-label">Industry</div>
                                    <div className="meta-value">IT Services and IT Consulting</div>
                                </div>
                                <div>
                                    <div className="meta-label">Website</div>
                                    <a href="#" className="meta-link">www.{job.company.toLowerCase().replace(/\s/g, '')}.com</a>
                                </div>
                            </div>
                            <div className="meta-label mb-2">Company Description</div>
                            <p className="company-desc">
                                {job.companyDesc || 'Innovation is part of our DNA. We need people who want to join a high-reaching program that continues to push the state of the art in novel customer experiences, ubiquitous computing, computer vision, machine learning, distributed systems, and industrial design.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Resume Bullets' && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div className="flex-between mb-4">
                        <div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Resume Bullets</h3>
                            <p className="text-muted">AI optimized bullets tailored for this role.</p>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => generateContent('resume-bullets', 'bullets')}
                            disabled={isGenerating.bullets}
                        >
                            {isGenerating.bullets ? (
                                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            )}
                            {isGenerating.bullets ? 'Generating...' : 'Generate New Bullets'}
                        </button>
                    </div>

                    {generatedBullets ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Column headers */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', padding: '0 0.25rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Original</span>
                                <span />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✦ Rephrased</span>
                            </div>

                            {generatedBullets.map((item, idx) => (
                                item.original ? (
                                    /* Side-by-side card for rephrased bullets */
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'stretch' }}>
                                        {/* Original */}
                                        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)', color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                                            • {item.original}
                                        </div>
                                        {/* Arrow */}
                                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-purple)', fontSize: '1.1rem' }}>→</div>
                                        {/* Rephrased */}
                                        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(134,100,249,0.08)', borderRadius: '10px', border: '1px solid rgba(134,100,249,0.25)', color: 'var(--color-text-main)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                                            • {typeof item.adjusted === 'string' ? item.adjusted : JSON.stringify(item.adjusted)}
                                        </div>
                                    </div>
                                ) : (
                                    /* Full-width card for new bullets */
                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem 1rem', backgroundColor: 'rgba(34,197,94,0.07)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.25)' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginTop: '2px' }}>✦ New</span>
                                        <span style={{ color: 'var(--color-text-main)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                                            {typeof item.adjusted === 'string' ? item.adjusted : JSON.stringify(item.adjusted)}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </div>
                            <p className="text-muted">Click Generate to rewrite your resume specifically for this {job.role} position.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Cover Letter' && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div className="flex-between mb-4">
                        <div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Cover Letter</h3>
                            <p className="text-muted">AI generated cover letter for {job.company}.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select
                                className="text-input"
                                style={{ padding: '0.5rem', width: 'auto' }}
                                value={coverLetterLength}
                                onChange={(e) => setCoverLetterLength(e.target.value)}
                            >
                                <option value="short">Short (200 words)</option>
                                <option value="medium">Medium (300 words)</option>
                                <option value="long">Long (400+ words)</option>
                            </select>
                            <button
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => generateContent('cover-letter', 'coverLetter', { length: coverLetterLength })}
                                disabled={isGenerating.coverLetter}
                            >
                                {isGenerating.coverLetter ? (
                                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                )}
                                {isGenerating.coverLetter ? 'Writing...' : 'Generate Letter'}
                            </button>
                        </div>
                    </div>

                    {generatedCoverLetter ? (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', whiteSpace: 'pre-line', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                            {generatedCoverLetter}
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <p className="text-muted">Select desired length and click Generate to craft a perfect cover letter.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Cold Message' && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div className="flex-between mb-4">
                        <div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Cold Message</h3>
                            <p className="text-muted">Reach out to recruiters at {job.company}.</p>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => generateContent('cold-message', 'coldMessage')}
                            disabled={isGenerating.coldMessage}
                        >
                            {isGenerating.coldMessage ? (
                                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            )}
                            {isGenerating.coldMessage ? 'Drafting...' : 'Draft Message'}
                        </button>
                    </div>

                    {generatedColdMessage ? (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', whiteSpace: 'pre-line', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                            {generatedColdMessage}
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            </div>
                            <p className="text-muted">Click Draft Message to generate a tailored LinkedIn/Email outreach message.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Custom Question' && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div className="flex-between mb-4">
                        <div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Custom Question</h3>
                            <p className="text-muted">Ask Gemini anything about this job.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            className="text-input"
                            style={{ flex: 1 }}
                            placeholder="E.g., What are the common interview questions for this role?"
                            value={customQuestionInput}
                            onChange={(e) => setCustomQuestionInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && generateContent('custom-question', 'customQuestion', { question: customQuestionInput })}
                        />
                        <button
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => generateContent('custom-question', 'customQuestion', { question: customQuestionInput })}
                            disabled={isGenerating.customQuestion || !customQuestionInput.trim()}
                        >
                            {isGenerating.customQuestion ? (
                                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            )}
                            {isGenerating.customQuestion ? 'Asking...' : 'Ask'}
                        </button>
                    </div>

                    {customAnswer && (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', whiteSpace: 'pre-line', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--brand-purple)' }}>Answer:</strong>
                            {customAnswer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
