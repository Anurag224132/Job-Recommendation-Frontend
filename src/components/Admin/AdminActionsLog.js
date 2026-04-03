// src/components/admin/AdminActionsLog.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminActionsLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/actions-log`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setLogs(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching action logs:', err);
            setError(err.response?.data?.message || 'Failed to load action logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Admin Actions Log
                </h2>
                <button 
                    onClick={fetchLogs}
                    className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg transition-colors flex items-center"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-center py-4">{error}</div>
            ) : logs.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No actions logged yet</div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {logs.map((log, index) => (
                        <div key={index} className="bg-slate-700/50 p-3 rounded-lg border border-white/10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-2">
                                    <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${log.actionType === 'delete' ? 'bg-red-500' : log.actionType === 'create' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-white">{log.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Action: <span className="capitalize">{log.actionType}</span> • 
                                            Target: <span className="capitalize">{log.targetType}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {formatDate(log.timestamp)}
                                </span>
                            </div>
                            {log.details && (
                                <p className="text-xs text-gray-400 mt-2 pl-4 italic">"{log.details}"</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminActionsLog;