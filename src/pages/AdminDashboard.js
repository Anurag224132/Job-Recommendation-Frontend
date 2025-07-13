import { useState, useEffect, useCallback } from 'react';
import axios from '../api';
import LogoutButton from '../components/LogoutButton';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({});
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeUserTab, setActiveUserTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [jobDetails, setJobDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [metricsRes, usersRes, jobsRes] = await Promise.all([
                axios.get('/api/admin/metrics', { headers }),
                axios.get('/api/admin/users', { headers }),
                axios.get('/api/admin/jobs', { headers }),
            ]);

            setMetrics(metricsRes.data);
            setUsers(usersRes.data);
            setJobs(jobsRes.data);
            setError(null);
        } catch (err) {
            console.error('Error loading admin data:', err);
            setError(err.response?.data?.message || 'Failed to load data. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAnalytics = useCallback(async (userId) => {
        try {
            setDetailsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await axios.get(`/api/admin/users/${userId}/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            });

            const data = response.data;

            // Format dates consistently
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleString();
            };

            // Process the data based on role
            const processedData = {
                // Common fields
                userId: data.userId,
                role: data.role,
                lastActive: formatDate(data.lastActive),
                createdAt: formatDate(data.createdAt),
                skills: data.skills || [],

                // Student-specific
                coursesEnrolled: data.coursesEnrolled ?? 0,
                jobsApplied: data.jobsApplied ?? 0,
                jobsRejected: data.jobsRejected ?? 0,
                jobsInterviewed: data.jobsInterviewed ?? 0,
                rejectionRate: data.jobsApplied ?
                    Math.round((data.jobsRejected / data.jobsApplied) * 100) : 0,

                // Recruiter-specific
                jobsPosted: data.jobsPosted ?? 0,
                totalApplications: data.totalApplications ?? 0,
                rejected: data.rejected ?? 0,
                interviewsScheduled: data.interviewsScheduled ?? 0,
                recruiterRejectionRate: data.totalApplications ?
                    Math.round((data.rejected / data.totalApplications) * 100) : 0,

                // Admin-specific
                actionsTaken: data.actionsTaken ?? 0,
                usersManaged: data.usersManaged ?? 0
            };

            setUserAnalytics(processedData);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.response?.data?.message || 'Failed to load analytics data');
            setUserAnalytics(null);
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    const fetchJobDetails = async (jobId) => {
        try {
            setDetailsLoading(true);
            setError(null);
            setJobDetails(null);

            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/jobs/${jobId}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });

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

    const handleViewUserDetails = (user) => {
        setSelectedJob(null);
        setJobDetails(null);
        setSelectedUser(user);
        fetchUserAnalytics(user._id);
    };

    const handleViewJobDetails = (job) => {
        setSelectedUser(null);
        setUserAnalytics(null);
        setSelectedJob(job);
        fetchJobDetails(job._id);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setSelectedJob(null);
        setUserAnalytics(null);
        setJobDetails(null);
        setError(null);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter(user => user._id !== userId));
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('Error deleting user');
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/admin/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: newRole } : user
            ));

            alert('Role updated successfully!');
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err.response?.data?.msg || 'Failed to update role.');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setJobs(jobs.filter(job => job._id !== jobId));
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('Error deleting job');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Filter users based on active tab and search query
    const filteredUsers = users.filter(user => {
        const matchesRole = activeUserTab === 'all' || user.role === activeUserTab;
        const matchesSearch = searchQuery === '' ||
            (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRole && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Loading Admin Dashboard</h2>
                    <p className="text-gray-300">Fetching system data...</p>
                </div>
            </div>
        );
    }

    if (error && !selectedUser && !selectedJob) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={fetchAdminData}
                        className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Modal for both User and Job Details */}
            {(selectedJob || selectedUser) && (
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
                        ) : selectedUser ? (
                            <>
                                {/* User Header */}
                                <div className="border-b border-white/10 pb-6 mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedUser.name || 'No Name'}</h2>
                                            <p className="text-gray-400">{selectedUser.email || 'No Email'}</p>
                                            <div className="flex items-center mt-2 space-x-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedUser.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                                                    selectedUser.role === 'recruiter' ? 'bg-blue-500/20 text-blue-300' :
                                                        'bg-green-500/20 text-green-300'
                                                    }`}>
                                                    {selectedUser.role?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                                <button 
                                                    onClick={() => handleDeleteUser(selectedUser._id)}
                                                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded-full transition-colors"
                                                >
                                                    Delete User
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics Section */}
                                <div className="space-y-6">
                                    {/* Common Analytics for all roles */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                            <h3 className="font-medium text-cyan-400 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Activity
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">Last Active</p>
                                                    <p className="text-sm text-white">{userAnalytics?.lastActive || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Account Created</p>
                                                    <p className="text-sm text-white">{userAnalytics?.createdAt || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                            <h3 className="font-medium text-purple-400 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {userAnalytics?.skills?.length > 0 ? (
                                                    userAnalytics.skills.map((skill, index) => (
                                                        <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No skills listed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role-Specific Analytics */}
                                    {selectedUser.role === 'student' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-emerald-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    Courses
                                                </h3>
                                                <div className="flex items-end space-x-2">
                                                    <p className="text-3xl font-bold text-white">{userAnalytics?.coursesEnrolled ?? 0}</p>
                                                    <p className="text-xs text-gray-400 mb-1">Courses enrolled</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-blue-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                    </svg>
                                                    Job Applications
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Applied</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.jobsApplied ?? 0}</p>
                                                    </div>
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Interviews</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.jobsInterviewed ?? 0}</p>
                                                    </div>
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Rejected</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.jobsRejected ?? 0}</p>
                                                    </div>
                                                </div>
                                                {userAnalytics?.jobsApplied > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-gray-400">Rejection Rate</span>
                                                            <span className="text-white">{userAnalytics.rejectionRate}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-red-500 h-2 rounded-full"
                                                                style={{ width: `${userAnalytics.rejectionRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedUser.role === 'recruiter' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-blue-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                    </svg>
                                                    Jobs Posted
                                                </h3>
                                                <div className="flex items-end space-x-2">
                                                    <p className="text-3xl font-bold text-white">{userAnalytics?.jobsPosted ?? 0}</p>
                                                    <p className="text-xs text-gray-400 mb-1">Total jobs posted</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-emerald-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Applications
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Total</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.totalApplications ?? 0}</p>
                                                    </div>
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Interviews</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.interviewsScheduled ?? 0}</p>
                                                    </div>
                                                    <div className="bg-slate-600/30 p-2 rounded">
                                                        <p className="text-xs text-gray-400">Rejected</p>
                                                        <p className="text-xl font-bold text-white">{userAnalytics?.rejected ?? 0}</p>
                                                    </div>
                                                </div>
                                                {userAnalytics?.totalApplications > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-gray-400">Rejection Rate</span>
                                                            <span className="text-white">{userAnalytics.recruiterRejectionRate}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-red-500 h-2 rounded-full"
                                                                style={{ width: `${userAnalytics.recruiterRejectionRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedUser.role === 'admin' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-purple-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Actions
                                                </h3>
                                                <div className="flex items-end space-x-2">
                                                    <p className="text-3xl font-bold text-white">{userAnalytics?.actionsTaken ?? 0}</p>
                                                    <p className="text-xs text-gray-400 mb-1">Total actions taken</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                                <h3 className="font-medium text-blue-400 mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    Users Managed
                                                </h3>
                                                <div className="flex items-end space-x-2">
                                                    <p className="text-3xl font-bold text-white">{userAnalytics?.usersManaged ?? 0}</p>
                                                    <p className="text-xs text-gray-400 mb-1">Users affected by actions</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Role Change Section */}
                                    <div className="bg-slate-700/50 p-4 rounded-xl border border-white/10">
                                        <h3 className="font-medium text-amber-400 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                            Change User Role
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <select
                                                value={selectedUser.role}
                                                onChange={(e) => handleChangeUserRole(selectedUser._id, e.target.value)}
                                                className="bg-slate-800/50 border border-white/20 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
                                            >
                                                <option value="student">Student</option>
                                                <option value="recruiter">Recruiter</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <span className="text-xs text-gray-400">Changes take effect immediately</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedJob ? (
                            // Job Details Content
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
                                        <button
                                            onClick={() => handleDeleteJob(selectedJob._id)}
                                            className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            Delete Job
                                        </button>
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
                        ) : null}
                    </div>
                </div>
            )}

            {/* Main Dashboard Content */}
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-300 text-lg">System Management & Analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex items-center space-x-2 text-gray-300">
                            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">System Online</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(metrics).map(([key, value], index) => {
                        const colors = [
                            'from-emerald-500 to-teal-500',
                            'from-blue-500 to-cyan-500',
                            'from-purple-500 to-pink-500',
                            'from-orange-500 to-red-500'
                        ];
                        const icons = [
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />,
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        ];

                        return (
                            <div key={key} className="group bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`h-12 w-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {icons[index % icons.length]}
                                        </svg>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-white">{value}</p>
                                        <div className="h-1 w-16 bg-gradient-to-r from-transparent to-emerald-400 rounded-full ml-auto mt-1"></div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-300 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                {/* Users Management Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-white">Users Management</h2>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="bg-slate-800/50 border border-white/20 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-64"
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
                                    onClick={() => setActiveUserTab('all')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeUserTab === 'all'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveUserTab('student')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeUserTab === 'student'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    Students
                                </button>
                                <button
                                    onClick={() => setActiveUserTab('recruiter')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeUserTab === 'recruiter'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    Recruiters
                                </button>
                                <button
                                    onClick={() => setActiveUserTab('admin')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${activeUserTab === 'admin'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    Admins
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-gray-100">
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Role</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors duration-200 group">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="text-white font-medium">{user.name || 'No Name'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-300">{user.email || 'No Email'}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                    user.role === 'recruiter' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                        'bg-green-500/20 text-green-300 border border-green-500/30'
                                                    }`}>
                                                    {user.role || 'unknown'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUserDetails(user)}
                                                        className="group/btn bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-2 rounded-lg text-xs font-medium border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="h-3 w-3 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>Details</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="group/btn bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg text-xs font-medium border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="h-3 w-3 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        <span>Delete</span>
                                                    </button>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleChangeUserRole(user._id, e.target.value)}
                                                        className="bg-slate-800/50 border border-white/20 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="recruiter">Recruiter</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            No users found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Jobs Management Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Jobs Management</h2>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-500/30 shadow-sm">
                            <span className="text-purple-300 font-semibold">{jobs.length} Active Jobs</span>
                        </div>
                    </div>

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
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/5 divide-y divide-white/10">
                                {jobs.map((job) => (
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
                                                    <div className="text-xs text-gray-400">{job.company || 'No company'}</div>
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
                                                        {job.postedBy?.name?.charAt(0)?.toUpperCase() || 'R'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white">{job.postedBy?.name || job.recruiterName || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-400">{job.postedBy?.email || ''}</div>
                                                </div>
                                            </div>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;