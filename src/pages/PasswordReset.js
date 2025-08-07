import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import toast from 'react-hot-toast';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
  const { sendPasswordReset, passwordResetTimer } = useAuth();

  const handleSendReset = async () => {
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    setEmailNotFound(false); // Reset error state
    try {
      const success = await sendPasswordReset(email);
      if (success) {
        setEmailSent(true);
      } else {
        setEmailNotFound(true);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setEmailNotFound(true);
    } finally {
      setLoading(false);
    }
  };



  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  return (
    <>
      <style>
        {`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none !important;
          }
        `}
      </style>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Blurred Background Image */}
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

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            to="/login" 
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Site Logo - Right side to avoid back button overlap */}
        <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
              <img src="/images/rtc.png" alt="Casa Hacienda de Tejeros" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-white whitespace-nowrap">Casa Hacienda de Tejeros</h1>
              <p className="text-xs text-gray-200 whitespace-nowrap">Rosario, Cavite</p>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 relative z-10"
        >
          {/* Password Reset Box */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 mb-6">
                {emailSent 
                  ? "We've sent password reset instructions to your email"
                  : emailNotFound
                    ? "Email address not found in our records"
                    : "Enter your email to receive password reset instructions"
                }
              </p>
            </div>

            {emailSent ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-600">Email Sent!</h3>
                <p className="text-gray-600">
                  Please check your email and follow the instructions to reset your password.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#5d9c59] bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#df2e38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Check your email</p>
                      <p>Click the reset link in your email to create a new password.</p>
                    </div>
                  </div>
                </div>
                <CountdownTimer
                  seconds={60}
                  onStart={handleSendReset}
                  isActive={passwordResetTimer}
                  buttonText="Resend Reset Email"
                  disabledText="Resend in"
                  className="w-full"
                />
              </div>
            ) : emailNotFound ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-600">Email Not Registered</h3>
                <p className="text-gray-600">
                  The email address <strong>{email}</strong> is not registered in our system.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">No account found</p>
                      <p>Please check your email address or create a new account.</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEmailNotFound(false);
                      setEmail('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Try Different Email
                  </button>
                  <Link
                    to="/register"
                    className="flex-1 bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   
                  />
                  <label 
                    htmlFor="email"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      email || focusedField === 'email'
                        ? '-top-2 bg-white px-2 text-sm font-medium'
                        : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                    } ${
                      focusedField === 'email' ? 'text-[#df2e38]' : 'text-gray-500'
                    }`}
                  >
                    Email address
                  </label>
                </div>

                <button
                  onClick={handleSendReset}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-[#df2e38] hover:text-[#c62828]">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PasswordReset; 