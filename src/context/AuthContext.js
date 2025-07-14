import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const navigate = useNavigate();

  const verifyToken = useCallback(async () => {
    const tokenInStorage = localStorage.getItem('token');
    if (!tokenInStorage) {
      setLoading(false);
      setInitialCheckComplete(true);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user`,
        {
          headers: { Authorization: `Bearer ${tokenInStorage}` }
        }
      );
      
      if (res.data && (res.data._id || res.data.id)) {
        setCurrentUser(res.data);
        setToken(tokenInStorage);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    loading,
    initialCheckComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialCheckComplete ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}