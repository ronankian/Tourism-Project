import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

const FirebaseActionRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleFirebaseAction = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      const continueUrl = searchParams.get('continueUrl');

      console.log('Firebase action detected:', { mode, oobCode, continueUrl });

      if (!mode || !oobCode) {
        navigate('/');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            console.log('Processing email verification...');
            await applyActionCode(auth, oobCode);
            console.log('Email verification successful');
            navigate('/email-verification-success');
            break;

          case 'resetPassword':
            console.log('Processing password reset...');
            // Verify the code is valid, then redirect to our new password page
            await verifyPasswordResetCode(auth, oobCode);
            navigate(`/new-password?mode=${mode}&oobCode=${oobCode}`);
            break;

          case 'recoverEmail':
            navigate('/');
            break;

          default:
            console.log('Unknown mode:', mode);
            navigate('/');
            break;
        }
      } catch (error) {
        console.error('Error handling Firebase action:', error);
        
        let errorMessage = 'Authentication action failed.';
        switch (error.code) {
          case 'auth/invalid-action-code':
            errorMessage = 'Invalid or expired link.';
            break;
          case 'auth/expired-action-code':
            errorMessage = 'This link has expired.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found.';
            break;
        }
        
        console.error(errorMessage);
        
        if (mode === 'verifyEmail') {
          navigate('/email-verification-success');
        } else if (mode === 'resetPassword') {
          navigate(`/new-password?mode=${mode}&oobCode=${oobCode}`);
        } else {
          navigate('/');
        }
      }
    };

    handleFirebaseAction();
  }, [searchParams, navigate]);

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

        {/* Site Logo */}
        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rosario Tourism</h1>
              <p className="text-xs text-gray-200">Cavite, Philippines</p>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Processing Box */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Processing Authentication
              </h2>
              <p className="text-gray-600 mb-6">
                Please wait while we handle your request...
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Authenticating</p>
                    <p>We're securely processing your authentication request.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirebaseActionRedirect;