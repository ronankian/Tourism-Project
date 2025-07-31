import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Home, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const EmailVerificationSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { user, checkEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Wait a moment for Firebase to process the verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const isVerified = await checkEmailVerification();
        setVerificationStatus(isVerified ? 'success' : 'error');
        
        if (isVerified) {
          toast.success('Email verified successfully!');
          // Redirect to dashboard after 3 seconds if user is logged in
          if (user) {
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          toast.error('Email verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        setVerificationStatus('error');
        toast.error('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [user, navigate, checkEmailVerification]);

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
            to="/" 
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
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
              {loading ? (
                <div className="space-y-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Verifying Email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Please wait while we verify your email address...
                  </p>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Your email has been verified
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You can now sign in with your new account
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We couldn't verify your email address. The link may have expired or already been used.
                  </p>
                  
                  <div className="space-y-6">
                    <p className="text-gray-600 text-center">
                      Please try signing in again or request a new verification email.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Need help?</p>
                          <p>Contact support if you continue to have issues with email verification.</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        to="/verification"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
                      >
                        Try Again
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            {verificationStatus === 'success' && (
              <div className="space-y-4 mt-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">Welcome back!</p>
                          <p>You will be redirected to your dashboard in a few seconds.</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">Almost done!</p>
                          <p>Please sign in to access your account.</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/login"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}
            </div>

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

export default EmailVerificationSuccess;