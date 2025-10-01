import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import RecentJobsPage from './components/student/RecentJobsPage';
import StudentApplicationsManager from './components/student/StudentApplicationsManager';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="text-center mt-10 text-gray-600">Loading dashboard...</div>;
  }

  if (currentUser.role === 'recruiter') {
    return <RecruiterDashboard />;
  } else if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  } else if (currentUser.role === 'student') {
    return <StudentDashboard />;
  } else {
    return (
      <div className="text-center mt-10 text-red-600">
        Unauthorized: Unknown user role.
      </div>
    );
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRouter />
                </PrivateRoute>
              }
            />
            <Route path="/recent-jobs" element={<RecentJobsPage />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            {/* <Route path="/student/applications/manage" element={<StudentApplicationsManager />} /> */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />


          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
