// src/components/job/JobDetails.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
const JobDetails = ({ jobId, onClose }) => {
    const { currentUser } = useAuth();
    const [job, setJob] = useState(null);
    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle dragging
    const handleMouseDown = (e) => {
        if (e.target === modalRef.current || e.target.closest('.draggable-area')) {
            setDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        if (dragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Boundary checks
            const modalWidth = modalRef.current.offsetWidth;
            const modalHeight = modalRef.current.offsetHeight;
            const maxX = window.innerWidth - modalWidth;
            const maxY = window.innerHeight - modalHeight;

            setPosition({
                x: Math.min(Math.max(newX, -modalWidth + 100), maxX - 100),
                y: Math.min(Math.max(newY, -modalHeight + 100), maxY - 100)
            });
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragging, dragStart]);

    // Fetch job and application data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch job details
                const jobRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs/${jobId}`);
                setJob(jobRes.data.data);

                // Fetch application if user is logged in
                if (currentUser) {
                    try {
                        console.log('Checking application for jobId:', jobId);
                        const appRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications/check`, {
                            params: { jobId },
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (appRes.data.data) {
                            setApplication(appRes.data.data);
                        }
                    } catch (appErr) {
                        // No application found is not an error
                        console.log('No application found:', appErr.message);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [jobId, currentUser]);

    const handleApply = async () => {
        try {
            const token = localStorage.getItem('token');

            // First calculate fit score
            const fitRes = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/applications/calculate-fit`, {
                resumeSkills: currentUser.skills || [],
                jobId: jobId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Then submit application
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/applications`,
                {
                    jobId: jobId,
                    fitScore: fitRes.data.score
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.data && res.data.application) {
                setApplication(res.data.application);
                alert('Application submitted successfully!');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Application error:', err);
            const errorMsg = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to submit application';
            alert(errorMsg);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
                    <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-4">
                        {error}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Job not found state
    if (!job) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
                    <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-xl mb-4">
                        Job not found
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex justify-center items-start overflow-y-auto py-10 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onMouseDown={handleMouseDown}
        >
            <div
                ref={modalRef}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-4xl relative shadow-2xl"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    cursor: dragging ? 'grabbing' : 'default'
                }}
            >
                {/* Draggable header area */}
                <div
                    className="draggable-area absolute top-0 left-0 right-0 h-12 cursor-move"
                ></div>

                {/* Header with title and close button */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">{job.title}</h2>
                        <div className="flex items-center mt-2 space-x-2">
                            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                                {job.company || job.companyName || 'Unknown Company'}
                            </span>
                            {job.remote && (
                                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                                    Remote
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors z-10"
                        aria-label="Close"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content area */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">

                    {/* Job Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Location</div>
                            <div className="text-white flex items-center mt-1">
                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location || 'Not specified'}

                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Salary</div>
                            <div className="text-white flex items-center mt-1">
                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.salary ? `$${job.salary}` : 'Not specified'}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Job Type</div>
                            <div className="text-white capitalize">
                                {/* console.log(job); */}
                                {job.type?.toLowerCase() || 'Not specified'}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Experience Level</div>
                            <div className="text-white capitalize">
                                {job.experience?.toLowerCase() || 'Not specified'}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Posted On</div>
                            <div className="text-white">
                                {new Date(job.createdAt || job.postedDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-sm">Posted By</div>
                            <div className="text-white">
                                {job.recruiter?.name || job.recruiterName || 'Recruiter'}
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Job Description</h3>
                        <div className="bg-slate-800/50 p-6 rounded-xl text-slate-200 whitespace-pre-line">
                            {job.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Required Skills */}
                    {job.requiredSkills?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-slate-800 text-emerald-300 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Application Status */}
                    {application && (
                        <div className={`p-6 rounded-2xl mb-8 ${application.status === 'accepted'
                            ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-700/50'
                            : application.status === 'rejected'
                                ? 'bg-gradient-to-r from-rose-900/50 to-red-900/50 border border-rose-700/50'
                                : 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-700/50'
                            }`}
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">
                                {application.status === 'accepted'
                                    ? '🎉 Congratulations! Your application was accepted!'
                                    : application.status === 'rejected'
                                        ? 'Application Status'
                                        : 'Application Pending'}
                            </h3>

                            {application.status === 'accepted' && (
                                <div className="space-y-4">
                                    {application.interviewDetails && (
                                        <div className="bg-black/30 p-4 rounded-xl">
                                            <h4 className="font-medium text-emerald-300 mb-2">Interview Details</h4>
                                            <div className="text-white whitespace-pre-line">
                                                {application.interviewDetails}
                                            </div>
                                        </div>
                                    )}
                                    {application.interviewLink && (
                                        <a
                                            href={application.interviewLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Join Interview
                                        </a>
                                    )}
                                </div>
                            )}

                            {application.status === 'rejected' && (
                                <div className="bg-black/30 p-4 rounded-xl">
                                    <h4 className="font-medium text-rose-300 mb-2">Feedback</h4>
                                    <div className="text-slate-200 whitespace-pre-line">
                                        {application.notes || 'No additional feedback provided.'}
                                    </div>
                                </div>
                            )}

                            {application.status === 'pending' && (
                                <div className="text-amber-300">
                                    Your application is under review. The recruiter will contact you soon.
                                </div>
                            )}

                            <div className="mt-4 text-sm text-slate-400">
                                Applied on: {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    {/* Apply Button - Only shows when no application exists or application was rejected */}
                    {currentUser && !application && (
                        <button
                            onClick={handleApply}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity mb-4"
                        >
                            Apply for this Position
                        </button>
                    )}

                    {currentUser && application?.status === 'rejected' && (
                        <button
                            onClick={handleApply}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity mb-4"
                        >
                            Re-apply for this Position
                        </button>
                    )}

                    {!currentUser && (
                        <div className="text-center py-4 text-slate-400">
                            Please sign in to apply for this position
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetails;