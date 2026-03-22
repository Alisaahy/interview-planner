import React, { useState } from 'react';
import ApplicationTab from './ApplicationTab';
import InterviewTab from './InterviewTab';

const STATUS_OPTIONS = ['Exploring', 'Applying', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// Reusable inline-edit text field
function InlineEdit({ value, onSave, style, inputStyle, large }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const start = () => { setDraft(value); setEditing(true); };
    const save = () => { if (draft.trim()) onSave(draft.trim()); setEditing(false); };
    const onKey = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); };

    if (editing) return (
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={onKey}
            style={{ fontSize: large ? '1.75rem' : '1.15rem', fontWeight: large ? 700 : 400, background: 'var(--bg-secondary)', border: '1px solid var(--brand-purple)', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', padding: '0.1rem 0.4rem', width: large ? '240px' : '180px', ...inputStyle }} />
    );
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'text', ...style }}
            onClick={start} title="Click to edit">
            <span>{value}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        </span>
    );
}

// Inline-editable status badge
function InlineStatusEdit({ value, onSave }) {
    const [editing, setEditing] = useState(false);
    if (editing) return (
        <select autoFocus value={value} onBlur={() => setEditing(false)}
            onChange={e => { onSave(e.target.value); setEditing(false); }}
            style={{ fontSize: '0.85rem', fontWeight: 500, borderRadius: 'var(--radius-full)', border: '1px solid var(--brand-purple)', background: 'var(--bg-secondary)', color: 'var(--color-text-main)', padding: '0.2rem 0.5rem', outline: 'none', cursor: 'pointer' }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
    );
    return (
        <span onClick={() => setEditing(true)} title="Click to change status"
            className="status-badge"
            style={{ backgroundColor: 'var(--brand-purple-light)', color: 'var(--brand-purple-dark)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {value}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}><polyline points="6 9 12 15 18 9" /></svg>
        </span>
    );
}

export default function JobDetails({ job, userResume, onUpdateJob }) {
    const [activeTab, setActiveTab] = useState('application');
    const [editingUrl, setEditingUrl] = useState(false);
    const [urlDraft, setUrlDraft] = useState('');

    const startEditUrl = () => { setUrlDraft(job.sourceUrl || ''); setEditingUrl(true); };
    const saveUrl = () => { const t = urlDraft.trim(); onUpdateJob(job.id, { sourceUrl: t || null }); setEditingUrl(false); };
    const handleUrlKeyDown = (e) => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditingUrl(false); };

    return (
        <div className="job-details">
            <header className="job-header" style={{ marginBottom: '2.5rem' }}>
                <div className="job-title-row flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Editable company */}
                        <InlineEdit large value={job.company} onSave={v => onUpdateJob(job.id, { company: v })}
                            style={{ fontSize: '1.75rem', fontWeight: 700 }} />
                        {/* Editable role */}
                        <InlineEdit value={job.role} onSave={v => onUpdateJob(job.id, { role: v })}
                            style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)' }} />
                        {/* Editable status */}
                        <InlineStatusEdit value={job.status} onSave={v => onUpdateJob(job.id, { status: v })} />

                        {/* Editable job URL */}
                        {editingUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input autoFocus type="url" value={urlDraft}
                                    onChange={e => setUrlDraft(e.target.value)} onKeyDown={handleUrlKeyDown}
                                    placeholder="Paste job URL..."
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--brand-purple)', background: 'var(--bg-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '260px' }} />
                                <button onClick={saveUrl} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--brand-purple)', color: '#fff', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setEditingUrl(false)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        ) : job.sourceUrl ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--brand-purple)', textDecoration: 'none', padding: '0.25rem 0.65rem', border: '1px solid rgba(134,100,249,0.35)', borderRadius: 'var(--radius-full)', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(134,100,249,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title={job.sourceUrl}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    View Posting
                                </a>
                                <button onClick={startEditUrl} title="Edit URL" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                            </div>
                        ) : (
                            <button onClick={startEditUrl} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'none', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.65rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add job link
                            </button>
                        )}
                    </div>

                    <div className="tab-switcher glass-panel" style={{ padding: '0.25rem', display: 'flex', borderRadius: 'var(--radius-full)' }}>
                        <button className={`btn-tab ${activeTab === 'application' ? 'active' : ''}`}
                            onClick={() => setActiveTab('application')}
                            style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '600', color: activeTab === 'application' ? 'var(--color-text-main)' : 'var(--color-text-muted)', backgroundColor: activeTab === 'application' ? 'white' : 'transparent', boxShadow: activeTab === 'application' ? 'var(--shadow-sm)' : 'none' }}>
                            Application
                        </button>
                        <button className={`btn-tab ${activeTab === 'interview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('interview')}
                            style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '600', color: activeTab === 'interview' ? 'var(--color-text-main)' : 'var(--color-text-muted)', backgroundColor: activeTab === 'interview' ? 'white' : 'transparent', boxShadow: activeTab === 'interview' ? 'var(--shadow-sm)' : 'none' }}>
                            Interview
                        </button>
                    </div>
                </div>
            </header>

            <div className="job-body">
                {activeTab === 'application' ? <ApplicationTab job={job} userResume={userResume} /> : <InterviewTab job={job} />}
            </div>
        </div>
    );
}




