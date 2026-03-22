import React, { useState } from 'react';
import './QuestionBankManager.css';

const CATEGORIES = [
    { id: 'behavior', label: 'Behavioral' },
    { id: 'product', label: 'Product Case' },
    { id: 'technical_stats', label: 'Statistics' },
    { id: 'technical_ab', label: 'A/B Testing' },
    { id: 'technical_ml', label: 'Machine Learning' },
    { id: 'technical_dl', label: 'Deep Learning' }
];

export default function QuestionBankManager({ questionBank, setQuestionBank, setCurrentView }) {
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newQuestion, setNewQuestion] = useState('');

    const startEditing = (index, value) => {
        setEditingIndex(index);
        setEditValue(value);
    };

    const saveEdit = (index) => {
        if (!editValue.trim()) return;

        const updatedCategory = [...questionBank[activeTab]];
        updatedCategory[index] = editValue.trim();

        setQuestionBank({
            ...questionBank,
            [activeTab]: updatedCategory
        });

        setEditingIndex(null);
        setEditValue('');
    };

    const deleteQuestion = (index) => {
        const updatedCategory = questionBank[activeTab].filter((_, i) => i !== index);
        setQuestionBank({
            ...questionBank,
            [activeTab]: updatedCategory
        });
    };

    const addQuestion = (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setQuestionBank({
            ...questionBank,
            [activeTab]: [newQuestion.trim(), ...questionBank[activeTab]]
        });

        setNewQuestion('');
    };

    const currentQuestions = questionBank[activeTab] || [];

    return (
        <div className="manager-page fade-in">
            <header className="manager-header">
                <button className="btn-icon back-btn" onClick={() => setCurrentView('interview')} style={{ marginRight: '1rem' }} aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div>
                    <h1>Manage Question Bank</h1>
                    <p className="text-muted">Add, edit, or remove questions from your daily interview practice pool.</p>
                </div>
            </header>

            <div className="manager-content glass-panel">
                <div className="tabs-container">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="tab-pane">
                    <form onSubmit={addQuestion} className="add-question-form">
                        <input
                            type="text"
                            placeholder="Type a new question and press Enter..."
                            className="text-input w-full"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" disabled={!newQuestion.trim()}>Add</button>
                    </form>

                    <ul className="questions-list">
                        {currentQuestions.length === 0 ? (
                            <li className="text-center text-muted" style={{ padding: '2rem' }}>No questions in this category. Add one above!</li>
                        ) : (
                            currentQuestions.map((q, idx) => (
                                <li key={idx} className="question-list-item hover-bg transition-colors">
                                    {editingIndex === idx ? (
                                        <div className="edit-mode-container" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx)}
                                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.95rem' }}
                                            />
                                            <button className="btn-primary" onClick={() => saveEdit(idx)} style={{ padding: '0.5rem 1rem' }}>Save</button>
                                            <button className="btn-outline" onClick={() => setEditingIndex(null)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="question-text">{q}</span>
                                            <div className="actions">
                                                <button className="btn-icon edit-btn" onClick={() => startEditing(idx, q)} title="Edit">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button className="btn-icon delete-btn hover-danger" onClick={() => deleteQuestion(idx)} title="Delete">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
