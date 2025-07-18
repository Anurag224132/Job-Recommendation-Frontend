// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ManageJobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const fetchJobs = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs/myjobs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setJobs(res.data);
//     } catch (err) {
//       console.error('Error fetching jobs:', err.response?.data || err.message);
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         setError('Session expired or unauthorized. Redirecting to login...');
//         setTimeout(() => navigate('/login'), 2000);
//       } else {
//         setError('Failed to fetch jobs. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//     // eslint-disable-next-line
//   }, []);

//   const handleDelete = async (jobId) => {
//     if (!window.confirm('Are you sure you want to delete this job?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/jobs/${jobId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setJobs(jobs.filter((job) => job._id !== jobId));
//     } catch (err) {
//       console.error('Error deleting job:', err);
//       alert('Failed to delete job. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
//         <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
//       </div>

//       <div className="relative z-10 max-w-6xl mx-auto space-y-8">
//         {/* Header Section */}
//         <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
//           <div className="flex items-center space-x-4">
//             <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
//               <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//                 Your Posted Jobs
//               </h2>
//               <p className="text-gray-300 text-lg">Manage and track your job postings</p>
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent mx-auto mb-6"></div>
//             <h3 className="text-2xl font-bold text-white mb-2">Loading Your Jobs</h3>
//             <p className="text-gray-300">Fetching your posted positions...</p>
//             <div className="mt-6 w-64 bg-gray-700 rounded-full h-2 mx-auto">
//               <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
//             </div>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl">
//             <div className="flex items-center space-x-4">
//               <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-red-300 mb-1">Error Loading Jobs</h3>
//                 <p className="text-red-200">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && jobs.length === 0 && (
//           <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl text-center">
//             <div className="h-24 w-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-50">
//               <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//             <h3 className="text-2xl font-bold text-white mb-4">No Jobs Posted Yet</h3>
//             <p className="text-gray-300 text-lg mb-8">
//               Ready to find your next great hire? Start by posting your first job!
//             </p>
//             <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-6">
//               <p className="text-emerald-300 font-medium">
//                 💡 Use the 'Post New Job' tab to create your first job posting
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Jobs List */}
//         {!loading && jobs.length > 0 && (
//           <div className="space-y-6">
//             {/* Jobs Counter */}
//             <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl">
//               <div className="flex items-center justify-center space-x-2">
//                 <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//                 </svg>
//                 <span className="text-emerald-300 font-semibold">
//                   {jobs.length} Active Job{jobs.length !== 1 ? 's' : ''} Posted
//                 </span>
//               </div>
//             </div>

//             {/* Jobs Grid */}
//             <div className="grid gap-6">
//               {jobs.map((job, index) => (
//                 <div
//                   key={job._id}
//                   className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] transition-all duration-300"
//                 >
//                   <div className="flex flex-col lg:flex-row justify-between gap-6">
//                     {/* Job Content */}
//                     <div className="flex-1 space-y-4">
//                       {/* Job Header */}
//                       <div className="flex items-start space-x-4">
//                         <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
//                           <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
//                           </svg>
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">
//                             {job.title}
//                           </h3>
//                           <div className="flex items-center space-x-2 text-gray-400 text-sm">
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <span>Posted {index + 1} day{index !== 0 ? 's' : ''} ago</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Job Description */}
//                       <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
//                         <p className="text-gray-300 leading-relaxed">{job.description}</p>
//                       </div>

//                       {/* Skills Tags */}
//                       {job.requiredSkills && job.requiredSkills.length > 0 && (
//                         <div className="space-y-2">
//                           <div className="flex items-center space-x-2">
//                             <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                             </svg>
//                             <span className="text-emerald-400 font-medium text-sm">Required Skills:</span>
//                           </div>
//                           <div className="flex flex-wrap gap-2">
//                             {job.requiredSkills.map((skill, idx) => (
//                               <span
//                                 key={idx}
//                                 className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/30 hover:scale-105 transition-transform duration-200"
//                               >
//                                 {skill}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Action Button */}
//                     <div className="flex lg:flex-col justify-end lg:justify-start items-end lg:items-center space-y-4">
//                       <button
//                         onClick={() => handleDelete(job._id)}
//                         className="group/btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2"
//                       >
//                         <svg className="h-4 w-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                         <span>Delete Job</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManageJobs;