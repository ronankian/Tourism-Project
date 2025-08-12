import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

const VerifyBooking = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const bookingId = searchParams.get('id');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyBookingEmail = async () => {
      if (!bookingId || !token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        setStatus('verifying');
        const success = await bookingService.verifyBookingEmail(bookingId, token);
        
        if (success) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You will receive a confirmation email shortly.');
          toast.success('Booking email verified successfully!');
        } else {
          setStatus('error');
          setMessage('Failed to verify your email. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again or contact support.');
      }
    };

    verifyBookingEmail();
  }, [bookingId, token]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // You can implement a contact form or redirect to contact page
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {status === 'verifying' && (
            <>
              <Mail className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Verifying Your Email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your booking email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Email Verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoHome}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Return to Home
                </motion.button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactSupport}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Contact Support
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoHome}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Return to Home
                </motion.button>
              </div>
            </>
          )}
        </motion.div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact us at (046) 886-9707
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyBooking;
