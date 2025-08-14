import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import WebsiteBanner from '../components/WebsiteBanner';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { adminLoginWithPasskey } = useAuth();

  // reCAPTCHA handlers
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast.warning('reCAPTCHA expired. Please verify again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // reCAPTCHA validation
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification.');
      setLoading(false);
      return;
    }

    try {
      const ok = adminLoginWithPasskey(passkey);
      if (ok) {
        navigate('/admin');
      } else {
        setError('Invalid passkey.');
        // Reset reCAPTCHA on failed login attempt
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <WebsiteBanner />
        <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-10">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/casa-blur.webp)',
              transform: 'scale(1.1)',
              zIndex: 0
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8 relative z-10"
          >
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-2">Admin Access</h2>
              <p className="text-gray-600">Enter the admin passkey to continue</p>  
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    id="passkey"
                    name="passkey"
                    type={showPasskey ? 'text' : 'password'}
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    onFocus={() => setFocusedField('passkey')}
                    onBlur={() => setFocusedField('')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <label 
                    htmlFor="passkey" 
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      passkey || focusedField === 'passkey'
                        ? '-top-2 bg-white px-2 text-sm font-medium'
                        : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                    } ${
                      focusedField === 'passkey' ? 'text-[#5d9c59]' : 'text-gray-500'
                    }`}
                  >
                    Admin Passkey
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasskey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  onExpired={handleRecaptchaExpired}
                  theme="light"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !recaptchaToken}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking…' : 'Enter Dashboard'}
                </button>
              </div>
            </form>
          </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;


