import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileSection = () => {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState(currentUser?.skills || []);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = () => {
    alert('Profile updated successfully!');
    setEditing(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
      >
        <span className="text-white font-bold text-xl">
          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Background dim */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Profile Popup */}
          <div className="fixed bottom-24 right-6 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-700/50 text-white backdrop-blur-lg w-[90%] max-w-md z-50 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Your Profile
              </h2>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-800/60 rounded-xl flex items-center gap-3">
                <span className="text-slate-400 text-sm">Name:</span>
                <span className="text-white font-semibold">{currentUser?.name}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl flex items-center gap-3">
                <span className="text-slate-400 text-sm">Email:</span>
                <span className="text-white font-semibold">{currentUser?.email}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl flex items-center gap-3">
                <span className="text-slate-400 text-sm">Role:</span>
                <span className="text-white font-semibold capitalize">{currentUser?.role}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-emerald-400">Skills & Expertise</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      {editing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No skills added yet.</p>
              )}
            </div>

            {/* Add Skill */}
            {editing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 rounded-xl px-3 py-2 bg-slate-700 text-white placeholder-slate-400 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button
                  onClick={handleAddSkill}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-xl text-white font-semibold hover:scale-105 transition"
                >
                  Add
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              className={`w-full py-3 rounded-xl font-semibold transition ${editing
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                }`}
            >
              {editing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSection;
