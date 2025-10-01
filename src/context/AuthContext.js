import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
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
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    // Clear the timer on explicit logout
    if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
    }
    navigate('/');
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    // Clear the previous timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // Set a new timer for 1 hour (3600000 milliseconds)
    inactivityTimer.current = setTimeout(() => {
      // alert("You have been logged out due to inactivity."); // Optional: alert the user
      logout();
    }, 3600000); 
  }, [logout]);

  useEffect(() => {
    // List of events that indicate user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // If a user is logged in, start the inactivity timer
    if (currentUser) {
      resetInactivityTimer();
      activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });
    }

    // Cleanup function to remove event listeners and clear the timer
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
      logout(); // Use the unified logout function
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