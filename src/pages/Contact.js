import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { useContact } from '../contexts/ContactContext';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { verifyRecaptchaToken, isRecaptchaValid, getRecaptchaErrorMessage } from '../utils/recaptchaVerification';
import { securityService } from '../services/securityService';

const Contact = () => {
  const { contactInfo } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '' // Hidden field for bot detection
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [recaptchaRendered, setRecaptchaRendered] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [recaptchaFailedToLoad, setRecaptchaFailedToLoad] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('');

  // Define onload callback function (must be global)
    useEffect(() => {
    // Check if contact site key is available
    const contactSiteKey = process.env.REACT_APP_RECAPTCHA_CONTACT_SITE_KEY || process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    if (!contactSiteKey) {
      console.error('Contact reCAPTCHA Site Key is missing! Please check your .env file.');
      setRecaptchaFailedToLoad(true);
      return;
    }

    // Set a timeout to detect if reCAPTCHA fails to load
    const loadTimeout = setTimeout(() => {
      if (!recaptchaRendered) {
        setRecaptchaFailedToLoad(true);
      }
    }, 10000); // 10 second timeout
    
    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha) {
      // If script is loaded but widget not rendered, render it
      if (!recaptchaRendered && recaptchaRef.current) {
        window.onloadCallback();
      }
      return;
    }

    // Define the onload callback function globally (as per official docs)
    window.onloadCallback = function() {
      if (window.grecaptcha && recaptchaRef.current && !recaptchaRendered) {
        try {
          // Check if element already has reCAPTCHA widget
          const existingWidget = recaptchaRef.current.querySelector('.g-recaptcha');
          if (existingWidget) {
            return;
          }
          
          window.grecaptcha.render(recaptchaRef.current, {
            'sitekey': contactSiteKey,
            'theme': 'light',
            'callback': (token) => {
              setRecaptchaToken(token);
            },
            'expired-callback': () => {
              setRecaptchaToken(null);
              toast.warning('reCAPTCHA expired. Please verify again.');
            },
            'error-callback': () => {
              setRecaptchaToken(null);
              toast.error('reCAPTCHA encountered an error. Please refresh the page and try again.');
            }
          });
          setRecaptchaRendered(true);
          setRecaptchaFailedToLoad(false); // Clear failed load state on success
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error);
          // If it's an "already rendered" error, mark as rendered anyway
          if (error.message.includes('already been rendered')) {
            setRecaptchaRendered(true);
          }
        }
      }
    };

    // Only load script if site key is available
    let script = null;
    if (contactSiteKey) {
      // Create script element following official documentation
      script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      console.error('Cannot load reCAPTCHA script - site key is missing!');
    }

    // Cleanup function
    return () => {
      // Clear the timeout
      clearTimeout(loadTimeout);
      
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Don't delete window.onloadCallback to prevent issues with multiple renders
      setRecaptchaFailedToLoad(false);
    };
  }, [recaptchaRendered]);

  // Opportunistic prune of expired restrictions on contact load
  useEffect(() => {
    (async () => { try { const mod = await import('../services/securityService'); await mod.securityService.pruneExpiredRestrictions(); } catch (_) {} })();
  }, []);



  const resetRecaptcha = () => {
    if (window.grecaptcha) {
      window.grecaptcha.reset();
      setRecaptchaToken(null);
    }
  };

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    const { name, email, subject, message } = formData;
    
    // Check if all required fields are filled and not just whitespace
    const allFieldsFilled = name.trim() && 
                           email.trim() && 
                           subject.trim() && 
                           message.trim();
    
    // Check if reCAPTCHA is completed
    const recaptchaCompleted = !!recaptchaToken;
    
    return allFieldsFilled && recaptchaCompleted;
  };

  // Email validation function
  const validateEmail = (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address format.' };
    }

    // Check for common disposable email domains
    const disposableEmailDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
      'temp-mail.org', 'throwaway.email', 'yopmail.com', 'maildrop.cc',
      'getnada.com', 'fakeinbox.com', 'mailnesia.com', 'trashmail.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      return { valid: false, message: 'Please use a permanent email address. Disposable emails are not allowed.' };
    }

    // Check for suspicious patterns
    if (email.includes('test@test') || email.includes('spam@') || email.includes('fake@')) {
      return { valid: false, message: 'Please enter a real email address.' };
    }

    return { valid: true };
  };

  // Content filtering function
  const containsSpam = (text) => {
    const spamKeywords = [
      'bitcoin', 'cryptocurrency', 'forex', 'investment opportunity', 'make money fast',
      'click here now', 'limited time offer', 'guaranteed', 'free money',
      'work from home', 'viagra', 'casino', 'lottery', 'winner', 'congratulations you won'
    ];
    
    const lowerText = text.toLowerCase();
    return spamKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's likely a bot
    if (formData.honeypot) {
      console.log('Bot detected via honeypot field');
      toast.error('Submission failed. Please try again.');
      return;
    }
    
    // Rate limiting - prevent rapid submissions
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const rateLimit = 30000; // 30 seconds between submissions
    
    if (timeSinceLastSubmission < rateLimit) {
      const remainingSeconds = Math.ceil((rateLimit - timeSinceLastSubmission) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before sending another message.`);
      return;
    }

    // Basic form validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    
    // Name validation - check for suspicious patterns
    if (formData.name.trim().length < 2) {
      toast.error('Please enter your full name (at least 2 characters).');
      return;
    }
    
    if (/[0-9]/.test(formData.name)) {
      toast.error('Please enter a valid name without numbers.');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    
    // Advanced email validation
    const emailValidation = validateEmail(formData.email.trim());
    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return;
    }

    // Restricted email check
    try {
      const restrict = await securityService.isEmailRestricted(formData.email);
      if (restrict?.restricted) {
        setRestrictionMessage(restrict.message || 'This email address is restricted and cannot send messages.');
        setShowRestrictionModal(true);
        return;
      }
    } catch (_e) {}

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject for your message.');
      return;
    }
    
    // Subject validation
    if (formData.subject.trim().length < 5) {
      toast.error('Please enter a more descriptive subject (at least 5 characters).');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter your message.');
      return;
    }
    
    // Message validation
    if (formData.message.trim().length < 10) {
      toast.error('Please enter a more detailed message (at least 10 characters).');
      return;
    }
    
    // Spam content filtering
    const combinedText = `${formData.subject} ${formData.message}`;
    if (containsSpam(combinedText)) {
      toast.error('Your message contains content that appears to be spam. Please revise your message.');
      return;
    }

    // Check for excessive repetition (spam pattern)
    const words = formData.message.split(' ');
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      toast.error('Your message appears to contain repetitive content. Please write a more natural message.');
      return;
    }

    // reCAPTCHA validation
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification.');
      return;
    }

    // Verify reCAPTCHA token with Google's API
    const verificationResult = await verifyRecaptchaToken(recaptchaToken);
    if (!isRecaptchaValid(verificationResult)) {
      const errorMessage = getRecaptchaErrorMessage(verificationResult);
      toast.error(errorMessage);
      resetRecaptcha();
      return;
    }

    // Check if EmailJS environment variables are available
    if (!process.env.REACT_APP_EMAILJS_ADMIN_SERVICE_ID || 
        !process.env.REACT_APP_EMAILJS_ADMIN_PUBLIC_KEY) {
      toast.error('Email service is not configured. Please contact the administrator.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare email data
      const emailData = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submit_date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Manila'
        })
      };

      // Send email via EmailJS
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_ADMIN_SERVICE_ID,
        'template_4w0tahi',
        emailData,
        { publicKey: process.env.REACT_APP_EMAILJS_ADMIN_PUBLIC_KEY }
      );

      // Record submission time for rate limiting
      setLastSubmissionTime(now);
      
      // Success feedback
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form and reCAPTCHA
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: ''
      });
      resetRecaptcha();

    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.text?.includes('template')) {
        toast.error('Email template error. Please try again or contact us directly.');
      } else if (error.text?.includes('service')) {
        toast.error('Email service error. Please try again later.');
      } else {
        toast.error('Failed to send message. Please try again or contact us directly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/casa-full.webp)' }}
        ></div>
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.8) 25%, rgba(223, 46, 56, 0.8) 100%)'
          }}
        ></div>
        <div className="relative z-10 container-custom text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold mb-6 drop-shadow-lg"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto drop-shadow-lg"
          >
            Get in touch with our tourism team for any inquiries, bookings, or information about visiting Rosario, Cavite
          </motion.p>
        </div>
      </section>

      <div className="container-custom py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field - hidden from users, visible to bots */}
              <div style={{ display: 'none' }}>
                <label htmlFor="website">Website (leave blank):</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({...formData, honeypot: e.target.value})}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  disabled={isSubmitting}
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  required
                  disabled={isSubmitting}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* reCAPTCHA */}
              <div className="space-y-3">
                {/* reCAPTCHA Failed to Load Message */}
                {recaptchaFailedToLoad && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium">reCAPTCHA Failed to Load</span>
                    </div>
                    <p className="text-red-600 text-sm">
                      Please refresh the page to reload the verification widget.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Refresh Page
                    </button>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <div 
                    ref={recaptchaRef}
                    id="recaptcha-container"
                    className="min-h-[78px] w-full max-w-[304px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center"
                    style={{ minHeight: '78px' }}
                    suppressHydrationWarning={true}
                  >
                  </div>
                </div>
                
                {/* Required fields notice */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                  {!isFormValid() && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please fill all required fields and complete reCAPTCHA to send your message
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={`btn-primary w-full py-3 text-lg font-medium transition-all duration-200 ${
                  isSubmitting || !isFormValid()
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 inline mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our team is here to help you plan the perfect visit to Casa Hacienda de Tejeros in Rosario, Cavite. 
                Feel free to reach out with any questions or special requests.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
                  <p className="text-gray-600">
                    {contactInfo?.address || 'Casa Hacienda de Tejeros, Rosario, Cavite'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
                  <p className="text-gray-600">
                    {contactInfo?.phone || '(046) 886-9707'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600">
                    {contactInfo?.email || 'tourismoffice886@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Hours</h3>
                  <p className="text-gray-600">
                    {contactInfo?.officeHours?.weekdays || 'Monday - Friday: 8:00 AM - 5:00 PM'}<br />
                    {contactInfo?.officeHours?.weekends || 'Saturday - Sunday: By appointment only'}<br />
                    {contactInfo?.officeHours?.holidays || 'Holidays: By appointment only'}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="p-4 bg-primary-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Find Us on the Map
                </h3>
              </div>
              <div className="h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d485.00820329364866!2d120.86025115159815!3d14.401259533066393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33962cf2b0478e81%3A0xc071e2b91b09c6bf!2sCasa%20Hacienda%20de%20Tejeros!5e0!3m2!1sen!2sph!4v1704000000000!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Casa Hacienda de Tejeros Location"
                ></iframe>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Click on the map to open in Google Maps for directions
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Restricted Email Modal */}
      {showRestrictionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Restricted by the Administrator</h3>
              <p className="text-gray-600 mb-6">{restrictionMessage}</p>
              <button
                onClick={() => setShowRestrictionModal(false)}
                className="w-full btn-primary py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact; 