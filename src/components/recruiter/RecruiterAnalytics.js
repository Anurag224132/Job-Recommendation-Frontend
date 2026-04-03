import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RecruiterAnalytics = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                console.log("📦 Token being sent:", token);

                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recruiter/analytics`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("✅ Analytics Data Fetched:", res.data);

                setJobs(res.data.applicationsPerJob || []);
            } catch (err) {
                console.error('❌ Error fetching recruiter analytics:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading recruiter analytics...</p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-slate-700">No jobs posted yet</h3>
                <p className="text-slate-500 mt-2">
                    Start by posting your first job to see analytics and track applications.
                </p>
            </div>
        );
    }

    const totalApplications = jobs.reduce((acc, job) => acc + (job.applicationCount || 0), 0);
    const averageApplications = (totalApplications / jobs.length).toFixed(1);

    const chartData = jobs.map(job => ({
        name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
        Applications: job.applicationCount || 0,
    }));

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">📊 Recruiter Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <p className="text-sm text-emerald-600">Total Jobs Posted</p>
                    <p className="text-3xl font-bold text-emerald-700">{jobs.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Total Applications Received</p>
                    <p className="text-3xl font-bold text-blue-700">{totalApplications}</p>
                </div>
            </div>

            {totalApplications > 0 && (
                <div className="text-center mb-6">
                    <p className="text-slate-600">Average Applications per Job:</p>
                    <p className="text-xl font-semibold text-indigo-600">{averageApplications}</p>
                </div>
            )}

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 12 }} width={150} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                        }}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                    />
                    <Bar dataKey="Applications" radius={[4, 4, 0, 0]}>
                        <defs>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <Bar dataKey="Applications" fill="url(#colorApps)" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RecruiterAnalytics;
