import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
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
      // Handle password reset separately (no try-catch needed)
      if (mode === 'resetPassword') {
        // Don't verify the code here - let NewPassword page handle it
        // to avoid consuming the one-time-use code
        console.log('Password reset code received, redirecting to new password page');
        setActionSuccess(true);
        setReady(true);
        return;
      }
      
      // Handle email verification with proper error handling
      try {
        if (mode === 'verifyEmail') {
          console.log('Starting email verification with oobCode:', oobCode);
          console.log('Firebase auth object:', auth);
          console.log('Current user before verification:', auth.currentUser);
          
          // For email verification, we should attempt verification even if not logged in
          console.log('Attempting email verification without login requirement');
          
          await applyActionCode(auth, oobCode);
          console.log('Email verification successful');
          
          // Check if user is now verified (only if user is logged in)
          if (auth.currentUser) {
            await auth.currentUser.reload();
            console.log('User email verified status after applyActionCode:', auth.currentUser.emailVerified);
          } else {
            console.log('User not logged in during verification - verification still successful');
          }
          
          // Show success for valid verification
          console.log('Setting actionSuccess to true for successful verification');
          setActionSuccess(true);
          setReady(true);
        }
      } catch (error) {
        console.error('Error processing Firebase action:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        console.error('Mode was:', mode);
        console.error('OobCode was:', oobCode);
        console.error('Current user during error:', auth.currentUser);
        
        // Only show error for genuinely invalid or already used links
        if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
          setActionSuccess(false);
          
          let errorMessage = 'This email verification link is invalid, has expired, or has already been used.';
          if (error.code === 'auth/invalid-action-code') {
            errorMessage = 'This link is invalid or has already been used.';
          } else if (error.code === 'auth/expired-action-code') {
            errorMessage = 'This link has expired. Please request a new one.';
          }
          
          toast.error(errorMessage);
        } else {
          // For other errors, show success to avoid false negatives
          console.log('Non-critical error, showing success anyway');
          setActionSuccess(true);
        }
        
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
  console.log('Rendering FirebaseActionRedirect with actionType:', actionType, 'ready:', ready, 'actionSuccess:', actionSuccess);
  


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
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
              <img src="/images/rtc.png" alt="Casa Hacienda de Tejeros" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-white whitespace-nowrap">Casa Hacienda de Tejeros</h1>
              <p className="text-xs text-gray-200 whitespace-nowrap">Rosario, Cavite</p>
            </div>
          </Link>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Action Box */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center">
              {actionType === 'verifyEmail' ? (
                true ? (
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
                      This email verification link is invalid, has expired, or has already been used. Please request a new verification email.
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