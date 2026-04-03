import React from 'react';

const StudentAnalytics = ({ appliedJobs, loading, onStatusClick }) => {
  // Calculate counts from props
  const validJobs = appliedJobs.filter(app => app.job);

  const total = validJobs.length;
  const accepted = validJobs.filter(job => job.status === 'approved').length;
  const rejected = validJobs.filter(job => job.status === 'rejected').length;
  const pending = validJobs.filter(job => job.status === 'pending').length;

  // Calculate average fit score
  const avgFit = total > 0
    ? (validJobs.reduce((sum, job) => sum + (Number(job.fitScore) || 0), 0) / total).toFixed(2)
    : 0;

  // Calculate success rate
  const successRate = total > 0 ? (accepted / total) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Your Application Analytics
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            <p className="text-gray-300">Loading your application data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Applied */}
              <div
                className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center hover:from-emerald-500/20 hover:to-teal-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
                onClick={() => onStatusClick('all')}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-emerald-400 mb-2 group-hover:text-emerald-300 transition-colors duration-300">
                    {total}
                  </div>
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    Total Applied
                  </div>
                </div>
              </div>

              {/* Accepted */}
              <div
                className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 rounded-2xl text-center hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
                onClick={() => onStatusClick('approved')}

              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors duration-300">
                    {accepted}

                  </div>
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    Accepted
                  </div>
                </div>
              </div>

              {/* Rejected */}
              <div
                className="group relative bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 p-6 rounded-2xl text-center hover:from-red-500/20 hover:to-rose-500/20 hover:border-red-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
                onClick={() => onStatusClick('rejected')}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-red-400 mb-2 group-hover:text-red-300 transition-colors duration-300">
                    {rejected}
                  </div>
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    Rejected
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div
                className="group relative bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-6 rounded-2xl text-center hover:from-amber-500/20 hover:to-yellow-500/20 hover:border-amber-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
                onClick={() => onStatusClick('pending')}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-amber-400 mb-2 group-hover:text-amber-300 transition-colors duration-300">
                    {pending}
                  </div>
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    Pending
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Success Rate */}
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-300 font-medium">Success Rate</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/25"
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Average Fit Score */}
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-300 font-medium">Average Fit Score</span>
                  <span className="text-amber-400 font-bold text-lg">
                    {avgFit}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg shadow-amber-500/25"
                    style={{ width: `${avgFit}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAnalytics;