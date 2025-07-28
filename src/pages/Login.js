import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

    try {
      // Check if input is email or phone
      const isEmail = formData.emailOrPhone.includes('@');
      const email = isEmail ? formData.emailOrPhone : '';
      const phone = !isEmail ? formData.emailOrPhone : '';
      
      const success = await login(email, phone, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
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

      {/* Site Logo - Top Left (Desktop) / Center (Mobile) */}
      <div className="absolute top-6 left-6 z-20 md:left-6 md:top-6 left-1/2 top-6 transform -translate-x-1/2 md:transform-none">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🏛️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Rosario Tourism</h1>
            <p className="text-xs text-gray-200">Cavite, Philippines</p>
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
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  required
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  onFocus={() => handleFocus('emailOrPhone')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <label 
                  htmlFor="emailOrPhone"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.emailOrPhone || focusedField === 'emailOrPhone'
                      ? '-top-2 bg-white px-2 text-sm font-medium'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                  } ${
                    focusedField === 'emailOrPhone' ? 'text-blue-600' : 'text-gray-500'
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
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                  Forgot Password?
                </a>
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