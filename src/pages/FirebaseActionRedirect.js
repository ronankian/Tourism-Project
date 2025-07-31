import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import { CheckCircle, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const FirebaseActionRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [actionType, setActionType] = useState(null);
  const [ready, setReady] = useState(false);

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
        } else if (mode === 'resetPassword') {
          await verifyPasswordResetCode(auth, oobCode);
          console.log('Password reset code verified');
        }
        setReady(true);
      } catch (error) {
        console.error('Error processing Firebase action:', error);
        toast.error('Authentication link has expired or is invalid');
        setReady(true); // Still show the UI even if there's an error
      }
    };

    processAction();
  }, [mode, oobCode, navigate]);

  const handleEmailVerificationProceed = () => {
    navigate('/email-verification-success');
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

        {/* Site Logo */}
        <div className="absolute top-6 left-6 z-20">
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
          {/* Action Box */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center">
              {actionType === 'verifyEmail' ? (
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
                    Continue
                  </button>
                </>
              ) : actionType === 'resetPassword' ? (
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