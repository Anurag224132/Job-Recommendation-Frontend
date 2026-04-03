import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/register', { name, email, password, role });
      if (response.data.nextStep === 'verify-otp') {
        setStep('verify');
      } else {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp, name, password, role });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Registration successful! You are now logged in.');
        navigate(`/${role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.errors?.[0]?.msg ||
        'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email });
      alert('OTP resent to your email.');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.errors?.[0]?.msg ||
        'Could not resend OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === 'register' ? 'Join Our Platform' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-gray-600 font-medium">
            {step === 'register' ? 'Create your account and get started' : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {step === 'register' ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white" placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white" placeholder="Enter your email address" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700">I am a...</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white">
                  <option value="student">🎓 Student</option>
                  <option value="recruiter">💼 Recruiter</option>
                  <option value="admin">⚡ Admin</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className={`w-full p-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Sending OTP...' : 'Create Account'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-500 mt-2 font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">Verification Code</label>
                <input id="otp" type="text" required value={otp} maxLength={6} inputMode="numeric"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white" placeholder="Enter 6-digit OTP" />
                <p className="text-sm text-gray-500 mt-1">Check your email for the verification code</p>
                <button type="button" onClick={handleResendOtp} disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-500 mt-2">
                  Resend OTP
                </button>
              </div>
              <button type="submit" disabled={loading} className={`w-full p-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setStep('register')} className="text-blue-600 hover:text-blue-500 mt-2">Go back</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;