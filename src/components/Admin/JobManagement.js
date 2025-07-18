import { useState, useEffect } from 'react';
// import useCallback from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobDetails, setJobDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/jobs`,
                { headers }
            );

            setJobs(response.data);
            setError(null);
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError(err.response?.data?.message || 'Failed to load jobs. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDetails = async (jobId) => {
        try {
            setDetailsLoading(true);
            setError(null);
            setJobDetails(null);

            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/jobs/${jobId}/details`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data) {
                throw new Error('No data received');
            }

            setJobDetails(response.data);
        } catch (err) {
            console.error('Error fetching job details:', err);
            setError(err.response?.data?.message || 'Failed to load job details. Please try again.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewJobDetails = (job) => {
        setSelectedJob(job);
        fetchJobDetails(job._id);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
        setJobDetails(null);
        setError(null);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/jobs/${jobId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setJobs(jobs.filter(job => job._id !== jobId));
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('Error deleting job');
        }
    };



    useEffect(() => {
        fetchJobs();
    }, []);

    // Filter jobs based on active filter and search query
    const filteredJobs = jobs.filter(job => {
        const matchesFilter =
            activeFilter === 'all' ||
            (activeFilter === 'active' && job.isActive) ||
            (activeFilter === 'inactive' && !job.isActive);

        const matchesSearch = searchQuery === '' ||
            (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (job.companyName && job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (job.recruiterName && job.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Loading Job Management</h2>
                    <p className="text-gray-300">Fetching job data...</p>
                </div>
            </div>
        );
    }

    if (error && !selectedJob) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={fetchJobs}
                        className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br rounded-2xl from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Modal for Job Details */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl relative">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-slate-700/50 p-1 rounded-full hover:bg-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {detailsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-400">{error}</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="border-b border-white/10 pb-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedJob.title || 'Untitled Job'}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs">
                                                    {selectedJob.type || 'Full-time'}
                                                </span>
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                                                    {selectedJob.experience || 'Mid-level'}
                                                </span>
                                                {selectedJob.remote && (
                                                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                                                        Remote
                                                    </span>
                                                )}
                                                <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full text-xs">
                                                    {selectedJob.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Grid Layout for Job Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Column */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Description */}
                                        <div className="bg-slate-700/50 p-5 rounded-xl border border-white/10">
                                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Job Description
                                            </h3>
                                            <p className="text-gray-300 whitespace-pre-line">
                                                {selectedJob.description || 'No description provided'}
                                            </p>
                                        </div>

                                        {/* Skills */}
                                        {selectedJob.requiredSkills?.length > 0 && (
                                            <div className="bg-slate-700/50 p-5 rounded-xl border border-white/10">
                                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    Required Skills
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedJob.requiredSkills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Company & Recruiter Info */}
                                        <div className="bg-slate-700/50 p-5 rounded-xl border border-white/10">
                                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Company Details
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-400">Company</p>
                                                    <p className="text-white font-medium">{selectedJob.companyName || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Recruiter</p>
                                                    <p className="text-white font-medium">{selectedJob.recruiterName || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Location</p>
                                                    <p className="text-white font-medium">{selectedJob.location || 'Not specified'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Stats */}
                                        <div className="bg-slate-700/50 p-5 rounded-xl border border-white/10">
                                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Job Statistics
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-400">Salary</p>
                                                    <p className="text-white font-medium">
                                                        {selectedJob.salary ? `$${selectedJob.salary}` : 'Not disclosed'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Type</p>
                                                    <p className="text-white font-medium capitalize">{selectedJob.type || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Posted</p>
                                                    <p className="text-white font-medium">
                                                        {new Date(selectedJob.postedDate || selectedJob.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Last Updated</p>
                                                    <p className="text-white font-medium">
                                                        {new Date(selectedJob.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Applications Analytics */}
                                        {jobDetails && (
                                            <div className="bg-slate-700/50 p-5 rounded-xl border border-white/10">
                                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Applications Analytics
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Total Applications</p>
                                                        <p className="text-xl font-bold text-white">{jobDetails.applications || 0}</p>
                                                    </div>
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Match Rate</p>
                                                        <p className="text-xl font-bold text-white">
                                                            {jobDetails.averageMatchScore ? `${jobDetails.averageMatchScore}%` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {jobDetails.topApplicants?.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm text-gray-400 mb-1">Top Applicants:</p>
                                                        <div className="space-y-2">
                                                            {jobDetails.topApplicants.slice(0, 3).map((applicant, index) => (
                                                                <div key={index} className="flex items-center justify-between bg-slate-600/20 p-2 rounded">
                                                                    <div className="flex items-center">
                                                                        <div className="h-6 w-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-2">
                                                                            <span className="text-xs text-cyan-300">{index + 1}</span>
                                                                        </div>
                                                                        <span className="text-sm text-white">{applicant.name || 'Anonymous'}</span>
                                                                    </div>
                                                                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                                                        {applicant.matchScore}%
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Job Management
                            </h1>
                            <p className="text-gray-300 text-lg">Manage and analyze all job postings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-500/30 shadow-sm">
                            <span className="text-purple-300 font-semibold">{jobs.length} Total Jobs</span>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search jobs by title, company or recruiter..."
                                className="bg-slate-800/50 border border-white/20 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 border border-white/20">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeFilter === 'all'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-gray-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveFilter('active')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeFilter === 'active'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-gray-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setActiveFilter('inactive')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeFilter === 'inactive'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-gray-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
                    <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-inner">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Title</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            <span>Description</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Recruiter</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/5 divide-y divide-white/10">
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <tr key={job._id} className="hover:bg-white/10">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{job.title || 'Untitled Job'}</div>
                                                        <div className="text-xs text-gray-400">{job.companyName || 'No company'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {job.description && job.description.length > 50 ? (
                                                        <>
                                                            {job.description.substring(0, 50)}...
                                                        </>
                                                    ) : (
                                                        job.description || 'No description'
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-xs font-bold text-white">
                                                            {job.postedBy?.name?.charAt(0)?.toUpperCase() || job.recruiterName?.charAt(0)?.toUpperCase() || 'R'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">{job.postedBy?.name || job.recruiterName || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-400">{job.postedBy?.email || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                    {job.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewJobDetails(job)}
                                                        className="group/btn bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 px-3 py-2 rounded-lg text-xs font-medium border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="h-3 w-3 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>Details</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        className="group/btn bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg text-xs font-medium border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="h-3 w-3 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                            No jobs found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default JobManagement;