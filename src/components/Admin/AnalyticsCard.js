// src/components/Admin/AnalyticsCard.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AnalyticsCard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    metrics: {},
    userActivity: [],
    roleDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/analyticsCard`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { range: timeRange }
        }
      );

      console.log(response.data.userActivity);

      // Transform the backend data into our expected format
      const transformedData = {
        metrics: {
          totalUsers: response.data.totalUsers || 0,
          activeJobs: response.data.activeJobs || 0,
          totalApplications: response.data.totalApplications || 0,
          totalCourses: response.data.totalCourses || 0
        },
        userActivity: response.data.userActivity || generateEmptyWeekData(),
        roleDistribution: [
          { name: 'Students', value: response.data.studentCount || 0 },
          { name: 'Recruiters', value: response.data.recruiterCount || 0 },
          { name: 'Admins', value: response.data.adminCount || 0 }
        ]
      };
      
      setAnalyticsData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
      // Set empty data structure on error
      setAnalyticsData({
        metrics: {
          totalUsers: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalCourses: 0
        },
        userActivity: generateEmptyWeekData(),
        roleDistribution: [
          { name: 'Students', value: 0 },
          { name: 'Recruiters', value: 0 },
          { name: 'Admins', value: 0 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Helper function to generate empty week data
  const generateEmptyWeekData = () => {
    return [
      { name: 'Mon', active: 0 },
      { name: 'Tue', active: 0 },
      { name: 'Wed', active: 0 },
      { name: 'Thu', active: 0 },
      { name: 'Fri', active: 0 },
      { name: 'Sat', active: 0 },
      { name: 'Sun', active: 0 }
    ];
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Configuration for metric cards
  const metricConfig = {
    totalUsers: {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      ),
      gradient: 'from-emerald-500 to-teal-500',
      label: 'Total Users'
    },
    activeJobs: {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
        />
      ),
      gradient: 'from-blue-500 to-cyan-500',
      label: 'Active Jobs'
    },
    totalApplications: {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      gradient: 'from-purple-500 to-pink-500',
      label: 'Applications'
    },
    totalCourses: {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
      gradient: 'from-orange-500 to-red-500',
      label: 'Courses'
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#6366F1'];

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">System Analytics</h2>
        </div>
        
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === 'week' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-slate-700/50'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === 'month' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-slate-700/50'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === 'year' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-slate-700/50'}`}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchAnalyticsData}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analyticsData.metrics).map(([key, value]) => (
              <div key={key} className="group bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 bg-gradient-to-br ${metricConfig[key]?.gradient || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {metricConfig[key]?.icon || (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      )}
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <div className="h-1 w-16 bg-gradient-to-r from-transparent to-emerald-400 rounded-full ml-auto mt-1"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-300">
                  {metricConfig[key]?.label || key.replace(/([A-Z])/g, ' $1')}
                </h3>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                User Activity ({timeRange})
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#D1D5DB' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#D1D5DB' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        borderColor: '#374151',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#E5E7EB' }}
                      cursor={{ fill: '#374151' }}
                    />
                    <Bar 
                      dataKey="active" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                User Role Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      animationDuration={1500}
                    >
                      {analyticsData.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        borderColor: '#374151',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#E5E7EB' }}
                      formatter={(value, name, props) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;