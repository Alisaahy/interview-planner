import React, { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import GlobalInterviewDashboard from './components/GlobalInterviewDashboard'
import ResumeUpload from './components/ResumeUpload'
import AddJob from './components/AddJob'
import QuestionBankManager from './components/QuestionBankManager'
import Settings from './components/Settings'
import { QUESTION_BANKS } from './mockData'

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('vibe_apply_jobs');
    if (saved) { try { return JSON.parse(saved); } catch { } }
    return [];
  });

  const [userResume, setUserResume] = useState(() => {
    return localStorage.getItem('vibe_apply_resume') || '';
  });

  // Persist jobs and resume on change
  useEffect(() => {
    localStorage.setItem('vibe_apply_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('vibe_apply_resume', userResume);
  }, [userResume]);

  // Initialize question bank from localStorage, or fallback to mockData
  const [questionBank, setQuestionBank] = useState(() => {
    const saved = localStorage.getItem('vibe_apply_question_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved question bank", e);
      }
    }
    return QUESTION_BANKS;
  });

  // Save to localStorage whenever questionBank changes
  React.useEffect(() => {
    localStorage.setItem('vibe_apply_question_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  const handleAddJob = (newJob) => {
    const jobWithIdAndStatus = {
      ...newJob,
      id: Date.now(),
      status: 'Applying',
      role: newJob.title
    };
    setJobs([jobWithIdAndStatus, ...jobs]);
    setCurrentView('dashboard');
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const handleUpdateJob = (id, updates) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, ...updates } : job));
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content" style={currentView === 'dashboard' ? { padding: 0, maxWidth: 'none' } : {}}>
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} jobs={jobs} onDeleteJob={handleDeleteJob} onUpdateJob={handleUpdateJob} userResume={userResume} />}
        {currentView === 'interview' && <GlobalInterviewDashboard questionBank={questionBank} setCurrentView={setCurrentView} />}
        {currentView === 'manage-questions' && <QuestionBankManager questionBank={questionBank} setQuestionBank={setQuestionBank} setCurrentView={setCurrentView} />}
        {currentView === 'resume' && <ResumeUpload onSaveResume={setUserResume} setCurrentView={setCurrentView} />}
        {currentView === 'addjob' && <AddJob onAddJob={handleAddJob} />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
