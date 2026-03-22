import React from 'react';
import './Navbar.css';

export default function Navbar({ currentView, setCurrentView }) {
    return (
        <header className="navbar glass-panel">
            <div className="navbar-left">
                <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>✨ Vibe Apply</div>
            </div>
            <nav className="navbar-center">
                <a href="#" className={`nav-link ${currentView === 'landing' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('landing'); }}>Home</a>
                <a href="#" className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}>Jobs</a>
                <a href="#" className={`nav-link ${currentView === 'interview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('interview'); }}>Interview</a>
            </nav>
            <div className="navbar-right">
                <button className="btn-primary" style={{ borderRadius: 'var(--radius-full)', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => setCurrentView('resume')}>
                    <span>+</span> Resume Profile
                </button>
            </div>
        </header>
    );
}
