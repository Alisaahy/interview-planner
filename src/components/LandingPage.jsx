import React from 'react';
import './LandingPage.css';

export default function LandingPage() {
    return (
        <div className="landing-page">
            <section className="hero-section">
                <h1 className="hero-title">
                    Job Hunting is <span className="text-gradient">Broken</span>. Let's fix it.
                </h1>
                <p className="hero-subtitle text-muted">
                    You rewrite. You apply. You get ghosted. Then you do it all over again. Upgrade to Vibe Apply.
                </p>
            </section>

            <section className="features-section">
                <div className="feature-card glass-panel interactive-card">
                    <div className="feature-number">01.</div>
                    <h3>Application kit in one click</h3>
                    <p className="text-muted">
                        Paste the job post and get a tailored resume bullet, cover letter, and cold message in one go. No forms, no friction.
                    </p>
                </div>

                <div className="feature-card glass-panel interactive-card">
                    <div className="feature-number">02.</div>
                    <h3>Know your fit</h3>
                    <p className="text-muted">
                        We scan the job and your resume to highlight what aligns and what's missing. Save time and focus on what matters.
                    </p>
                </div>

                <div className="feature-card glass-panel interactive-card">
                    <div className="feature-number">03.</div>
                    <h3>Smart Interview Q&A</h3>
                    <p className="text-muted">
                        Get custom questions and answers that match the role. You can edit or add your own anytime. Quick prep, clear value.
                    </p>
                </div>
            </section>
        </div>
    );
}
