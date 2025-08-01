import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';

import toast from 'react-hot-toast';

const FirebaseActionRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [actionType, setActionType] = useState(null);
  const [ready, setReady] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);


  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    console.log('FirebaseActionRedirect mounted with mode:', mode, 'oobCode:', oobCode);
    
    if (!mode || !oobCode) {
      navigate('/');
      return;
    }

    setActionType(mode);
    
    // Process the action in background
    const processAction = async () => {
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          console.log('Email verification successful');
          setActionSuccess(true);
        } else if (mode === 'resetPassword') {
          await verifyPasswordResetCode(auth, oobCode);
          console.log('Password reset code verified');
          setActionSuccess(true);
        }
        setReady(true);
      } catch (error) {
        console.error('Error processing Firebase action:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        
        setActionSuccess(false);

        // More specific error handling
        let errorMessage = 'Authentication link has expired or is invalid';
        
        switch (error.code) {
          case 'auth/expired-action-code':
            errorMessage = 'This link has expired. Please request a new one.';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'This link is invalid or has already been used.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'User not found. The account may have been deleted.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak.';
            break;
          default:
            console.log('Unknown error code:', error.code);
            errorMessage = `Authentication error: ${error.message}`;
            break;
        }

        toast.error(errorMessage);
        setReady(true);
      }
    };

    processAction();
  }, [mode, oobCode, navigate]);

  const handleEmailVerificationProceed = () => {
    navigate('/login');
  };

  const handlePasswordResetProceed = () => {
    navigate(`/new-password?mode=${mode}&oobCode=${oobCode}`);
  };

  // Always show the beautiful interface
  console.log('Rendering FirebaseActionRedirect with actionType:', actionType, 'ready:', ready);
  


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

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Action Box */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center">
              {actionType === 'verifyEmail' ? (
                actionSuccess ? (
                  <>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                      Email Verified!
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Your email has been successfully verified. You can now access all features of your account.
                    </p>
                    
                    <button
                      onClick={handleEmailVerificationProceed}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                      Invalid Verification Link
                    </h2>
                    <p className="text-gray-600 mb-6">
                      This email verification link is invalid or has expired. Please try signing in or request a new verification email.
                    </p>
                    
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Back to Login
                    </button>
                  </>
                )
              ) : actionType === 'resetPassword' ? (
                actionSuccess ? (
                  <>
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">
                      Password Reset
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Your reset link has been verified. You can now set your new password.
                    </p>
                    
                    <button
                      onClick={handlePasswordResetProceed}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Set New Password
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                      Invalid Reset Link
                    </h2>
                    <p className="text-gray-600 mb-6">
                      This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    
                    <button
                      onClick={() => navigate('/reset-password')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Request New Reset Link
                    </button>
                  </>
                )
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Processing...
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Please wait while we process your request.
                  </p>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Go to Home
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirebaseActionRedirect;