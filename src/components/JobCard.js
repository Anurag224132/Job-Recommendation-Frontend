import { useState, useEffect } from 'react';
import axios from '../api';
import { useAuth } from '../context/AuthContext';

const JobCard = ({ job, userSkills = [], onJobClick }) => {
  
  const { currentUser } = useAuth();
  const [fitScore, setFitScore] = useState(null);
  const [applied, setApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (userSkills.length > 0) {
      calculateFitScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSkills]);

  const calculateFitScore = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/applications/calculate-fit', {
        resumeSkills: userSkills,
        jobId: job._id,
      });
      setFitScore(res.data.score);
    } catch (err) {
      console.error('❌ Error calculating fit score:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e) => {
  e.stopPropagation();
  
  if (!currentUser?._id) {
    alert('Please log in to apply for jobs');
    return;
  }

  if (fitScore === null) {
    alert('Please wait while we calculate your fit score');
    return;
  }

  setApplying(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      '/api/applications',
      {
        jobId: job._id,
        fitScore: fitScore
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data && response.data.application) {
      setApplied(true);
      alert('✅ Application submitted successfully!');
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Application error:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to submit application';
    alert(`Application failed: ${errorMessage}`);
  } finally {
    setApplying(false);
  }
};

  const getFitScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  const getFitScoreText = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const togglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  const handleViewJob = () => {
    if (typeof onJobClick === 'function') {
      onJobClick(job);
    }
  };

  return (
    <>
      {/* Job Card (Compact View) */}
      <div
        onClick={handleViewJob}
        className="cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 text-white group"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Basic Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
              {job.title}
            </h3>
            <div className="flex items-center space-x-4 text-gray-300 text-sm mt-1">
              {job.companyName && (
                <div className="flex items-center space-x-1 truncate">
                  <span>🏢</span>
                  <span className="truncate">{job.companyName}</span>
                </div>
              )}
              {job.location && (
                <div className="flex items-center space-x-1">
                  <span>📍</span>
                  <span>{job.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fit Score & Details Button */}
          <div className="flex items-center space-x-4 sm:w-48">
            {/* Fit Score */}
            <div className="text-center min-w-[60px]">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin h-5 w-5 border-b-2 border-emerald-400"></div>
                </div>
              ) : fitScore !== null ? (
                <div className="space-y-1">
                  <div className={`text-lg font-bold bg-gradient-to-r ${getFitScoreColor(fitScore)} bg-clip-text text-transparent`}>
                    {fitScore}%
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">No score</div>
              )}
            </div>

            {/* Details Button */}
            <button
              onClick={togglePopup}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{job.title}</h2>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                    {job.companyName || 'Unknown Company'}
                  </span>
                  {job.remote && (
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      Remote
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={togglePopup}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Job Details Content */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Job Description</h3>
                <div className="bg-slate-800/50 p-4 rounded-xl text-slate-200 whitespace-pre-line">
                  {job.description || 'No description provided.'}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        userSkills.includes(skill)
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl">
                  <div className="text-slate-400 text-sm">Location</div>
                  <div className="text-white">{job.location || 'Not specified'}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl">
                  <div className="text-slate-400 text-sm">Salary</div>
                  <div className="text-white">{job.salary || 'Not specified'}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl">
                  <div className="text-slate-400 text-sm">Job Type</div>
                  <div className="text-white capitalize">{job.type?.toLowerCase() || 'Not specified'}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl">
                  <div className="text-slate-400 text-sm">Experience Level</div>
                  <div className="text-white capitalize">{job.experience?.toLowerCase() || 'Not specified'}</div>
                </div>
              </div>

              {/* Fit Score Visualization */}
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-3">Your Match Score</h3>
                {fitScore !== null ? (
                  <div className="space-y-4">
                    <div className={`text-4xl font-bold text-center bg-gradient-to-r ${getFitScoreColor(fitScore)} bg-clip-text text-transparent`}>
                      {fitScore}%
                    </div>
                    <div className={`text-center px-3 py-1 rounded-full ${getFitScoreColor(fitScore)} text-white text-sm`}>
                      {getFitScoreText(fitScore)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${getFitScoreColor(fitScore)}`}
                        style={{ width: `${fitScore}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">Score not calculated</div>
                )}
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                disabled={applied || applying || fitScore === null}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  applied
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : applying
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : fitScore === null
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90'
                }`}
              >
                {applied ? '✅ Applied' : applying ? 'Applying...' : '🚀 Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard;