import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Verification = () => {
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { resendEmailVerification, checkEmailVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  const contactType = 'email';

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    // Store email for persistence
    localStorage.setItem('pendingVerificationEmail', email);
    
    // Check if email is already verified
    checkVerificationStatus();
    
    // Set up periodic checking for email verification
    const interval = setInterval(checkVerificationStatus, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, [email, navigate]);

  const checkVerificationStatus = async () => {
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setIsVerified(true);
        localStorage.removeItem('pendingVerificationEmail');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendEmailVerification();
    } catch (error) {
      console.error('Error resending email:', error);
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
            to="/register" 
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Register</span>
          </Link>
        </div>

        {/* Site Logo */}
        <div className="absolute top-6 right-6 z-20">
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
          {/* Verification Box */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to
              </p>
              <p className="text-blue-600 font-medium mb-6">{email}</p>
            </div>

            {isVerified ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-600">Email Verified!</h3>
                <p className="text-gray-600">
                  Your email has been successfully verified. Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600 text-center">
                  Please check your email and click the verification link to activate your account.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Check your email</p>
                      <p>We've sent a verification link to your email address. Click the link to verify your account.</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn't receive the email?
                  </p>
                  
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
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

export default Verification; 