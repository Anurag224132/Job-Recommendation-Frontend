import { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobDetails from './JobDetails';
import { useNavigate } from 'react-router-dom';

const RecentJobsPage = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentJobs')) || [];
    setRecentJobs(viewed);
  }, []);

  const handleRemoveJob = (e, jobId) => {
    e.stopPropagation();
    const updatedJobs = recentJobs.filter(job => (job.id || job._id) !== jobId);
    setRecentJobs(updatedJobs);
    localStorage.setItem('recentJobs', JSON.stringify(updatedJobs));
  };
  
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleClearAll = () => {
    localStorage.removeItem('recentJobs');
    setRecentJobs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          {recentJobs.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Recently Viewed Jobs
                </h1>
                <div className="flex gap-4">
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition transform hover:scale-105 active:scale-95"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-cyan-600 transition transform hover:scale-105 active:scale-95"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {recentJobs.map((job) => (
                  <div key={job.id || job._id} className="relative group">
                    <JobCard 
                      job={job} 
                      userSkills={[]} 
                      onJobClick={handleJobClick}
                    />
                    <button
                      onClick={(e) => handleRemoveJob(e, job.id || job._id)}
                      className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      title="Remove"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-gray-300 text-lg">No recently viewed jobs available.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-cyan-600 transition transform hover:scale-105 active:scale-95"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <JobDetails
              jobId={selectedJob.id || selectedJob._id}
              onClose={() => setShowJobDetails(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentJobsPage;
