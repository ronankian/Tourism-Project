import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const validateResetCode = async () => {
      console.log('NewPassword: Starting validation with oobCode:', oobCode, 'mode:', mode);
      
      if (!oobCode || mode !== 'resetPassword') {
        console.log('NewPassword: Missing oobCode or wrong mode - oobCode:', oobCode, 'mode:', mode);
        toast.error('Invalid password reset link.');
        navigate('/reset-password');
        return;
      }

      try {
        console.log('NewPassword: About to call verifyPasswordResetCode');
        // Verify the password reset code and get the email
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        console.log('NewPassword: verifyPasswordResetCode successful, email:', userEmail);
        setEmail(userEmail);
        setCodeValid(true);
        toast.success('Password reset link verified. Please enter your new password.');
      } catch (error) {
        console.error('NewPassword: Error verifying reset code:', error);
        console.error('NewPassword: Error code:', error.code);
        console.error('NewPassword: Error message:', error.message);
        console.error('NewPassword: OobCode that failed:', oobCode);
        
        let errorMessage = 'Invalid or expired password reset link.';
        
        switch (error.code) {
          case 'auth/invalid-action-code':
            errorMessage = 'Invalid password reset link.';
            console.log('NewPassword: Code was invalid - possibly already used');
            break;
          case 'auth/expired-action-code':
            errorMessage = 'Password reset link has expired.';
            console.log('NewPassword: Code has expired');
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found for this reset link.';
            break;
          default:
            console.log('NewPassword: Unknown error code:', error.code);
            break;
        }
        
        toast.error(errorMessage);
        setCodeValid(false);
      } finally {
        setValidatingCode(false);
      }
    };

    validateResetCode();
  }, [oobCode, mode, navigate]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'newPassword':
        if (value && value.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters long';
        } else {
          delete newErrors.newPassword;
        }
        // Also check confirm password match when password changes
        if (confirmPassword && value !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (confirmPassword && value === confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (value && newPassword && value !== newPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (value === newPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validateField('newPassword', value);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateField('confirmPassword', value);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (e) => {
    setFocusedField('');
    // Validate field when user leaves it
    if (e && e.target) {
      validateField(e.target.name, e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any existing validation errors
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors above before submitting');
      return;
    }
    
    if (!newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    if (!confirmPassword.trim()) {
      toast.error('Please confirm your new password.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please make sure both passwords are identical.');
      return;
    }
    
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password with at least 8 characters.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'Invalid password reset link. Please request a new password reset.';
          break;
        case 'auth/expired-action-code':
          errorMessage = 'Password reset link has expired. Please request a new password reset.';
          break;
        default:
          errorMessage = 'Failed to reset password. Please try again or request a new reset link.';
          break;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validatingCode) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/casa-blur.webp)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Validating Reset Link
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your password reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/casa-blur.webp)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/reset-password"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            to="/reset-password" 
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <Lock className="w-5 h-5" />
            <span>Back to Reset</span>
          </Link>
        </div>

        {/* Site Logo - Right side to avoid back button overlap */}
        <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 relative z-10"
        >
          {/* Password Reset Box */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              {success ? (
                <div className="space-y-6">
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
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Set New Password
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Enter your new password for
                  </p>
                  <p className="text-blue-600 font-medium mb-6">{email}</p>
                </>
              )}
            </div>

            {success && (
              <div className="space-y-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Password updated!</p>
                      <p>You will be redirected to the login page in a few seconds.</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
                >
                  Sign In Now
                </Link>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={handlePasswordChange}
                    onFocus={() => handleFocus('newPassword')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                   
                  />
                  <label 
                    htmlFor="newPassword"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      newPassword || focusedField === 'newPassword'
                        ? '-top-2 bg-white px-2 text-sm font-medium'
                        : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                    } ${
                      focusedField === 'newPassword' ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <label 
                    htmlFor="confirmPassword"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      confirmPassword || focusedField === 'confirmPassword'
                        ? '-top-2 bg-white px-2 text-sm font-medium'
                        : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                    } ${
                      focusedField === 'confirmPassword' ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
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

export default NewPassword;