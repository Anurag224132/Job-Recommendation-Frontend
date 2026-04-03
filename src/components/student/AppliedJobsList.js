import React from 'react';
import { useNavigate } from 'react-router-dom';

const AppliedJobsList = ({ appliedJobs, loading, onJobClick }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-gray-300 mt-2">Loading your applications...</p>
      </div>
    );
  }

  // Safely handle job data
  const getJobTitle = (job) => {
    if (!job) return "Job no longer available";
    return job.title || "Untitled Position";
  };

  const getCompanyName = (job) => {
    if (!job) return "Unknown Company";
    if (!job.recruiter) return "Unknown Company";
    return job.recruiter.company || job.recruiter.name || "Unknown Company";
  };

  const getJobSkills = (job) => {
    if (!job) return [];
    return job.requiredSkills || [];
  };

  const handleJobClick = (application) => {
    // Only proceed if job exists
    if (application.job) {
      onJobClick(application.job);
      navigate(`/jobs/${application.job.id || application.job._id}`);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">📋</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Your Applications
        </h2>
      </div>

      {appliedJobs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-300">You haven't applied to any jobs yet.</p>
          <p className="text-gray-400 text-sm mt-2">Apply to jobs to track your applications here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appliedJobs.map((application) => {
            const jobExists = !!application.job;

            return (
              <div
                key={application.id || application._id}
                onClick={() => jobExists && handleJobClick(application)}
                className={`p-4 rounded-2xl backdrop-blur-sm border ${jobExists
                    ? "bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition cursor-pointer"
                    : "bg-gradient-to-r from-red-900/30 to-rose-900/30 border-rose-500/30 cursor-not-allowed"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300">
                      {getJobTitle(application.job)}
                    </h3>
                    <p className="text-purple-300">
                      {getCompanyName(application.job)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Applied on: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${application.status === 'approved'
                      ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-500/30"
                      : application.status === 'rejected'
                        ? "bg-gradient-to-r from-red-600/30 to-rose-600/30 text-red-300 border-red-500/30"
                        : "bg-gradient-to-r from-amber-600/30 to-yellow-600/30 text-amber-300 border-amber-500/30"
                    }`}>
                    {application.status === 'approved' ? 'Approved' : application.status || 'Submitted'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {getJobSkills(application.job).slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 px-2 py-1 rounded-full text-xs border border-indigo-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {!jobExists && (
                  <div className="mt-3 text-rose-400/80 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    This job has been removed by the recruiter
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppliedJobsList;