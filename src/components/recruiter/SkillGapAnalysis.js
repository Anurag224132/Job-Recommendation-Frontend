const SkillGapAnalysis = ({ gaps, loading }) => {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl p-16 rounded-3xl border border-white/20 shadow-2xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-white font-medium">Analyzing skill gaps...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl shadow-2xl border border-slate-200/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-500/5 to-rose-500/5 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-amber-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Skill Gap Analysis
            </h2>
            <p className="text-slate-600 mt-1">Identify missing skills in your candidate pool</p>
          </div>
        </div>

        {gaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Great News!</h3>
            <p className="text-slate-500 max-w-md mx-auto">No significant skill gaps found. Your candidate pool appears to have good coverage of required skills.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gap Count Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4 rounded-2xl backdrop-blur-sm mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-md shadow-amber-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-800 font-semibold">
                    {gaps.length} Skill Gap{gaps.length > 1 ? 's' : ''} Identified
                  </p>
                  <p className="text-amber-700 text-sm">Consider focusing recruitment on these areas</p>
                </div>
              </div>
            </div>

            {/* Skills Gap List */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Missing Skills
              </h3>

              <div className="space-y-3">
                {gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl hover:from-red-100 hover:to-rose-100 hover:border-red-300/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center mr-4 shadow-md shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-200">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium group-hover:text-slate-900 transition-colors duration-200">
                        {gap}
                      </p>
                      <p className="text-red-600 text-sm mt-1">
                        High demand, low candidate availability
                      </p>
                    </div>
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-md shadow-blue-500/25 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Recommendations</h4>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Expand your recruitment channels to target these specific skills
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Consider offering training programs for existing candidates
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Partner with educational institutions or bootcamps
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;