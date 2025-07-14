import { useEffect, useState } from 'react';
import axios from 'axios';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete job?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/admin/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="font-semibold text-lg mb-2">Job Management</h2>
      <div className="max-h-64 overflow-y-auto">
        {jobs.map(job => (
          <div key={job._id} className="flex justify-between items-center border-b py-1">
            <span>{job.title}</span>
            <button
              onClick={() => handleDelete(job._id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManagement;
