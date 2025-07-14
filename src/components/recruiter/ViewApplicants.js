import { useEffect, useState } from 'react';
import axios from '../../api';
import { useAuth } from '../../context/AuthContext';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewApplicants = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentApplication, setCurrentApplication] = useState(null);
    const [modalType, setModalType] = useState(''); // 'accept' or 'reject'
    const [interviewDate, setInterviewDate] = useState('');
    const [notes, setNotes] = useState('');
    const [emailStatus, setEmailStatus] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'interview_scheduled', 'rejected'
    const token = localStorage.getItem('token');

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications/recruiter/${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
            setFilteredApplications(res.data);
        } catch (err) {
            console.error('❌ Failed to fetch applicants:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter applications based on selected status
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredApplications(applications);
        } else {
            const filtered = applications.filter(app => app.status === statusFilter);
            setFilteredApplications(filtered);
        }
    }, [statusFilter, applications]);

    const handleDownloadResume = async (applicationId, applicantName) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications/${applicationId}/download-resume`,
                {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Extract filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2) {
                    filename = fileNameMatch[1];
                }
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('❌ Download failed:', err);
        }
    };

    const handleOpenModal = (app, type) => {
        setCurrentApplication(app);
        setModalType(type);
        setShowModal(true);
        setEmailStatus('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentApplication(null);
        setModalType('');
        setInterviewDate('');
        setNotes('');
        setEmailStatus('');
    };

    const handleStatusChange = async (appId, newStatus, notes = '') => {
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/applications/${appId}/status`,
                { status: newStatus, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setApplications(prev => prev.map(app =>
                app._id === appId ? { ...app, status: newStatus, notes } : app
            ));
        } catch (err) {
            console.error('❌ Failed to update status:', err.response?.data || err.message);
        }
    };

    const handleSendEmail = async () => {
        if (!interviewDate) {
            setEmailStatus('Please select an interview date');
            return;
        }

        setEmailStatus('Sending email...');

        try {
            // Schedule interview and send email
            const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/applications/${currentApplication._id}/schedule-interview`,
                { interviewDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state with interview details
            setApplications(prev => prev.map(app =>
                app._id === currentApplication._id ? {
                    ...app,
                    status: 'interview_scheduled',
                    interviewDate: response.data.application.interviewDate,
                    interviewLink: response.data.application.interviewLink
                } : app
            ));

            setEmailStatus('Email sent successfully!');

            // Close modal after 2 seconds
            setTimeout(() => {
                handleCloseModal();
            }, 2000);
        } catch (err) {
            console.error('❌ Failed to send email:', err);

            // Enhanced error message
            let errorMsg = 'Failed to send email';
            if (err.response) {
                errorMsg += `: ${err.response.data.error || err.response.data.msg || 'Server error'}`;
            } else if (err.request) {
                errorMsg += ': No response from server';
            } else {
                errorMsg += `: ${err.message}`;
            }

            setEmailStatus(errorMsg);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'recruiter') {
            fetchApplicants();
        }
    }, [currentUser]);

    // Get counts for each status
    const getStatusCount = (status) => {
        return applications.filter(app => app.status === status).length;
    };

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl shadow-2xl border border-slate-200/50 relative overflow-hidden">
            {/* Modal for Accept/Reject */}
            {showModal && currentApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modalType === 'accept' ? 'Schedule Interview' : 'Reject Application'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Notes for Applicant
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add personal notes for the applicant..."
                                rows={3}
                            />
                        </div>

                        {modalType === 'accept' && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Interview Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={interviewDate}
                                        onChange={(e) => setInterviewDate(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {emailStatus && (
                                    <div className={`mb-4 p-3 rounded-lg ${emailStatus.includes('success')
                                        ? 'bg-green-100 text-green-700'
                                        : emailStatus.includes('Sending')
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {emailStatus}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (modalType === 'accept') {
                                        handleSendEmail();
                                    } else {
                                        handleStatusChange(currentApplication._id, 'rejected', notes);
                                        handleCloseModal();
                                    }
                                }}
                                className={`px-4 py-2 text-white rounded-xl transition-colors ${modalType === 'accept'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                                    }`}
                            >
                                {modalType === 'accept' ? 'Send Email & Schedule' : 'Reject Application'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            View Applicants
                        </h2>
                        <p className="text-slate-600 mt-1">Review and manage job applications</p>
                    </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'all'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        All Applications
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {applications.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'pending'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                    >
                        Pending
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {getStatusCount('pending')}
                        </span>
                    </button>

                    <button
                        onClick={() => setStatusFilter('interview_scheduled')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'interview_scheduled'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        Interview Scheduled
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {getStatusCount('interview_scheduled')}
                        </span>
                    </button>

                    <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'rejected'
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                    >
                        Rejected
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {getStatusCount('rejected')}
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin">
                                <div className="w-6 h-6 bg-white rounded-full m-1"></div>
                            </div>
                            <p className="text-slate-600 font-medium">Loading applicants...</p>
                        </div>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No {statusFilter === 'all' ? '' : statusFilter.split('_').join(' ').toLowerCase() + ' '}applications
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {statusFilter === 'all'
                                ? "Applications will appear here once candidates start applying to your job postings."
                                : "No applications match this status filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Applications Count */}
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50 backdrop-blur-sm mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-md shadow-emerald-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-800 font-semibold">
                                        {filteredApplications.length} {statusFilter === 'all' ? 'Application' : statusFilter.split('_').join(' ')} {filteredApplications.length === 1 ? '' : 's'}
                                    </p>
                                    <p className="text-slate-600 text-sm">
                                        {statusFilter === 'all'
                                            ? 'Total applications received'
                                            : `Filtered from ${applications.length} total applications`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Applications List */}
                        {filteredApplications.map((app, index) => (
                            <div
                                key={app._id}
                                className="group bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 p-6 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm relative overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10">
                                    {/* Applicant Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-md shadow-blue-500/25">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
                                                    {app.user?.name || 'Applicant'}
                                                </h3>
                                                <p className="text-slate-600 text-sm">{app.user?.email || 'No email'}</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${app.status === 'approved' || app.status === 'hired'
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50' :
                                            app.status === 'rejected'
                                                ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50' :
                                                app.status === 'pending'
                                                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50'
                                                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50'
                                            }`}>
                                            {app.status === 'approved'
                                                ? 'Approved'
                                                : app.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </div>

                                        {/* Status Badge for Interview Scheduled */}
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${app.status === 'interview_scheduled' || app.status === 'hired'
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50' :
                                            app.status === 'rejected'
                                                ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50' :
                                                app.status === 'pending'
                                                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50'
                                                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50'
                                            }`}>
                                            {app.status === 'interview_scheduled' ? 'Approved' :
                                                app.status.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                        </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/30">
                                            <div className="flex items-center mb-2">
                                                <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                                                </svg>
                                                <span className="text-sm font-medium text-slate-600">Applied to</span>
                                            </div>
                                            <p className="text-slate-800 font-semibold">{app.job?.title || 'Job'}</p>
                                        </div>

                                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/30">
                                            <div className="flex items-center mb-2">
                                                <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-slate-600">Fit Score</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-2xl font-bold text-slate-800 mr-2">{app.fitScore}%</span>
                                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ${app.fitScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                            app.fitScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                                                'bg-gradient-to-r from-red-500 to-rose-500'
                                                            }`}
                                                        style={{ width: `${app.fitScore}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {app.status === 'pending' && (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => handleOpenModal(app, 'accept')}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(app, 'reject')}
                                                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleDownloadResume(app._id, app.user?.name || 'Resume')}
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v4a2 2 0 002 2h6a2 2 0 002-2v-4m-4-4V4m0 0L5 12m7-8l7 8" />
                                                </svg>
                                                Download Resume
                                            </button>
                                        </div>
                                    )}

                                    {/* Status Message for Non-Pending */}
                                    {app.status !== 'pending' && (
                                        <div className={`p-4 rounded-xl border ${app.status === 'accepted' || app.status === 'interview_scheduled' || app.status === 'hired'
                                            ? 'bg-green-50 border-green-200/50 text-green-700'
                                            : 'bg-red-50 border-red-200/50 text-red-700'
                                            }`}>
                                            <div className="flex items-center">
                                                <svg className={`w-5 h-5 mr-2 ${app.status === 'rejected' ? 'text-red-600' : 'text-green-600'
                                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {app.status === 'rejected' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    )}
                                                </svg>
                                                <span className="font-medium">
                                                    Application has been {app.status.split('_').join(' ')}
                                                    {app.status === 'interview_scheduled' && app.interviewDate && (
                                                        <span> on {new Date(app.interviewDate).toLocaleString()}</span>
                                                    )}
                                                </span>
                                            </div>
                                            {app.notes && (
                                                <div className="mt-2 p-2 bg-white/50 rounded-lg">
                                                    <p className="text-sm font-medium">Recruiter Notes:</p>
                                                    <p className="text-sm">{app.notes}</p>
                                                </div>
                                            )}
                                            {app.interviewLink && (
                                                <div className="mt-2">
                                                    <a
                                                        href={app.interviewLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Interview Link
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewApplicants;