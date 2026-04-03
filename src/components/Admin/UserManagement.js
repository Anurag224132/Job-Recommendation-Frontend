import { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users`);
      // Handle potential pagination or direct list
      setUsers(res.data.content || res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users/${id}`);
      setUsers(users.filter(user => (user.id || user._id) !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="font-semibold text-lg mb-2">User Management</h2>
      <div className="max-h-64 overflow-y-auto">
        {users.map(user => (
          <div key={user.id || user._id} className="flex justify-between items-center border-b py-1">
            <span>{user.name} ({user.role})</span>
            <button
              onClick={() => handleDelete(user.id || user._id)}
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

export default UserManagement;
