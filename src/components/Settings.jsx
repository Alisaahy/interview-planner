import React, { useState } from 'react';

export default function Settings() {
    const [apiKey, setApiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('user_gemini_api_key', apiKey.trim());
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', maxWidth: '600px', margin: '2rem auto' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Settings</h2>
            <p className="text-muted mb-4">
                To generate cover letters, scan jobs, and do AI interview prep, we use Google Gemini. 
                You can paste your own API key below to use your own quota instead of the default server quota.
            </p>
            
            <div className="input-group mb-4">
                <label className="text-muted block mb-2 font-medium">Your Gemini API Key</label>
                <input
                    type="password"
                    className="text-input"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Your key is saved locally in your browser. It is never stored on any server database. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: 'var(--brand-purple)'}}>Get an API key here</a>.
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn-primary" onClick={handleSave}>
                    Save Settings
                </button>
                {isSaved && <span style={{ color: '#10B981', fontWeight: '500' }}>✓ Saved!</span>}
            </div>
        </div>
    );
}
