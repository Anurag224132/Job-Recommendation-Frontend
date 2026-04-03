
// import { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; // if you store token here

// const PostJob = () => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [skills, setSkills] = useState('');
//   const [message, setMessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { token } = useAuth() || {}; // ensure you are storing token here

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setIsSubmitting(true);
//     console.log('Token:', token);

//     try {
//       axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/jobs`,
//         {
//           title,
//           description,
//           requiredSkills: skills.split(',').map(skill => skill.trim()),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // ✅ send token for auth
//           },
//         }
//       );
//       setMessage('✅ Job posted successfully!');
//       setTitle('');
//       setDescription('');
//       setSkills('');
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       setMessage('❌ Failed to post job. Please ensure you are logged in as recruiter.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
//         <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
//       </div>

//       <div className="relative z-10 max-w-4xl mx-auto">
//         {/* Header Section */}
//         <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl mb-8">
//           <div className="flex items-center space-x-4">
//             <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
//               <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//                 Post a New Job
//               </h2>
//               <p className="text-gray-300 text-lg">Create an opportunity and find your next great hire</p>
//             </div>
//           </div>
//         </div>

//         {/* Message Display */}
//         {message && (
//           <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-xl shadow-xl ${message.startsWith('✅')
//               ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
//               : 'bg-red-500/20 border-red-500/30 text-red-300'
//             }`}>
//             <div className="flex items-center space-x-3">
//               <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${message.startsWith('✅')
//                   ? 'bg-emerald-500/30'
//                   : 'bg-red-500/30'
//                 }`}>
//                 {message.startsWith('✅') ? (
//                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                   </svg>
//                 ) : (
//                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 )}
//               </div>
//               <p className="font-semibold text-lg">{message}</p>
//             </div>
//           </div>
//         )}

//         {/* Main Form */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Job Title */}
//             <div className="space-y-3">
//               <label className="flex items-center space-x-2 text-white font-semibold text-lg">
//                 <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <span>Job Title</span>
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g. Senior Frontend Developer"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
//                 required
//               />
//             </div>

//             {/* Job Description */}
//             <div className="space-y-3">
//               <label className="flex items-center space-x-2 text-white font-semibold text-lg">
//                 <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
//                 </svg>
//                 <span>Job Description</span>
//               </label>
//               <textarea
//                 placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 rows="6"
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm resize-none"
//                 required
//               />
//             </div>

//             {/* Required Skills */}
//             <div className="space-y-3">
//               <label className="flex items-center space-x-2 text-white font-semibold text-lg">
//                 <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//                 <span>Required Skills</span>
//               </label>
//               <input
//                 type="text"
//                 placeholder="React, Node.js, TypeScript, MongoDB (comma separated)"
//                 value={skills}
//                 onChange={(e) => setSkills(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
//                 required
//               />
//               <p className="text-gray-400 text-sm flex items-center space-x-1">
//                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <span>Separate each skill with a comma</span>
//               </p>
//             </div>

//             {/* Skills Preview */}
//             {skills && (
//               <div className="space-y-3">
//                 <label className="text-white font-semibold text-lg">Skills Preview:</label>
//                 <div className="flex flex-wrap gap-2">
//                   {skills.split(',').map((skill, idx) => (
//                     skill.trim() && (
//                       <span
//                         key={idx}
//                         className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/30"
//                       >
//                         {skill.trim()}
//                       </span>
//                     )
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="group w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-emerald-500/25 disabled:shadow-none flex items-center justify-center space-x-3"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                     <span>Posting Job...</span>
//                   </>
//                 ) : (
//                   <>
//                     <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                     <span>Post Job Opportunity</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           {/* Help Section */}
//           <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
//             <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
//               <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//               </svg>
//               <span>Tips for a Great Job Post</span>
//             </h3>
//             <ul className="text-gray-300 space-y-2">
//               <li className="flex items-start space-x-2">
//                 <span className="text-emerald-400 mt-1">•</span>
//                 <span>Write a clear, specific job title that candidates will search for</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="text-emerald-400 mt-1">•</span>
//                 <span>Include key responsibilities, requirements, and company culture</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="text-emerald-400 mt-1">•</span>
//                 <span>List the most important skills first in your requirements</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PostJob;