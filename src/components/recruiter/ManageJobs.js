// src/components/recruiter/ManageJobs.js
import { useEffect, useState } from 'react';
import axios from '../../api';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  // const [deletingId, setDeletingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs/myjobs`, { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this job?');
    if (!confirm) return;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobs(prevJobs => prevJobs.filter(job => job._id.toString() !== id.toString()));
      // Close modal if deleting the currently viewed job
      if (selectedJob && selectedJob._id === id) {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  useEffect(() => { fetchJobs(); }, []);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl shadow-2xl border border-slate-200/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Manage Your Jobs
            </h2>
            <p className="text-slate-600 mt-1">View and manage all your posted positions</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">Start by creating your first job posting to attract talented candidates to your organization.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                className="group bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 p-6 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm relative overflow-hidden cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => openJobDetails(job)}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    {/* Job Title */}
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-md shadow-emerald-500/25">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
                        {job.title}
                      </h3>
                    </div>

                    <div>
                      
                      <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">{job.companyName} • Posted by {job.recruiterName}</p>
                    </div>

                    {/* Job Description */}
                    <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    {/* Required Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Required Skills
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {job.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200/50 hover:from-blue-200 hover:to-blue-100 transition-all duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Job Stats */}
                    <div className="flex items-center text-sm text-slate-500 space-x-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job._id);
                      }}
                      className="group/btn bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openJobDetails(job);
                      }}
                      className="group/btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Details Modal */}
        {showModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl border border-slate-200/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 relative">
                {/* Close button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Job Title */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-md shadow-blue-500/25">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedJob.title}</h2>
                    <p className="text-slate-600 mt-1">Posted on {new Date(selectedJob.postedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Job Type */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="font-semibold text-slate-700">Job Type</h3>
                    </div>
                    <p className="text-slate-800">{selectedJob.type || 'Not specified'}</p>
                  </div>

                  {/* Experience Level */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="font-semibold text-slate-700">Experience</h3>
                    </div>
                    <p className="text-slate-800">{selectedJob.experience || 'Not specified'}</p>
                  </div>

                  {/* Location */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="font-semibold text-slate-700">Location</h3>
                    </div>
                    <p className="text-slate-800">
                      {selectedJob.location || 'Not specified'}
                      {selectedJob.remote && ' • Remote'}
                    </p>
                  </div>

                  {/* Salary */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-semibold text-slate-700">Salary</h3>
                    </div>
                    <p className="text-slate-800">{selectedJob.salary || 'Not specified'}</p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Job Description
                  </h3>
                  <div className="prose max-w-none bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200/50">
                    <p className="text-slate-700 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedJob.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className="text-slate-700 font-medium">
                      {selectedJob.isActive ? 'Active Listing' : 'Inactive Listing'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;