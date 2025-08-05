import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, LogIn, ArrowLeft } from 'lucide-react';

const PasswordResetSuccess = () => {
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
            <span>Back to Sign In</span>
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
          {/* Password Reset Success Box */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Password has been reset
              </h2>
              
              <p className="text-gray-600 mb-6">
                You can now sign in with your new password
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p>For your security, please log in again with your new password.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
              >
                Sign In with New Password
              </Link>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Need help?{' '}
                <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PasswordResetSuccess;