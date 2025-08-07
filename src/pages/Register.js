import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const Register = () => {
     const [formData, setFormData] = useState({
     firstName: '',
     lastName: '',
     email: '',
     password: '',
     confirmPassword: ''
   });
  const [inputType, setInputType] = useState('email'); // Only email now
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});
  const [registrationError, setRegistrationError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'password':
        if (value && value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else {
          delete newErrors.password;
        }
        // Also check confirm password match when password changes
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (value && formData.password && value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (value === formData.password) {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear registration error when user starts typing
    if (registrationError) {
      setRegistrationError('');
    }
    
    // Validate the field as user types
    validateField(name, value);
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
    setRegistrationError(''); // Clear previous errors
    
    // Check if there are any existing validation errors
    if (Object.keys(errors).length > 0) {
      setRegistrationError('Please fix the errors above before submitting');
      return;
    }
    
    // Basic validation for required fields
    if (!formData.firstName.trim()) {
      setRegistrationError('Please enter your first name');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setRegistrationError('Please enter your last name');
      return;
    }
    
    if (!formData.email.trim()) {
      setRegistrationError('Please enter your email address');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setRegistrationError('Password must be at least 8 characters long');
      return;
    }
    
    if (!formData.confirmPassword) {
      setRegistrationError('Please confirm your password');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setRegistrationError('Passwords do not match. Please make sure both passwords are identical.');
      return;
    }
    
    setLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      }, false); // Pass false to disable toast
        
      if (result && result.success) {
        // Redirect to email verification page
        navigate('/verification', { state: { email: formData.email, type: 'email' } });
      } else {
        setRegistrationError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('An unexpected error occurred. Please try again.');
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
          input[type="password"]::-webkit-contacts-auto-fill-button,
          input[type="password"]::-webkit-credentials-auto-fill-button {
            display: none !important;
          }
          
          
        `}
      </style>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Blurred Background Image (pre-blurred) */}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Form Box with Shadow */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Create Account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <label 
                htmlFor="firstName" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.firstName || focusedField === 'firstName'
                    ? '-top-2 bg-white px-2 text-sm font-medium'
                    : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                } ${
                  focusedField === 'firstName' ? 'text-[#df2e38]' : 'text-gray-500'
                }`}
              >
                First Name
              </label>
            </div>

            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <label 
                htmlFor="lastName" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.lastName || focusedField === 'lastName'
                    ? '-top-2 bg-white px-2 text-sm font-medium'
                    : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                } ${
                  focusedField === 'lastName' ? 'text-[#df2e38]' : 'text-gray-500'
                }`}
              >
                Last Name
              </label>
            </div>

                         {/* Email Input */}
             <div className="relative">
               <input
                 id="email"
                 name="email"
                 type="email"
                 required
                 value={formData.email}
                 onChange={handleChange}
                 onFocus={() => handleFocus('email')}
                 onBlur={handleBlur}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
               <label 
                 htmlFor="email" 
                 className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                   formData.email || focusedField === 'email'
                     ? '-top-2 bg-white px-2 text-sm font-medium'
                     : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                 } ${
                   focusedField === 'email' ? 'text-[#df2e38]' : 'text-gray-500'
                 }`}
               >
                 Email address
               </label>
             </div>

            <div className="relative">
                              <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  style={{ 
                    WebkitTextSecurity: showPassword ? 'none' : 'disc',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    msClear: 'none'
                  }}
                />
              <label 
                htmlFor="password" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.password || focusedField === 'password'
                    ? '-top-2 bg-white px-2 text-sm font-medium'
                    : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                } ${
                  focusedField === 'password' ? 'text-[#df2e38]' : 'text-gray-500'
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={handleBlur}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                style={{ 
                  WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  msClear: 'none'
                }}
              />
              <label 
                htmlFor="confirmPassword" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.confirmPassword || focusedField === 'confirmPassword'
                    ? '-top-2 bg-white px-2 text-sm font-medium'
                    : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                } ${
                  focusedField === 'confirmPassword' ? 'text-[#df2e38]' : 'text-gray-500'
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
          </div>

          {registrationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">{registrationError}</p>
            </div>
          )}

                     <div>
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? 'Creating account...' : 'Create Account'}
             </button>
           </div>

          <div className="text-center">
              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
            <p className="text-gray-600">
              Already have an account?{' '}
                              <Link to="/login" className="font-medium text-[#df2e38] hover:text-[#c62828]">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default Register; 