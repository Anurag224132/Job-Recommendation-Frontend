
// src/pages/Dashboard.js
import StudentDashboard from './StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full mx-4">
          {/* Animated Logo */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-8 shadow-2xl animate-bounce">
            <svg className="h-10 w-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Loading Dashboard
          </h2>
          <p className="text-gray-300 mb-8">Preparing your personalized experience...</p>

          {/* Loading Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-3 rounded-full animate-pulse shadow-lg" style={{ width: '75%' }}></div>
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'student') {
    return <StudentDashboard />;
  } else if (currentUser.role === 'recruiter') {
    return <RecruiterDashboard />;
  } else if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Error Content */}
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-red-500/30 shadow-2xl max-w-md w-full mx-4">
          {/* Error Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Error Text */}
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-red-300 mb-8 text-lg">
            Unauthorized: Invalid role detected
          </p>

          {/* Error Details */}
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-red-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Please contact your administrator</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;