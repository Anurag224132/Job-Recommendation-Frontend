import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/routes/PrivateRoute';

// Lazy load components for code splitting
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const HomePage = lazy(() => import('./pages/HomePage'));
const RecentJobsPage = lazy(() => import('./components/student/RecentJobsPage'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoadingFallback />;
  }

  if (currentUser.role === 'recruiter' || currentUser.role === 'RECRUITER') {
    return <RecruiterDashboard />;
  } else if (currentUser.role === 'admin' || currentUser.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (currentUser.role === 'student' || currentUser.role === 'STUDENT') {
    return <StudentDashboard />;
  } else {
    return (
      <div className="text-center mt-10 text-red-600">
        Unauthorized: Unknown user role ({currentUser.role}).
      </div>
    );
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
