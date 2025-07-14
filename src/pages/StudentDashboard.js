import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api';
import JobCard from '../components/JobCard';
import UploadResume from '../components/UploadResume';
import StudentAnalytics from '../components/student/StudentAnalytics';
import ProfileSection from '../components/student/ProfileSection';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import JobDetails from '../components/student/JobDetails';
import { useParams } from 'react-router-dom';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();

  // State declarations
  const [jobs, setJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedJobsLoading, setAppliedJobsLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);

  // Check for previously uploaded resume on initial load
  useEffect(() => {
    const hasResume = localStorage.getItem('hasUploadedResume') === 'true';
    setHasUploadedResume(hasResume);
  }, []);

  // Load user skills
  useEffect(() => {
    if (currentUser?.skills?.length > 0) {
      setUserSkills(currentUser.skills);
    }
  }, [currentUser]);

  // Fetch recommended jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!hasUploadedResume) return;
      setLoading(true);
      try {
        const jobsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs`);
        const allJobs = jobsRes.data;

        // If no skills, show all jobs with a warning
        if (userSkills.length === 0) {
          console.warn('No skills available - showing all jobs');
          setJobs(allJobs);
          return;
        }

        const matchingPayload = {
          skills: userSkills,
          jobs: allJobs.map(job => ({
            id: job._id,
            required_skills: job.skills || [],
          }))
        };

        const matchRes = await axios.post(
          `${process.env.REACT_APP_ML_API_URL}/match_jobs`,
          matchingPayload
        );

        const matchedJobs = allJobs.filter(job =>
          matchRes.data.matches.some(match => match.jobId === job._id)
        );

        setJobs(matchedJobs);

      } catch (err) {
        console.error('Error:', err);
        // Fallback: Show all jobs if matching fails
        const jobsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs`);
        setJobs(jobsRes.data);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'student' && hasUploadedResume) {
      fetchJobs();
    }
  }, [userSkills, currentUser?.role, hasUploadedResume]);

  // Fetch applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!currentUser?._id) return;
      setAppliedJobsLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications/user/${currentUser._id}`);
        const filtered = res.data.filter(app => app.job).map(app => ({
          ...app,
          status: app.status.toLowerCase()
        }));
        setAppliedJobs(filtered);
      } catch (err) {
        console.error('❌ Failed to fetch applied jobs:', err.response?.data || err.message);
      } finally {
        setAppliedJobsLoading(false);
      }
    };
    if (currentUser?.role === 'student') fetchAppliedJobs();
  }, [currentUser]);

  // Handle resume parse update
  const handleResumeParsed = (parsedData) => {
    if (parsedData.skills?.length > 0) {
      setUserSkills(parsedData.skills);
      setHasUploadedResume(true);
      localStorage.setItem('hasUploadedResume', 'true');
      // Reset jobs to trigger refetch
      setJobs([]);
    } else {
      alert('No skills found in the uploaded resume.');
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);

    // Track in recent jobs
    let viewed = JSON.parse(localStorage.getItem('recentJobs')) || [];
    viewed = [job, ...viewed.filter(j => j._id !== job._id)].slice(0, 5);
    localStorage.setItem('recentJobs', JSON.stringify(viewed));
  };

  // Handle applied job click
  const handleAppliedJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);

    let viewed = JSON.parse(localStorage.getItem('recentJobs')) || [];
    viewed = [job, ...viewed.filter(j => j._id !== job._id)].slice(0, 5);
    localStorage.setItem('recentJobs', JSON.stringify(viewed));
  };

  // Filter applied jobs by status
  const filterByStatus = (status) => {
    if (status === 'all') {
      setFilteredJobs(appliedJobs);
      setStatusFilter(null);
    } else {
      setFilteredJobs(appliedJobs.filter(job => job.status === status));
      setStatusFilter(status);
    }
  };

  // Clear status filter
  const clearFilter = () => {
    setFilteredJobs([]);
    setStatusFilter(null);
  };

  useEffect(() => {
    const hasResume = localStorage.getItem('hasUploadedResume') === 'true';
    setHasUploadedResume(hasResume);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="fixed top-6 right-6 z-50">
        <ProfileSection />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome back, {currentUser?.name}!
                </h1>
                <p className="text-cyan-300 font-semibold text-lg">Student Dashboard</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/recent-jobs')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-cyan-600 transition transform hover:scale-105 active:scale-95"
              >
                📂 View Recently Viewed Jobs
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Analytics with status filtering */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <StudentAnalytics
            appliedJobs={appliedJobs}
            loading={appliedJobsLoading}
            onStatusClick={filterByStatus}
          />
        </div>

        {/* Applied Jobs List (only shown when filtered) */}
        {filteredJobs.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">
                {statusFilter === 'approved'
                  ? 'Approved Applications'
                  : statusFilter
                    ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`
                    : 'All Applications'}
              </h2>
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-indigo-600 transition"
              >
                Close List
              </button>
            </div>
            <div className="space-y-4">
              {filteredJobs.map((application) => {
                const jobExists = !!application.job;
                return (
                  <div
                    key={application._id}
                    className={`bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg transition ${jobExists
                      ? 'hover:shadow-emerald-400/20 cursor-pointer'
                      : 'cursor-not-allowed'
                      }`}
                    onClick={() => jobExists && handleAppliedJobClick(application.job)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-emerald-300">
                          {jobExists ? application.job.title : 'Job no longer available'}
                        </h3>
                        <p className="text-gray-300">
                          {jobExists
                            ? (application.job.recruiter?.company || 'Unknown Company')
                            : 'Unknown Company'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${application.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-300/30'
                          : application.status === 'approved'
                            ? 'bg-green-500/20 text-green-300 border border-green-300/30'
                            : 'bg-red-500/20 text-red-300 border border-red-300/30'
                          }`}>
                          {application.status.toUpperCase()}
                        </span>
                        <div className="text-sm text-gray-300 mt-2">
                          <p>Recruiter: {jobExists
                            ? (application.job.recruiter?.name || 'N/A')
                            : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="space-y-8">
            {/* Upload Resume */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">📄</span>
                <h2 className="text-2xl font-bold text-cyan-400">
                  {hasUploadedResume ? 'Update Resume' : 'Upload Resume'}
                </h2>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg transition hover:shadow-cyan-400/20">
                <UploadResume onParsed={handleResumeParsed} />
              </div>

              {!hasUploadedResume && (
                <div className="mt-6 bg-cyan-900/20 backdrop-blur-sm p-4 rounded-xl border border-cyan-400/20">
                  <p className="text-cyan-200 text-sm text-center">
                    Upload your resume to see your skills and get job recommendations
                  </p>
                </div>
              )}
            </div>

            {/* Skills */}
            {hasUploadedResume && userSkills.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-blue-500/20 transition">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">🎯</span>
                  <h2 className="text-2xl font-bold text-blue-400">Your Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {userSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-400/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2">
            {/* Recommended Jobs */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">💼</span>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Recommended Jobs
                </h2>
              </div>

              {!hasUploadedResume ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-gray-300">Upload your resume to get started</p>
                  <p className="text-gray-400 text-sm mt-2">
                    We'll analyze your skills and show personalized recommendations
                  </p>
                  <button
                    onClick={() => document.getElementById('resume-upload-input')?.click()}
                    className="mt-4 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
                  >
                    Upload Resume Now
                  </button>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-12 space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  <p className="text-gray-300">Finding perfect matches for you...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-300">No jobs matching your skills currently.</p>
                  <p className="text-gray-400 text-sm mt-2">Try updating your resume with more skills</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      userSkills={userSkills}
                      onClick={handleJobClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <JobDetails
              jobId={selectedJob._id}
              onClose={() => setShowJobDetails(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;