import React, { useState } from 'react';
import './Dashboard.css';
import Sidebar from './Sidebar';
import JobDetails from './JobDetails'; // We will create this next

export default function Dashboard({ setCurrentView, jobs, onDeleteJob, onUpdateJob, userResume }) {
    const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id);

    const selectedJob = jobs.find(j => j.id === selectedJobId);

    return (
        <div className="dashboard-container">
            <Sidebar
                jobs={jobs}
                selectedJobId={selectedJobId}
                onSelectJob={setSelectedJobId}
                onAddNewJob={() => setCurrentView('addjob')}
                onUpdateJob={onUpdateJob}
                onDeleteJob={(id) => {
                    onDeleteJob(id);
                    if (selectedJobId === id) {
                        const remaining = jobs.filter(j => j.id !== id);
                        setSelectedJobId(remaining.length > 0 ? remaining[0].id : null);
                    }
                }}
            />
            <div className="dashboard-content">
                {selectedJob ? (
                    <JobDetails job={selectedJob} userResume={userResume} onUpdateJob={onUpdateJob} />
                ) : (
                    <div className="empty-state">Select a job to view details</div>
                )}
            </div>
        </div>
    );
}
