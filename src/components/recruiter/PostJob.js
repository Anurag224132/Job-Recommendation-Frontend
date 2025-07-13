// src/components/recruiter/PostJob.js
import { useState } from 'react';
import axios from '../../api';

const PostJob = () => {
  // Existing state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [message, setMessage] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recruiterName, setRecruiterName] = useState('');

  // New state for additional fields
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState('');
  const [experience, setExperience] = useState('');
  const [remote, setRemote] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/jobs', {
        title,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()),
        location,
        salary,
        type,
        experience,
        remote, companyName,
        recruiterName
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Job posted successfully.');
      // Reset all fields
      setTitle('');
      setDescription('');
      setRequiredSkills('');
      setLocation('');
      setSalary('');
      setType('');
      setExperience('');
      setCompanyName('');
      setRecruiterName('');
      setRemote(false);
    } catch (err) {
      setMessage('❌ Failed to post job.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl shadow-2xl border border-slate-200/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Post New Job
            </h2>
            <p className="text-slate-600 mt-1">Create a new job posting to attract top talent</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
              </svg>
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer, Marketing Manager..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              required
            />
          </div>

          {/* Job Description */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Job Description
            </label>
            <div className="relative">
              <textarea
                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50 min-h-[120px]"
                rows="5"
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {description.length}/1000
              </div>
            </div>
          </div>
          {/* Company Name */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company Name
            </label>
            <input
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              required
            />
          </div>

          {/* Recruiter Name */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Recruiter Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={recruiterName}
              onChange={e => setRecruiterName(e.target.value)}
              className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              required
            />
          </div>

          {/* Location and Remote Work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. New York, Remote, Hybrid..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              />
            </div>

            {/* Remote Work */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Work Arrangement
              </label>
              <div className="flex items-center mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remote}
                    onChange={e => setRemote(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    {remote ? 'Remote Position' : 'Office/Hybrid'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Job Type */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Job Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50 appearance-none"
              >
                <option value="">Select job type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Experience Level
              </label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50 appearance-none"
              >
                <option value="">Select experience level</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            {/* Salary */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Salary Range
              </label>
              <input
                type="text"
                placeholder="e.g. $70,000 - $90,000, Negotiable..."
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Required Skills
            </label>
            <input
              type="text"
              placeholder="JavaScript, React, Node.js, Python, SQL..."
              value={requiredSkills}
              onChange={e => setRequiredSkills(e.target.value)}
              className="w-full bg-white/80 border border-slate-300/50 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-slate-400/50"
              required
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Separate skills with commas
            </p>
          </div>

          {/* Skills Preview */}
          {requiredSkills && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Skills Preview
              </h4>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200/50"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Post Job Opening
          </button>
        </form>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-2xl border backdrop-blur-sm flex items-center gap-3 ${message.includes('✅')
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 text-green-700'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 text-red-700'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.includes('✅')
              ? 'bg-green-500/20'
              : 'bg-red-500/20'
              }`}>
              {message.includes('✅') ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold">
                {message.includes('✅') ? 'Success!' : 'Error'}
              </p>
              <p className="text-sm opacity-90">
                {message.replace('✅', '').replace('❌', '').trim()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJob;