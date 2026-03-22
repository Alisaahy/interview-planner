import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ jobs, selectedJobId, onSelectJob, onAddNewJob, onDeleteJob, onUpdateJob }) {
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Applying', 'Interviewing'
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = React.useCallback(() => setIsResizing(true), []);
    const stopResizing = React.useCallback(() => setIsResizing(false), []);
    const resize = React.useCallback((e) => {
        if (isResizing) setSidebarWidth(Math.min(Math.max(e.clientX, 260), 600));
    }, [isResizing]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = 'auto';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const filteredJobs = jobs.filter(job => {
        if (activeTab === 'All') return true;
        return job.status === activeTab;
    });

    return (
        <aside className={`sidebar ${isResizing ? 'is-resizing' : ''}`} style={{ width: sidebarWidth }}>
            <div className="sidebar-resizer" onMouseDown={startResizing}></div>
            <div className="sidebar-top-section">
                <div className="sidebar-header flex-between mb-4">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--color-text-main)' }}>Recent Jobs</h2>
                    <div style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} title="Drag the right edge to resize">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
                    </div>
                </div>

                <button style={{
                    width: '100%',
                    backgroundColor: '#8664F9', /* specific purple from screenshot */
                    color: 'white',
                    border: 'none',
                    padding: '0.9rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                    cursor: 'pointer'
                }} onClick={onAddNewJob}>
                    <span>+</span> New Job
                </button>

                <div className="search-bar-container mb-4">
                    <span className="search-icon" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input type="text" className="search-input" placeholder="Search jobs..." />
                </div>

                <div className="sidebar-pill-tabs mb-4">
                    {['All', 'Applying', 'Interviewing'].map(tab => (
                        <button
                            key={tab}
                            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar-list-container">
                <ul className="job-list">
                    {filteredJobs.length > 0 ? filteredJobs.map(job => (
                        <li
                            key={job.id}
                            className={`job-item ${selectedJobId === job.id ? 'active' : ''}`}
                            onClick={() => onSelectJob(job.id)}
                            title={`${job.company} - ${job.role}`}
                        >
                            <div style={{ flex: 1 }}>
                                <div className="flex-between">
                                    <div className="job-company">{job.company}</div>
                                    <span className="job-status-badge">{job.status}</span>
                                </div>
                                <div className="job-role text-muted">{job.role}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{new Date().toLocaleDateString()}</div>

                                {/* Progress toggles for Applying jobs */}
                                {job.status === 'Applying' && (
                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateJob(job.id, { coldMessageSent: !job.coldMessageSent }); }}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '999px',
                                                border: `1px solid ${job.coldMessageSent ? '#8b5cf6' : 'var(--glass-border)'}`,
                                                background: job.coldMessageSent ? '#8b5cf6' : 'transparent',
                                                color: job.coldMessageSent ? '#000' : 'var(--color-text-muted)',
                                                fontWeight: job.coldMessageSent ? 600 : 400,
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                transition: 'all 0.15s'
                                            }}
                                            title="Toggle: Cold message sent"
                                        >
                                            {job.coldMessageSent ? '✓' : '○'} Message Sent
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateJob(job.id, { applicationSubmitted: !job.applicationSubmitted }); }}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '999px',
                                                border: `1px solid ${job.applicationSubmitted ? '#22c55e' : 'var(--glass-border)'}`,
                                                background: job.applicationSubmitted ? '#22c55e' : 'transparent',
                                                color: job.applicationSubmitted ? '#000' : 'var(--color-text-muted)',
                                                fontWeight: job.applicationSubmitted ? 600 : 400,
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                transition: 'all 0.15s'
                                            }}
                                            title="Toggle: Application submitted"
                                        >
                                            {job.applicationSubmitted ? '✓' : '○'} Applied
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateJob(job.id, { hasReference: !job.hasReference }); }}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '999px',
                                                border: `1px solid ${job.hasReference ? '#f59e0b' : 'var(--glass-border)'}`,
                                                background: job.hasReference ? '#f59e0b' : 'transparent',
                                                color: job.hasReference ? '#000' : 'var(--color-text-muted)',
                                                fontWeight: job.hasReference ? 600 : 400,
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                transition: 'all 0.15s'
                                            }}
                                            title="Toggle: Has a reference"
                                        >
                                            {job.hasReference ? '✓' : '○'} Reference
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                className="delete-job-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteJob(job.id);
                                }}
                                title="Delete Job"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </li>
                    )) : (
                        <div className="text-muted text-center" style={{ padding: '2rem 0', fontSize: '0.9rem' }}>
                            No jobs found
                        </div>
                    )}
                </ul>
            </div>
        </aside>
    );
}
