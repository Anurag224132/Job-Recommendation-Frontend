import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    navigate('/');
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // Set a new timer for 1 hour (3600000 milliseconds)
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, 3600000); 
  }, [logout]);

  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    if (currentUser) {
      resetInactivityTimer();
      activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });
    }

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [currentUser, resetInactivityTimer]);

  const verifyToken = useCallback(async () => {
    const tokenInStorage = localStorage.getItem('token');
    if (!tokenInStorage) {
      setLoading(false);
      setInitialCheckComplete(true);
      return;
    }

    try {
      const res = await api.get('/api/auth/user');
      if (res.data && (res.data.id || res.data._id)) {
        setCurrentUser(res.data);
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Session expired or invalid:', error.message);
      logout();
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  }, [logout]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
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