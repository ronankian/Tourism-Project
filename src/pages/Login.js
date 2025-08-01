import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(''); // Clear previous errors

    try {
      console.log('Form submitted with email:', formData.email);
      console.log('Form submitted with password length:', formData.password?.length);
      
      const result = await login(formData.email, formData.password, false); // Pass false to disable toast
      console.log('Login result:', result);
      
      if (result.success) {
        // Check if email is verified
        const currentUser = auth.currentUser;
        if (currentUser && !currentUser.emailVerified) {
          setLoginError('Please verify your email before logging in.');
          navigate('/verification', { state: { email: formData.email } });
          return;
        }
        navigate('/dashboard');
      } else {
        setLoginError(result.error || 'Login failed. Please try again.');
        console.log('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error caught in form:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none !important;
          }
          input[type="password"]::-webkit-contacts-auto-fill-button,
          input[type="password"]::-webkit-credentials-auto-fill-button {
            display: none !important;
          }
        `}
      </style>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Blurred Background Image (pre-blurred) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/casa-blur.webp)',
          transform: 'scale(1.1)',
          zIndex: 0
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

      {/* Site Logo - Responsive positioning */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 md:top-6 md:left-6 md:transform-none">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg md:text-xl">🏛️</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-white whitespace-nowrap">Rosario Tourism</h1>
            <p className="text-xs text-gray-200 whitespace-nowrap">Cavite, Philippines</p>
          </div>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Form Box with Shadow */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Log In
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <label 
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.email || focusedField === 'email'
                      ? '-top-2 bg-white px-2 text-sm font-medium'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                  } ${
                    focusedField === 'email' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Email address
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  style={{ 
                    WebkitTextSecurity: showPassword ? 'none' : 'disc',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    msClear: 'none'
                  }}
                />
                <label 
                  htmlFor="password" 
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.password || focusedField === 'password'
                      ? '-top-2 bg-white px-2 text-sm font-medium'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                  } ${
                    focusedField === 'password' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">{loginError}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'LOG IN'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <div>
                <Link to="/reset-password" className="text-blue-600 hover:text-blue-500 font-medium">
                  Forgot Password?
                </Link>
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default Login; 