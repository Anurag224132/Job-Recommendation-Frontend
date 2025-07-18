// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const StudentApplicationsManager = () => {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchApplications = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications/mine`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}` // Send auth token
//         }
//       });
//       console.log("res");
//       setApplications(res.data);
//     } catch (err) {
//       console.error('❌ Error fetching applications:', err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (currentUser?.role === 'student') {
//       fetchApplications();
//     }
//   }, [currentUser]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-8">
//       <div className="max-w-5xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
//               Your Applied Jobs
//             </h1>
//             <p className="text-gray-300">Track the jobs you have applied for here.</p>
//           </div>
//           <button
//             onClick={() => navigate('/student/dashboard')}
//             className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-cyan-600 transition transform hover:scale-105 active:scale-95"
//           >
//             ⬅ Back to Dashboard
//           </button>
//         </div>

//         {/* Applications List */}
//         {loading ? (
//           <div className="flex justify-center items-center py-12 space-x-3">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
//             <p className="text-gray-300">Loading your applications...</p>
//           </div>
//         ) : applications.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-5xl mb-4">📂</div>
//             <p className="text-gray-300">You have not applied for any jobs yet.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {applications.map((app) => (
//               <div
//                 key={app._id}
//                 className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:shadow-emerald-400/20 transition"
//               >
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//                   <div>
//                     <h2 className="text-2xl font-bold text-emerald-300">{app.job.title}</h2>
//                     <p className="text-gray-300">{app.job.recruiter.company}</p>
//                     <p className="text-gray-400 text-sm mt-1">
//                       Applied on: {new Date(app.appliedAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-semibold ${app.status === 'pending'
//                         ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-300/30'
//                         : app.status === 'accepted'
//                           ? 'bg-green-500/20 text-green-300 border border-green-300/30'
//                           : 'bg-red-500/20 text-red-300 border border-red-300/30'
//                         }`}
//                     >
//                       {app.status.toUpperCase()}
//                     </span>
//                     <div className="text-sm text-gray-300">
//                       <p>Recruiter: {app.job.recruiter.name}</p>
//                       <p>Email: {app.job.recruiter.email}</p>
//                       <p>Phone: {app.job.recruiter.phone}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentApplicationsManager;
