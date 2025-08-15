import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Mail, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { bookingSettingsService } from '../services/bookingSettingsService';
import { storage, auth } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendSignInLinkToEmail } from 'firebase/auth';
import toast from 'react-hot-toast';
import { verifyRecaptchaToken, isRecaptchaValid, getRecaptchaErrorMessage } from '../utils/recaptchaVerification';
// emailjs removed from the booking page (emails are sent post-verification)


const Booking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
    purpose: '',
    otherPurpose: '',
    schoolOrOrganizationName: ''
  });

  // Booking settings state
  const [bookingSettings, setBookingSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [dailyLimits, setDailyLimits] = useState({
    smallGroupTour: { allowed: true, currentCount: 0, limit: null, remaining: null },
    organizationTour: { allowed: true, currentCount: 0, limit: null, remaining: null }
  });

  // Load booking settings on component mount
  useEffect(() => {
    const loadBookingSettings = async () => {
      try {
        setSettingsLoading(true);
        const settings = await bookingSettingsService.getBookingSettings();
        setBookingSettings(settings);
        
        // Check maintenance mode status
        const maintenanceCheck = bookingSettingsService.checkMaintenanceMode(settings);
        setMaintenanceStatus(maintenanceCheck);
        
        // Daily limits will be loaded when date is selected
      } catch (error) {
        console.error('Error loading booking settings:', error);
        // If settings fail to load, use default settings
        setBookingSettings({
          smallGroupTourEnabled: true,
          organizationTourEnabled: true,
          specialRequestsEnabled: true,
          attachmentsEnabled: true,
          maintenanceMode: { enabled: false }
        });
        setMaintenanceStatus({ inMaintenance: false });
      } finally {
        setSettingsLoading(false);
      }
    };

    loadBookingSettings();
  }, []);

  // Reload daily limits when date changes
  useEffect(() => {
    const loadDailyLimits = async (selectedDate = null) => {
      try {
        const targetDate = selectedDate || bookingData.date || new Date().toISOString().split('T')[0];
        
        const [smallGroupCheck, organizationCheck] = await Promise.all([
          bookingSettingsService.checkDailyBookingLimit('smallGroupTour', targetDate),
          bookingSettingsService.checkDailyBookingLimit('organizationTour', targetDate)
        ]);

        setDailyLimits({
          smallGroupTour: smallGroupCheck,
          organizationTour: organizationCheck
        });
      } catch (error) {
        console.error('Error loading daily limits:', error);
        // Keep default values if loading fails
      }
    };

    if (bookingData.date && bookingSettings) {
      loadDailyLimits(bookingData.date);
    }
  }, [bookingData.date, bookingSettings]);

  // Dynamic packages based on admin settings
  const getAvailablePackages = () => {
    if (!bookingSettings) return [];
    
    const allPackages = [
      {
        id: 1,
        name: 'Small Group Tour',
        description: 'Perfect for individuals, couples, families, or small gatherings looking for a more personal experience.',
        price: 'Free',
        duration: 'Morning: 8:00 AM - 12:00 PM Afternoon: 1:00 PM - 5:00 PM',
        maxGuests: 20,
        showPerPerson: false,
        enabled: bookingSettings.smallGroupTourEnabled
      },
      {
        id: 2,
        name: 'Organization & Institutional Tour',
        description: 'Designed for schools, offices, and cultural organizations hosting heritage-related visits or functions.',
        price: 'Free',
        duration: 'Morning: 8:00 AM - 12:00 PM Afternoon: 1:00 PM - 5:00 PM',
        hasNoLimit: true,
        showPerPerson: false,
        enabled: bookingSettings.organizationTourEnabled,
        prerequisites: [
          'Letter of Permission',
          'Authorization from School Officials et. al.',
          'Confirm and set intended visit schedule'
        ]
      }
    ];

    return allPackages.filter(pkg => pkg.enabled);
  };

  const packages = getAvailablePackages();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [agreedToProtocols, setAgreedToProtocols] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [recaptchaRendered, setRecaptchaRendered] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [widgetId, setWidgetId] = useState(null);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Define onload callback function (must be global)
  useEffect(() => {
    // Debug: Check if environment variables are loaded
    console.log('🔍 Booking reCAPTCHA Key:', process.env.REACT_APP_RECAPTCHA_BOOKING_SITE_KEY);
    console.log('🔍 Legacy reCAPTCHA Key:', process.env.REACT_APP_RECAPTCHA_SITE_KEY);
    console.log('🔍 All REACT_APP env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_RECAPTCHA')));
    
    // Check if booking site key is available
    const bookingSiteKey = process.env.REACT_APP_RECAPTCHA_BOOKING_SITE_KEY || process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    console.log('🎯 Using Booking site key:', bookingSiteKey);
    if (!bookingSiteKey) {
      console.error('❌ Booking reCAPTCHA Site Key is missing! Please check your .env file.');
      return;
    }
    
    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha) {
      console.log('reCAPTCHA script already loaded');
      // If script is loaded but widget not rendered, render it
      if (!recaptchaRendered && recaptchaRef.current) {
        window.onloadCallback();
      }
      return;
    }

    // Define the render function
    const renderRecaptcha = () => {
      console.log('🔄 renderRecaptcha called');
      console.log('📊 Current state:', {
        hasGrecaptcha: !!window.grecaptcha,
        hasRender: !!(window.grecaptcha && window.grecaptcha.render),
        hasRef: !!recaptchaRef.current,
        alreadyRendered: recaptchaRendered,
        siteKey: bookingSiteKey
      });
      
      if (!window.grecaptcha || !window.grecaptcha.render) {
        console.log('❌ grecaptcha not available yet');
        return;
      }
      
      if (!recaptchaRef.current) {
        console.log('❌ recaptchaRef not available yet, retrying in 100ms...');
        setTimeout(renderRecaptcha, 100);
        return;
      }
      
      if (recaptchaRendered) {
        console.log('✅ reCAPTCHA already rendered, skipping');
        return;
      }

      try {
        console.log('🚀 Starting reCAPTCHA render process');
        
        // Clear any existing widget first
        if (widgetId !== null) {
          try {
            window.grecaptcha.reset(widgetId);
            console.log('🔄 Reset existing widget ID:', widgetId);
          } catch (e) {
            console.log('Could not reset existing widget, continuing...');
          }
        }

        // Clear the container safely
        if (recaptchaRef.current) {
          try {
            // Only clear if it's safe to do so
            const children = recaptchaRef.current.children;
            for (let i = children.length - 1; i >= 0; i--) {
              const child = children[i];
              if (child.classList.contains('g-recaptcha') || child.classList.contains('text-gray-500')) {
                recaptchaRef.current.removeChild(child);
              }
            }
          } catch (e) {
            // Fallback to innerHTML if safe removal fails
            console.log('Using innerHTML fallback for container clear');
            recaptchaRef.current.innerHTML = '';
          }
          console.log('🧹 Cleared reCAPTCHA container');
        }

        // Render new widget
        console.log('🎯 Rendering with site key:', bookingSiteKey);
        const newWidgetId = window.grecaptcha.render(recaptchaRef.current, {
          'sitekey': bookingSiteKey,
          'theme': 'light',
          'callback': (token) => {
            console.log('✅ reCAPTCHA success:', token);
            setRecaptchaToken(token);
          },
          'expired-callback': () => {
            console.log('⏰ reCAPTCHA expired');
            setRecaptchaToken(null);
            toast.warning('reCAPTCHA expired. Please verify again.');
          },
          'error-callback': () => {
            console.log('❌ reCAPTCHA error callback triggered');
            setRecaptchaToken(null);
            toast.error('reCAPTCHA encountered an error. Please refresh the page and try again.');
          }
        });
        
        console.log('🆔 New widget ID:', newWidgetId);
        setWidgetId(newWidgetId);
        setRecaptchaRendered(true);
        console.log('✅ reCAPTCHA rendered successfully with ID:', newWidgetId);
      } catch (error) {
        console.error('❌ Error rendering reCAPTCHA:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    };

    // Define the onload callback function globally (as per official docs)
    window.onloadCallback = renderRecaptcha;

    // Only load script if site key is available
    let script = null;
    if (bookingSiteKey) {
      console.log('✅ Loading Booking reCAPTCHA script with site key:', bookingSiteKey);
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      if (!existingScript) {
        // Create script element following official documentation
        script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        console.log('reCAPTCHA script already loaded');
        // If script exists but grecaptcha is ready, call render
        if (window.grecaptcha && window.grecaptcha.render) {
          setTimeout(renderRecaptcha, 100);
        }
      }
    } else {
      console.error('❌ Cannot load reCAPTCHA script - site key is missing!');
    }

    // Cleanup function
    return () => {
      try {
        // Reset the widget if it exists
        if (widgetId !== null && window.grecaptcha && window.grecaptcha.reset) {
          window.grecaptcha.reset(widgetId);
          console.log('🧹 reCAPTCHA widget reset on cleanup');
        }
        
        // Clear the container safely
        if (recaptchaRef.current) {
          // Let reCAPTCHA handle its own cleanup first
          if (window.grecaptcha && window.grecaptcha.reset) {
            try {
              const widgets = recaptchaRef.current.querySelectorAll('.g-recaptcha');
              widgets.forEach(widget => {
                if (widget.parentNode === recaptchaRef.current) {
                  recaptchaRef.current.removeChild(widget);
                }
              });
            } catch (e) {
              // Safe cleanup - just clear innerHTML if individual removal fails
              recaptchaRef.current.innerHTML = '';
            }
          }
        }
        
        // Reset state
        setRecaptchaRendered(false);
        setRecaptchaToken(null);
        setWidgetId(null);
      } catch (e) {
        console.log('Cleanup error (non-critical):', e);
      }
    };
  }, []);



  // Additional useEffect to handle reCAPTCHA rendering when ref becomes available
  useEffect(() => {
    if (recaptchaRef.current && window.grecaptcha && window.grecaptcha.render && !recaptchaRendered) {
      console.log('🔄 Ref is now available, attempting to render reCAPTCHA');
      setTimeout(() => {
        if (recaptchaRef.current && !recaptchaRendered) {
          const renderRecaptcha = () => {
            try {
              console.log('🚀 Manual render attempt');
              const bookingSiteKey = process.env.REACT_APP_RECAPTCHA_BOOKING_SITE_KEY || process.env.REACT_APP_RECAPTCHA_SITE_KEY;
              
              if (recaptchaRef.current) {
                try {
                  // Safe container clearing
                  const children = recaptchaRef.current.children;
                  for (let i = children.length - 1; i >= 0; i--) {
                    const child = children[i];
                    if (child.classList.contains('g-recaptcha') || child.classList.contains('text-gray-500')) {
                      recaptchaRef.current.removeChild(child);
                    }
                  }
                } catch (e) {
                  recaptchaRef.current.innerHTML = '';
                }
              }

              const newWidgetId = window.grecaptcha.render(recaptchaRef.current, {
                'sitekey': bookingSiteKey,
                'theme': 'light',
                'callback': (token) => {
                  console.log('✅ reCAPTCHA success:', token);
                  setRecaptchaToken(token);
                },
                'expired-callback': () => {
                  console.log('⏰ reCAPTCHA expired');
                  setRecaptchaToken(null);
                  toast.warning('reCAPTCHA expired. Please verify again.');
                },
                'error-callback': () => {
                  console.log('❌ reCAPTCHA error callback triggered');
                  setRecaptchaToken(null);
                  toast.error('reCAPTCHA encountered an error. Please refresh the page and try again.');
                }
              });
              
              setWidgetId(newWidgetId);
              setRecaptchaRendered(true);
              console.log('✅ Manual reCAPTCHA render successful with ID:', newWidgetId);
            } catch (error) {
              console.error('❌ Manual render error:', error);
            }
          };
          renderRecaptcha();
        }
      }, 500);
    }
  }, [recaptchaRef.current, recaptchaRendered]);

  // Check for success parameter from email verification
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessModal(true);
      // Clean up the URL parameter
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('success');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const resetRecaptcha = () => {
    if (window.grecaptcha && widgetId !== null) {
      try {
        window.grecaptcha.reset(widgetId);
        setRecaptchaToken(null);
        console.log('🔄 reCAPTCHA reset after failed submission');
      } catch (e) {
        console.log('Could not reset reCAPTCHA widget:', e);
      }
    }
  };

  // Validation function to check if all required fields are filled
  const isBookingFormValid = () => {
    // Check if package is selected
    if (!selectedPackage) return false;
    
    // Check if protocols are agreed to
    if (!agreedToProtocols) return false;
    
    // Check if reCAPTCHA is completed
    if (!recaptchaToken) return false;
    
    // Check basic required fields (trim to prevent whitespace-only entries)
    const basicFieldsFilled = bookingData.name.trim() && 
                             bookingData.email.trim() && 
                             bookingData.phone.trim() && 
                             bookingData.guests && 
                             bookingData.date.trim() && 
                             bookingData.purpose.trim() && 
                             bookingData.time.trim();
    
    if (!basicFieldsFilled) return false;
    
    // Check organization-specific fields if Organization package is selected
    if (selectedPackage?.name === 'Organization & Institutional Tour') {
      if (!bookingData.schoolOrOrganizationName.trim()) return false;
    }
    
    // Check if "Other" purpose requires additional field
    if (bookingData.purpose === 'Other' && !bookingData.otherPurpose.trim()) {
      return false;
    }
    
    return true;
  };

    const TEST_MODE = String(process.env.REACT_APP_TEST_MODE).toLowerCase() === 'true';
      
      // Removed local generation of permission letter; handled by email after verification

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPackage) {
      toast.error('Please select a tour package');
      return;
    }
    if (!agreedToProtocols) {
      toast.error('Please agree to the Casa Hacienda protocols');
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
    if (!bookingData.time) {
      toast.error('Please select a preferred time');
      return;
    }
    if (!bookingData.purpose) {
      toast.error('Please select a purpose of visit');
      return;
    }
    if (bookingData.purpose === 'Other' && !bookingData.otherPurpose.trim()) {
      toast.error('Please specify your purpose of visit');
      return;
    }

    setIsSubmitting(true);

    // Check daily booking limits before proceeding
    try {
      const tourType = selectedPackage.name === 'Small Group Tour' ? 'smallGroupTour' : 'organizationTour';
      const limitCheck = await bookingSettingsService.checkDailyBookingLimit(tourType, bookingData.date);
      
      if (!limitCheck.allowed && !limitCheck.error) {
        toast.error(`Sorry, the ${selectedPackage.name} is fully booked for ${bookingData.date}. Only ${limitCheck.limit} bookings are allowed per day.`);
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Error checking daily booking limit:', error);
      // Continue with booking if limit check fails - don't block legitimate bookings
    }

    try {
      // Duplicate check before doing anything
      try {
        const hasActive = await bookingService.hasActiveBooking(bookingData.email);
        if (hasActive) {
          const message = 'This email already has an ongoing booking. You can submit a new booking with this email after your previously selected date and time has passed.';
          toast.error(message);
          setDuplicateMessage(message);
          setShowVerificationModal(false);
          return;
        }
      } catch (dupErr) {
        // If duplicate check fails silently proceed to avoid blocking legitimate bookings
        console.warn('Duplicate check failed:', dupErr);
      }

      // Prepare booking data
      const bookingDataToSubmit = {
        ...bookingData,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        packageDuration: selectedPackage.duration,
        totalPrice: selectedPackage.price,
        attachments: [],
        agreedToProtocols: true,
        effectivePurpose: bookingData.purpose === 'Other' ? bookingData.otherPurpose : bookingData.purpose,
        status: 'pending_email_verification',
        emailVerified: false
      };
      
      if (selectedPackage.name === 'Organization & Institutional Tour') {
        bookingDataToSubmit.schoolOrOrganizationName = bookingData.schoolOrOrganizationName;
      }

      if (TEST_MODE) {
        // Testing mode: send verification email and show success message
        await sendBookingVerificationEmail(bookingDataToSubmit);
        toast.success('Booking verification email sent (Test Mode). Please check your email and click the verification link.');
        setShowVerificationModal(true);
        
        // Reset reCAPTCHA
        resetRecaptcha();
      } else {
        // Production: upload attachments first, then send verification email
        let attachments = [];
        if (bookingSettings?.attachmentsEnabled && attachedFiles.length > 0) {
          const now = Date.now();
          const uploads = attachedFiles.map(async (file, index) => {
            const path = `booking-attachments/${now}-${index}-${file.name}`;
            const ref = storageRef(storage, path);
            await uploadBytes(ref, file);
            const url = await getDownloadURL(ref);
            return {
              name: file.name,
              url,
              size: file.size,
              contentType: file.type || 'application/octet-stream'
            };
          });
          attachments = await Promise.all(uploads);
        }

        // Store booking data temporarily and send verification email
        await sendBookingVerificationEmail({ ...bookingDataToSubmit, attachments });
        toast.success('Booking verification email sent! Please check your email and click the verification link to complete your booking.');
        setShowVerificationModal(true);
        
        // Reset reCAPTCHA
        resetRecaptcha();
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to send booking verification email
  const sendBookingVerificationEmail = async (bookingData) => {
    // Store booking data temporarily in localStorage
    localStorage.setItem('pendingBookingDraft', JSON.stringify({
      bookingData,
      selectedPackage
    }));
    localStorage.setItem('pendingBookingEmail', bookingData.email);

    // Send Firebase email verification link
    const actionCodeSettings = {
      url: `${window.location.origin}/firebase-action`,
      handleCodeInApp: true
    };
    
    await sendSignInLinkToEmail(auth, bookingData.email, actionCodeSettings);
  };

  // Show loading state while checking settings
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5d9c59] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking system...</p>
        </div>
      </div>
    );
  }

  // Show maintenance mode if active
  if (maintenanceStatus?.inMaintenance) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              Booking System Maintenance
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto drop-shadow-lg"
            >
              We're currently performing system maintenance
            </motion.p>
          </div>
        </section>

        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Under Maintenance</h2>
              <p className="text-gray-600 mb-6">
                {maintenanceStatus.message || 'The booking system is temporarily under maintenance. Please try again later.'}
              </p>
              {maintenanceStatus.endTime && (
                <p className="text-sm text-gray-500">
                  Expected to resume: {new Date(maintenanceStatus.endTime).toLocaleString()}
                </p>
              )}
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Need immediate assistance?</span> Contact us at
                  {' '}<a href="tel:+63468869707" className="text-primary-600 hover:underline">(046) 886 9707</a>
                  {' '}or{' '}
                  <a href="mailto:tourismoffice886@gmail.com" className="text-primary-600 hover:underline">tourismoffice886@gmail.com</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            Book Your Tour
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto drop-shadow-lg"
          >
            Choose from our carefully curated tour packages and experience the best of Rosario, Cavite
          </motion.p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Tour Packages */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tour Options</h2>
            
                          {packages.map((pkg, index) => {
                const tourType = pkg.name === 'Small Group Tour' ? 'smallGroupTour' : 'organizationTour';
                const limitStatus = dailyLimits[tourType];
                const isFullyBooked = !limitStatus.allowed && limitStatus.limit !== null;
                
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-white rounded-lg p-6 shadow-sm border-2 transition-all ${
                      isFullyBooked 
                        ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-75' 
                        : selectedPackage?.id === pkg.id 
                          ? 'border-primary-500 bg-primary-50 cursor-pointer' 
                          : 'border-gray-200 hover:border-primary-300 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isFullyBooked) {
                        setSelectedPackage(pkg);
                        // Adjust guest count if switching to a package with lower limits
                        if (!pkg.hasNoLimit && bookingData.guests > (pkg.maxGuests || 20)) {
                          setBookingData({
                            ...bookingData,
                            guests: pkg.maxGuests || 20
                          });
                        }
                      }
                    }}
                  >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{pkg.price}</div>
                    {pkg.showPerPerson && (
                      <div className="text-sm text-gray-500">per person</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {pkg.hasNoLimit ? (
                      <span>No guest limit</span>
                    ) : (
                      <span>Max {pkg.maxGuests} guests</span>
                    )}
                  </div>
                </div>

                {/* Destinations removed as per request */}

                {pkg.prerequisites && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prerequisites:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {pkg.prerequisites.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Booking Availability Status */}
                {bookingData.date && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {isFullyBooked ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Fully Booked for {new Date(bookingData.date).toLocaleDateString()}
                        </span>
                      </div>
                    ) : limitStatus.limit !== null ? (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Available</span>
                        </div>
                        <span className="text-gray-600">
                          {limitStatus.remaining} of {limitStatus.limit} slots remaining
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Available (No daily limit)</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
                );
              })}
          </div>

          {/* Booking Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm sticky top-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Book Your Tour</h2>
              
              {selectedPackage ? (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Selected Option:</h3>
                  <p className="text-primary-600 font-medium">{selectedPackage.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.price}
                    {selectedPackage.showPerPerson ? ' per person' : ''}
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">Please select a tour package to continue</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                

                

                {/* Contact info first */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    required
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                                                                    {/* Date, Time, Guests, and Purpose - 2x2 Grid */}
                 <div className="grid grid-cols-2 gap-4">
                   {/* Number of Guests */}
                   <div>
                     <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                       Number of Guests <span className="text-red-500">*</span>
                     </label>
                     <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                       <button
                         type="button"
                         onClick={() => {
                           const newValue = bookingData.guests - 1;
                           if (newValue < 1) return;
                           setBookingData({ ...bookingData, guests: newValue });
                         }}
                         className="flex-shrink-0 w-10 py-3 text-gray-500 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors rounded-l-lg border-r border-gray-300 flex items-center justify-center"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                         </svg>
                       </button>
                       <input
                         type="number"
                         id="guests"
                         min={1}
                         max={selectedPackage?.hasNoLimit ? undefined : (selectedPackage?.maxGuests || 20)}
                         required
                         value={bookingData.guests}
                         onChange={(e) => {
                           const value = parseInt(e.target.value);
                           let newValue = value;
                           
                           // Enforce minimum of 1
                           if (Number.isNaN(value) || value < 1) {
                             newValue = 1;
                           }
                           // Enforce maximum only for packages with limits
                           else if (!selectedPackage?.hasNoLimit && value > (selectedPackage?.maxGuests || 20)) {
                             newValue = selectedPackage?.maxGuests || 20;
                           }
                           
                           setBookingData({
                             ...bookingData,
                             guests: newValue
                           });
                         }}
                         className="flex-1 min-w-0 px-2 py-3 text-center font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                         placeholder="1"
                       />
                       <button
                         type="button"
                         onClick={() => {
                           const newValue = bookingData.guests + 1;
                           if (!selectedPackage?.hasNoLimit && newValue > (selectedPackage?.maxGuests || 20)) return;
                           setBookingData({ ...bookingData, guests: newValue });
                         }}
                         className="flex-shrink-0 w-10 py-3 text-gray-500 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors rounded-r-lg border-l border-gray-300 flex items-center justify-center"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                         </svg>
                       </button>
                     </div>
                   </div>

                   {/* Preferred Date */}
                   <div>
                     <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                       Preferred Date <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="date"
                       id="date"
                       required
                       onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                       value={bookingData.date || ''}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                     />
                   </div>

                   {/* Purpose of Visit */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Purpose of Visit <span className="text-red-500">*</span>
                     </label>
                     <select
                       id="purpose"
                       required
                       value={bookingData.purpose}
                       onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value, otherPurpose: '' })}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                     >
                       <option value="" disabled>Select a purpose</option>
                       <option value="Event">Event</option>
                       <option value="Field Trip">Field Trip</option>
                       <option value="Interview">Interview</option>
                       <option value="Ocular Visit">Ocular Visit</option>
                       <option value="Vlog/Video">Vlog/Video</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>

                   {/* Preferred Time */}
                   <div>
                     <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                       Preferred Time <span className="text-red-500">*</span>
                     </label>
                     <div className="relative">
                       <select
                         id="time"
                         required
                         value={bookingData.time}
                         onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 appearance-none cursor-pointer"
                       >
                         <option value="" disabled>Select a time</option>
                         <option value="08:00 AM">08:00 AM</option>
                         <option value="09:00 AM">09:00 AM</option>
                         <option value="10:00 AM">10:00 AM</option>
                         <option value="11:00 AM">11:00 AM</option>
                         <option value="01:00 PM">01:00 PM</option>
                         <option value="02:00 PM">02:00 PM</option>
                         <option value="03:00 PM">03:00 PM</option>
                         <option value="04:00 PM">04:00 PM</option>
                       </select>
                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                       </div>
                     </div>
                   </div>
                 </div>

                {/* Organization option details (shown only when Organization & Institutional Tour is selected) */}
                {selectedPackage?.name === 'Organization & Institutional Tour' && (
                    <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">School/Organization Name</label>
                          <input
                            type="text"
                       value={bookingData.schoolOrOrganizationName}
                       onChange={(e) => setBookingData({ ...bookingData, schoolOrOrganizationName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                       placeholder="Enter school or organization name"
                          required
                        />
                      </div>
                )}

                {bookingData.purpose === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      value={bookingData.otherPurpose}
                      onChange={(e) => setBookingData({ ...bookingData, otherPurpose: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your purpose"
                      required
                    />
                  </div>
                )}

                {bookingSettings?.specialRequestsEnabled && (
                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="specialRequests"
                      rows="4"
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                )}

                {/* Attachments */}
                {bookingSettings?.attachmentsEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Documents (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                      onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {attachedFiles.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {attachedFiles.length} file(s) selected
                      </div>
                    )}
                  </div>
                )}

                {/* Protocols intro emphasis */}
                <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-gray-800">
                  <h4 className="font-semibold text-gray-900 mb-2">Please read before you agree</h4>
                  <p className="text-sm mb-2">
                    CASA HACIENDA DE TEJEROS is one of the Historical Places in the Country. This is where the First
                    Election was held to establish the Philippine Revolutionary Government. The place where democracy
                    begins for the Philippines.
                  </p>
                  <p className="text-sm mb-2">
                    The original Casa Hacienda did not survive the years of turmoil in the country, so a new structure has
                    been built to commemorate the original Casa Hacienda. That's why it is open to Educational Tours, Visits, Photo Shoots and the like as part of the Revival to
                    promote its Historical Value and Heritage.
                  </p>
                  <p className="text-sm">
                    In this connection, the following Rules and Regulations are stipulated for the compliance and proper
                    guidance.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowProtocolModal(true)}
                      className="text-primary-700 font-medium hover:underline"
                    >
                      View protocols
                    </button>
                  </div>
                </div>

                {/* Protocol agreement */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    id="protocols"
                    type="checkbox"
                    className="mt-1 h-5 w-5 text-primary-600 border-gray-300 rounded"
                    checked={agreedToProtocols}
                    onChange={(e) => setAgreedToProtocols(e.target.checked)}
                    required
                  />
                  <label htmlFor="protocols" className="text-sm text-gray-700">
                    I agree to the Casa Hacienda de Tejeros protocols.
                  </label>
                </div>

                {selectedPackage && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Option:</span>
                        <span>{selectedPackage.name}</span>
                      </div>
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span>{bookingData.date || '-'} {bookingData.time ? `• ${bookingData.time}` : ''}</span>
                        </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span>{selectedPackage.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of guests:</span>
                        <span>{bookingData.guests}</span>
                      </div>
                      <div className="border-t pt-2 font-medium">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>{selectedPackage.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* reCAPTCHA */}
                <div className="space-y-3 mb-6">
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
                    {!isBookingFormValid() && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please complete all required fields, agree to protocols, and verify reCAPTCHA to proceed
                      </p>
                    )}
                  </div>
                </div>

                 {duplicateMessage && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                     <Mail className="w-8 h-8 text-red-600 mx-auto mb-2" />
                     <h3 className="text-lg font-semibold text-red-800 mb-2">Duplicate Booking Detected</h3>
                     <p className="text-red-700 mb-4">{duplicateMessage}</p>
                   </div>
                 )}

                 {!duplicateMessage && (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isBookingFormValid()}
                    className={`w-full btn-primary py-3 text-lg font-medium transition-all duration-200 ${
                      isSubmitting || !isBookingFormValid()
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:transform hover:scale-[1.02]'
                    }`}
                  >
                    {isSubmitting ? 'Processing Booking...' : 'Book Now'}
                  </button>
                )}
              </form>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Need help?</span> Contact us at
                  {' '}<a href="tel:+63468869707" className="text-primary-600 hover:underline">(046) 886 9707</a>
                  {' '}or{' '}
                  <a href="mailto:tourismoffice886@gmail.com" className="text-primary-600 hover:underline">tourismoffice886@gmail.com</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Protocols Modal */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProtocolModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
            <div className="relative mb-4">
              <h3 className="text-xl font-bold text-gray-900 text-center w-full">Casa Hacienda de Tejeros Protocol</h3>
              <button
                type="button"
                onClick={() => setShowProtocolModal(false)}
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-2 mt-4">
                <li>
                  Casa Hacienda is open on Mondays to Fridays at 8 AM - 5 PM. But, can be opened on
                  Saturdays/Sundays/Holidays as per request.
                </li>
                <li>
                  Proper Attire e.g School/Office Uniform, Casual should be observed.
                  <br />
                  No wearing of shorts, sleeveless, sandals, sportswear, slippers are allowed for the visit.
                </li>
                <li>Observe cleanliness and orderliness at all times; No Littering; No Loitering, too.</li>
                <li>Observe proper decorum during the visit.</li>
                <li>There are toilets available; Male/Female; Please use it properly.</li>
                <li>You're not allowed to enter the "TUNNEL" nor touch any items on display.</li>
                <li>
                  Since, CASA HACIENDA is under the on-going renovations, going to the 2nd floor, 3rd floor, Roof top
                  and basement is strictly prohibited.
                </li>
                <li>You can use the vicinity in front of it for Parking purposes.</li>
                <li>
                  Likewise, the Back part of the place where Canas River is located is ALSO prohibited for security
                  reason.
                </li>
                <li>
                  The Information Desk serves as the Inquiries site and Brochure Display Area. Also, the Municipal
                  Publication "Ang Dagat at Panulat-Mayor's Ricaf Corner is there.
                </li>
                <li>
                  The Municipal Tourism Office is located at the Ground Floor where Mr. Ruben R. Quinto, Municipal
                  Tourism Officer performs his tasks and other matters. This is where you will be entertained for
                  reservation and other queries.
                </li>
                <li>
                  For Reservations: Please submit the following
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Letter of Permission(encoded) (two copies) address to Mr. Ruben R. Quinto</li>
                    <li>Authorization from the School Officials et.al.</li>
                    <li>Inform/Set the schedule intended to visit</li>
                  </ul>
                  <p className="mt-2">
                    II. Or Through: email <span className="underline">tourismoffice886@gmail.com</span>, text message/or
                    call at (046) 886 9707
                  </p>
                </li>
                <li>No excuses on nearby towns/proximity regarding the protocol on Reservation.</li>
                <li>
                  Other visitors such as Foreigners, Walk-in coming from Manila or near far places are allowed on the
                  unexpected schedule of visitations for humanitarian reasons
                </li>
                <li>
                  CASA HACIENDA DE TEJEROS is no longer use as venue for parties, practices and unpermitted assemblies.
                  ONLY: Municipal Meetings, Organizations, Schools and others related to History, Heritage, respective
                  function per se. STILL, submit a Letter of Permission for its use/Follow the Protocol.
                </li>
                <li>
                  The façade of the Casa Hacienda de Tejeros (within the vicinity) has benches; also serves as an open
                  park, open to public consumption, but still, please follow the protocol: seek permission inside.
                  Municipal Tourism Office. NOT AVAILABLE FOR PARKING (privately), PLEASE...
                </li>
                <li>
                  CASA HACIENDA DE TEJEROS is closely supervised under the LGU-Rosario, Office of the Mayor and
                  Municipal Tourism Office.
                </li>
              </ol>

              <p className="mt-4">We hope you find the aforementioned items in order.</p>
              <p>Thank You.</p>
              <div className="text-center">
                <p className="font-semibold m-0 leading-tight">RUBEN R. QUINTO</p>
                <p className="m-0 leading-tight">Municipal Tourism Officer</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowProtocolModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verification Required</h3>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <strong>{bookingData.email}</strong>. 
                Please check your email and click the verification link to complete your booking.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you don't see the email, check your spam folder. The verification link will expire in 24 hours.
              </p>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="w-full btn-primary py-2 px-4 rounded-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Your booking has been successfully confirmed. 
              </p>
              <p className="text-gray-600 mb-6">
                Please check your email for your permission letter and visit details. This letter is required for your visit to Casa Hacienda de Tejeros.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form data
                  setSelectedPackage(null);
                  setBookingData({
                    date: '',
                    time: '',
                    guests: 1,
                    name: '',
                    email: '',
                    phone: '',
                    specialRequests: '',
                    purpose: '',
                    otherPurpose: '',
                    schoolOrOrganizationName: ''
                  });
                  setRecaptchaToken(null);
                  setAgreedToProtocols(false);
                  setDuplicateMessage('');
                  resetRecaptcha();
                }}
                className="w-full btn-primary py-2 px-4 rounded-lg"
              >
                Book Another Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking; 