import React, { useMemo, useState } from 'react';
import './GlobalInterviewDashboard.css';
import { generateTextWithGemini } from '../services/ai';

export default function GlobalInterviewDashboard({ questionBank, setCurrentView }) {
    const [shuffleCount, setShuffleCount] = useState(0);
    const [savedQuestions, setSavedQuestions] = useState([]);

    // Modal states
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [aiAnswer, setAiAnswer] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Use useMemo to pick daily random questions. 
    // We add shuffleCount to the dependency array to allow reshuffling.
    const dailyQuestions = useMemo(() => {
        const pickRandom = (arr) => {
            if (!arr || arr.length === 0) return 'No questions available';
            return arr[Math.floor(Math.random() * arr.length)];
        };

        return {
            behavior: pickRandom(questionBank.behavior),
            product: pickRandom(questionBank.product),
            technical_stats: pickRandom(questionBank.technical_stats),
            technical_ab: pickRandom(questionBank.technical_ab),
            technical_ml: pickRandom(questionBank.technical_ml),
            technical_dl: pickRandom(questionBank.technical_dl),
        };
    }, [shuffleCount, questionBank]);

    const handlePractice = (questionText, category) => {
        setActiveQuestion({ text: questionText, category });
        setAiAnswer('');
    };

    const handleGenerateAnswer = async () => {
        if (!activeQuestion) return;
        setIsGenerating(true);
        try {
            const prompt = `You are an expert interview coach. Provide a comprehensive, structured, and excellent answer or framework to answer the following interview question.\n\nQuestion: ${activeQuestion.text}\nCategory: ${activeQuestion.category}`;
            const answer = await generateTextWithGemini("Answer concisely and professionally.", prompt);
            setAiAnswer(answer);
        } catch (error) {
            alert("Error generating answer: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveQuestion = (questionObj) => {
        if (!savedQuestions.find(q => q.text === questionObj.text)) {
            setSavedQuestions([...savedQuestions, questionObj]);
        }
    };

    const handleRemoveSaved = (questionText) => {
        setSavedQuestions(savedQuestions.filter(q => q.text !== questionText));
    };

    return (
        <div className="global-interview-dashboard">
            <header className="dashboard-header text-center" style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Daily Interview Practice</h1>
                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Fresh questions every day to keep your interview skills sharp. Try answering them out loud or write down your thoughts.
                </p>
            </header>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
                <button className="btn-outline" onClick={() => setCurrentView('manage-questions')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Manage Question Bank
                </button>
                <button className="btn-secondary" onClick={() => setShuffleCount(c => c + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
                    Shuffle Questions
                </button>
            </div>

            <div className="daily-questions-grid">
                <div className="question-card glass-panel interactive-card hover-glow behavior">
                    <div className="card-tag">Behavioral</div>
                    <h3>{dailyQuestions.behavior}</h3>
                    <button className="btn-outline mt-auto w-full" onClick={() => handlePractice(dailyQuestions.behavior, 'Behavioral')}>Practice</button>
                </div>

                <div className="question-card glass-panel interactive-card hover-glow product">
                    <div className="card-tag">Product Case</div>
                    <h3>{dailyQuestions.product}</h3>
                    <button className="btn-outline mt-auto w-full" onClick={() => handlePractice(dailyQuestions.product, 'Product Case')}>Practice</button>
                </div>

                <div className="question-category-group full-width">
                    <h2 style={{ marginBottom: '1.5rem', marginTop: '2rem' }}>Technical Deep Dive</h2>
                    <div className="questions-grid-4">
                        <div className="question-card glass-panel interactive-card minimal" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-tag text-muted mb-2">Statistics</div>
                            <h4 style={{ flex: 1 }}>{dailyQuestions.technical_stats}</h4>
                            <button className="btn-secondary mt-3" style={{ fontSize: '0.85rem', padding: '0.4rem' }} onClick={() => handlePractice(dailyQuestions.technical_stats, 'Statistics')}>Practice</button>
                        </div>

                        <div className="question-card glass-panel interactive-card minimal" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-tag text-muted mb-2">A/B Testing</div>
                            <h4 style={{ flex: 1 }}>{dailyQuestions.technical_ab}</h4>
                            <button className="btn-secondary mt-3" style={{ fontSize: '0.85rem', padding: '0.4rem' }} onClick={() => handlePractice(dailyQuestions.technical_ab, 'A/B Testing')}>Practice</button>
                        </div>

                        <div className="question-card glass-panel interactive-card minimal" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-tag text-muted mb-2">Machine Learning</div>
                            <h4 style={{ flex: 1 }}>{dailyQuestions.technical_ml}</h4>
                            <button className="btn-secondary mt-3" style={{ fontSize: '0.85rem', padding: '0.4rem' }} onClick={() => handlePractice(dailyQuestions.technical_ml, 'Machine Learning')}>Practice</button>
                        </div>

                        <div className="question-card glass-panel interactive-card minimal" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-tag text-muted mb-2">Deep Learning</div>
                            <h4 style={{ flex: 1 }}>{dailyQuestions.technical_dl}</h4>
                            <button className="btn-secondary mt-3" style={{ fontSize: '0.85rem', padding: '0.4rem' }} onClick={() => handlePractice(dailyQuestions.technical_dl, 'Deep Learning')}>Practice</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Questions Section */}
            {savedQuestions.length > 0 && (
                <div style={{ marginTop: '4rem', maxWidth: '1000px', margin: '4rem auto 0 auto' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Saved for Review</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {savedQuestions.map((q, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="card-tag text-muted mb-2" style={{ display: 'inline-block' }}>{q.category}</div>
                                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{q.text}</h4>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-primary" onClick={() => handlePractice(q.text, q.category)}>Review</button>
                                    <button className="btn-icon" onClick={() => handleRemoveSaved(q.text)} style={{ border: '1px solid #e2e8f0', background: 'white' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#ef4444"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Practice Modal Overlay */}
            {activeQuestion && (
                <div className="modal-overlay" onClick={() => setActiveQuestion(null)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '700px', width: '90%', padding: '2.5rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setActiveQuestion(null)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="card-tag text-muted mb-3" style={{ display: 'inline-block' }}>{activeQuestion.category}</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.4' }}>{activeQuestion.text}</h2>

                        {!aiAnswer && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={handleGenerateAnswer} disabled={isGenerating}>
                                    {isGenerating ? 'Analyzing...' : 'Generate AI Answer'}
                                </button>
                                <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={() => { handleSaveQuestion(activeQuestion); setActiveQuestion(null); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    Save Question
                                </button>
                            </div>
                        )}

                        {aiAnswer && (
                            <div className="ai-answer-box" style={{ marginTop: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--brand-purple)', fontWeight: '600' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    AI Suggested Answer
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                                    {aiAnswer}
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn-outline" onClick={() => { handleSaveQuestion(activeQuestion); setActiveQuestion(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                        Save for later
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
