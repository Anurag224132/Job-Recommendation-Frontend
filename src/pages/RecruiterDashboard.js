import { useState, useEffect } from 'react';
import axios from '../api';
import PostJob from '../components/recruiter/PostJob';
import ManageJobs from '../components/recruiter/ManageJobs';
import ViewApplicants from '../components/recruiter/ViewApplicants';
import RecruiterAnalytics from '../components/recruiter/RecruiterAnalytics';
import SkillGapAnalysis from '../components/recruiter/SkillGapAnalysis';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
  const [view, setView] = useState('manage');
  const { currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingSkillGaps, setLoadingSkillGaps] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch analytics data
  useEffect(() => {
    if (view === 'analytics') {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAnalyticsData(res.data);
        } catch (err) {
          console.error('Error fetching analytics:', err.response?.data || err.message);
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [view, token]);

  // Fetch skill gap data
  useEffect(() => {
    if (view === 'skillgap') {
      const fetchSkillGaps = async () => {
        setLoadingSkillGaps(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/skill-gaps`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSkillGaps(res.data.gaps || []);
        } catch (err) {
          console.error('Error fetching skill gaps:', err.response?.data || err.message);
        } finally {
          setLoadingSkillGaps(false);
        }
      };
      fetchSkillGaps();
    }
  }, [view, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dark Theme Header */}
        <div className="bg-gray-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚡ Recruiter Command Center
              </h1>
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Welcome back, {currentUser.name}</p>
                    <p className="text-cyan-300 text-sm font-medium">🎯 {currentUser.role}</p>
                  </div>
                </div>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Neon Navigation */}
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-cyan-500/30 mb-8">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {[
              { key: 'manage', label: 'Manage Jobs', icon: '💼', color: 'cyan', glow: 'shadow-cyan-500/50' },
              { key: 'post', label: 'Post New Job', icon: '🚀', color: 'emerald', glow: 'shadow-emerald-500/50' },
              { key: 'applicants', label: 'View Applicants', icon: '👥', color: 'purple', glow: 'shadow-purple-500/50' },
              { key: 'analytics', label: 'Analytics', icon: '📊', color: 'orange', glow: 'shadow-orange-500/50' },
              { key: 'skillgap', label: 'Skill Gap Analysis', icon: '🎯', color: 'pink', glow: 'shadow-pink-500/50' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center space-x-3 px-6 md:px-8 py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${view === tab.key
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-xl ${tab.glow} border border-${tab.color}-400`
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600 hover:border-gray-500'
                  }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content with Dark Theme */}
        <div className="transition-all duration-700 ease-in-out transform">
          {view === 'manage' && <ManageJobs />}
          {view === 'post' && (
            <PostJob onJobPosted={() => setView('manage')} />
          )}
          {view === 'applicants' && <ViewApplicants />}
          {view === 'analytics' && (
            <RecruiterAnalytics
              data={analyticsData}
              loading={loadingAnalytics}
            />
          )}
          {view === 'skillgap' && (
            <SkillGapAnalysis
              gaps={skillGaps}
              loading={loadingSkillGaps}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;