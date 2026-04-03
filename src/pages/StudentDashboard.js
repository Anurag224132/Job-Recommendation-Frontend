import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/student/JobCard';
import UploadResume from '../components/student/UploadResume';
import StudentAnalytics from '../components/student/StudentAnalytics';
import ProfileSection from '../components/student/ProfileSection';
import LogoutButton from '../components/common/LogoutButton';
import { useNavigate, useParams } from 'react-router-dom';
import JobDetails from '../components/student/JobDetails';
import api from '../utils/api';
import Pagination from '../components/common/Pagination';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();

  // State declarations
  const [userSkills, setUserSkills] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [page, setPage] = useState(0);

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

  // Use React Query for fetching recommended jobs
  const {
    data: jobsData,
    isLoading: loading,
    error: fetchError
  } = useQuery({
    queryKey: ['recommendedJobs', page, userSkills, hasUploadedResume],
    queryFn: async () => {
      if (!hasUploadedResume) return { jobs: [], totalPages: 0, fitScores: {} };

      // 1. Fetch Jobs from Backend
      const jobsRes = await api.get(`/api/jobs?page=${page}&size=10`);
      const allJobs = jobsRes.data.content || jobsRes.data || [];
      const totalPages = jobsRes.data.totalPages || 0;

      let finalJobs = allJobs;
      let scores = {};

      // 2. ML Matching (if skills exist)
      if (userSkills.length > 0) {
        try {
          const matchingPayload = {
            skills: userSkills,
            jobs: allJobs.map(job => ({
              id: job.id || job._id,
              requiredSkills: job.requiredSkills || [],
            }))
          };

          const matchRes = await axios.post(
            `${process.env.REACT_APP_ML_API_URL}/match_jobs`,
            matchingPayload
          );

          const matches = matchRes.data?.matches || [];
          if (matches.length > 0) {
            finalJobs = allJobs.filter(job =>
              matches.some(tj => (tj.id || tj._id) === (job.id || job._id))
            );
          }
        } catch (mlErr) {
          console.error('ML Filtering failed, showing all jobs:', mlErr);
        }

        // 3. Fetch Fit Scores in Batch
        if (finalJobs.length > 0) {
          try {
            const fitRes = await api.post('/api/applications/calculate-fit-batch', {
              jobIds: finalJobs.map(j => j.id || j._id),
              resumeSkills: userSkills
            });
            scores = fitRes.data;
          } catch (fitErr) {
            console.error('Error fetching batch fit scores:', fitErr);
          }
        }
      }
      return { jobs: finalJobs, totalPages, fitScores: scores };
    },
    enabled: !!(currentUser?.role === 'student' && hasUploadedResume)
  });

  const {
    data: appliedJobsData,
    isLoading: appliedJobsLoading,
  } = useQuery({
    queryKey: ['appliedJobs', currentUser?.id || currentUser?._id],
    queryFn: async () => {
      if (!currentUser) return [];
      const res = await api.get('/api/applications');
      const applications = res.data.content || res.data;
      return Array.isArray(applications) ? applications.map(app => ({
        ...app,
        status: app.status.toLowerCase()
      })) : [];
    },
    enabled: !!currentUser && (currentUser.role === 'student' || currentUser.role === 'STUDENT'),
  });

  const appliedJobs = appliedJobsData || [];

  // Handle resume parse update
  const handleResumeParsed = (parsedData) => {
    if (parsedData.skills?.length > 0) {
      setUserSkills(parsedData.skills);
      setHasUploadedResume(true);
      localStorage.setItem('hasUploadedResume', 'true');
    } else {
      alert('No skills found in the uploaded resume.');
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);

    // Track in recent jobs
    let viewed = JSON.parse(localStorage.getItem('recentJobs')) || [];
    const id = job.id || job._id;
    viewed = [job, ...viewed.filter(j => (j.id || j._id) !== id)].slice(0, 5);
    localStorage.setItem('recentJobs', JSON.stringify(viewed));
  };

  /**  Handle applied job click */
  const handleAppliedJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);

    let viewed = JSON.parse(localStorage.getItem('recentJobs')) || [];
    const id = job.id || job._id;
    viewed = [job, ...viewed.filter(j => (j.id || j._id) !== id)].slice(0, 5);
    localStorage.setItem('recentJobs', JSON.stringify(viewed));
  };

  // Filter applied jobs by status
  const filterByStatus = (status) => {
    if (status === 'all') {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
  };

  const filteredAppliedJobs = useMemo(() => {
    if (!statusFilter) return appliedJobs;
    return appliedJobs.filter(job => job.status === statusFilter);
  }, [appliedJobs, statusFilter]);

  // Clear status filter
  const clearFilter = () => {
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
                    key={application.id || application._id}
                    className={`bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg transition ${jobExists
                      ? 'hover:shadow-emerald-400/20 cursor-pointer'
                      : 'cursor-not-allowed'
                      }`}
                    onClick={() => jobExists && handleAppliedJobClick(application.job)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-emerald-300">
                          {application.jobTitle || (application.job && application.job.title) || 'Job no longer available'}
                        </h3>
                        <p className="text-gray-300">
                          {application.companyName || (application.job && application.job.companyName) || 'Unknown Company'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Applied on: {new Date(application.createdAt).toLocaleDateString()}
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
                          <p>Recruiter: {application.job && application.job.recruiter
                            ? application.job.recruiter.name
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
                <h2 id="recommended-jobs-title" className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
                        key={job.id || job._id}
                        job={job}
                        userSkills={userSkills}
                        onJobClick={handleJobClick}
                        preCalculatedFitScore={fitScores[job.id || job._id]}
                      />
                    ))}
                  
                  <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={(newPage) => {
                      setPage(newPage);
                      // Scroll to top of job list
                      document.getElementById('recommended-jobs-title')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                  />
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
              jobId={selectedJob.id || selectedJob._id}
              onClose={() => setShowJobDetails(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;