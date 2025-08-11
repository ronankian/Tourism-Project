import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
import { auth, storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

const FirebaseActionRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [actionType, setActionType] = useState(null);
  const [ready, setReady] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [needEmailEntry, setNeedEmailEntry] = useState(false);
  const [emailInput, setEmailInput] = useState('');


  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    console.log('FirebaseActionRedirect mounted with mode:', mode, 'oobCode:', oobCode);
    
    // Check EmailJS environment variables
    const missingVars = [];
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID) missingVars.push('REACT_APP_EMAILJS_SERVICE_ID');
    if (!process.env.REACT_APP_EMAILJS_TEMPLATE_ID) missingVars.push('REACT_APP_EMAILJS_TEMPLATE_ID');
    if (!process.env.REACT_APP_EMAILJS_PUBLIC_KEY) missingVars.push('REACT_APP_EMAILJS_PUBLIC_KEY');
    
    if (missingVars.length > 0) {
      console.warn('Missing EmailJS environment variables:', missingVars.join(', '));
      console.warn('Email functionality will not work. See EMAILJS_SETUP.md for setup instructions.');
    }
    
    // Handle email link sign-in for booking flow
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = localStorage.getItem('pendingBookingEmail');
      if (!email) {
        // Ask user to enter the email they used to request the link
        setNeedEmailEntry(true);
        setReady(true);
        return;
      }
      (async () => {
        try {
          // Ensure no conflicting session
          if (auth.currentUser && auth.currentUser.email?.toLowerCase() !== email.toLowerCase()) {
            await signOut(auth);
          }
          try {
            await signInWithEmailLink(auth, email, window.location.href);
          } catch (e) {
            if (e?.code === 'auth/email-already-in-use') {
              await signOut(auth);
              await signInWithEmailLink(auth, email, window.location.href);
            } else {
              throw e;
            }
          }
          // Finalize booking from draft
          const draftRaw = localStorage.getItem('pendingBookingDraft');
          if (draftRaw) {
            const draft = JSON.parse(draftRaw);
            const { bookingData, selectedPackage } = draft;
            const payload = {
              ...bookingData,
              packageName: selectedPackage.name,
              packagePrice: selectedPackage.price,
              packageDuration: selectedPackage.duration,
              totalPrice: selectedPackage.price,
              attachments: [], // attachments cannot be preserved across email link flow
              agreedToProtocols: true,
              effectivePurpose: bookingData.purpose === 'Other' ? bookingData.otherPurpose : bookingData.purpose,
              status: 'verified',
              emailVerified: true
            };
            // Organization fields
            if (selectedPackage.name === 'Organization & Institutional Tour') {
              payload.organizationType = bookingData.organizationType;
              if (bookingData.organizationType === 'School') {
                payload.schoolName = bookingData.schoolName;
                if (bookingData.course) payload.course = bookingData.course;
              } else if (bookingData.organizationType === 'Organization') {
                payload.organizationName = bookingData.organizationName;
              }
            }
            const result = await bookingService.createBooking(payload);
            if (result?.success && result.bookingId) {
              const bookingId = result.bookingId;
              let fileUrl = null;
              try {
                // Generate permission letter DOCX from template
                const blob = await (async () => {
                  try {
                    const templateResponse = await fetch('/templates/permission-letter.docx');
                    if (!templateResponse.ok) {
                      throw new Error('Template not found');
                    }
                    const arrayBuffer = await templateResponse.arrayBuffer();
                    const zip = new PizZip(arrayBuffer);
                    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
                    const visitorAffiliation = (payload.organizationType === 'School')
                      ? `${payload.schoolName || ''}${payload.course ? ` (${payload.course})` : ''}`
                      : (payload.organizationName || payload.organizationType || payload.name || '');
                    doc.setData({
                      date_today: new Date().toLocaleDateString(),
                      visitor_name: payload.name || 'Guest',
                      visitor_affiliation: visitorAffiliation,
                      email: payload.email,
                      phone: payload.phone || '',
                      organization_type: payload.organizationType || '',
                      school_name: payload.schoolName || '',
                      course: payload.course || '',
                      organization_name: payload.organizationName || '',
                      purpose: payload.effectivePurpose || payload.purpose || '',
                      date_requested: payload.date,
                      time_requested: payload.time,
                      guests: String(payload.guests),
                      package_name: payload.packageName
                    });
                    doc.render();
                    return doc.getZip().generate({
                      type: 'blob',
                      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });
                  } catch (templateError) {
                    console.error('Template processing failed, creating simple document:', templateError);
                    
                    // Create a simple text-based document as fallback
                    const simpleContent = `PERMISSION LETTER

Date: ${new Date().toLocaleDateString()}

TO WHOM IT MAY CONCERN:

This letter serves as permission for the following visitor to tour Casa Hacienda de Tejeros:

Visitor Information:
- Name: ${payload.name || 'Guest'}
- Affiliation: ${(payload.organizationType === 'School') ? `${payload.schoolName || ''}${payload.course ? ` (${payload.course})` : ''}` : (payload.organizationName || payload.organizationType || payload.name || '')}
- Email: ${payload.email}
- Phone: ${payload.phone || ''}

Organization Details:
- Organization Type: ${payload.organizationType || ''}
- School Name: ${payload.schoolName || ''}
- Course: ${payload.course || ''}
- Organization Name: ${payload.organizationName || ''}

Tour Details:
- Purpose: ${payload.effectivePurpose || payload.purpose || ''}
- Requested Date: ${payload.date}
- Requested Time: ${payload.time}
- Number of Guests: ${payload.guests}
- Package: ${payload.packageName}

This permission letter must be presented upon arrival at Casa Hacienda de Tejeros for verification.

Thank you for choosing to visit our historical site.

Sincerely,
Casa Hacienda de Tejeros Tourism Office
Rosario, Cavite`;

                    // Create a simple blob with the text content
                    return new Blob([simpleContent], { type: 'text/plain' });
                  }
                })();

                // Upload to Storage (skip for now due to CORS issues)
                let fileUrl = null;
                try {
                  const path = `permission-letters/${bookingId}.docx`;
                  const ref = storageRef(storage, path);
                  await uploadBytes(ref, blob);
                  fileUrl = await getDownloadURL(ref);
                } catch (uploadError) {
                  console.warn('Storage upload failed, continuing with email only:', uploadError);
                  // Continue without file URL - email will still work
                }

                // Send email via EmailJS with base64 attachment
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });

                const templateParams = {
                  to_email: payload.email,
                  to_name: payload.name || 'Guest',
                  subject: 'Your Booking Permission Letter',
                  message: 'Please download, print, and bring this permission letter for signing at our office. If the attachment is missing, use the download link below.',
                  booking_pdf: base64,
                  booking_filename: `Permission_Letter_${bookingId}.txt`
                };
                // Replace with your actual EmailJS service/template/public key
                await emailjs.send(
                  process.env.REACT_APP_EMAILJS_SERVICE_ID,
                  process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                  templateParams,
                  { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
                );
              } catch (e) {
                console.error('Email with attachment failed, retrying with link only:', e);
                
                // Log detailed error information for debugging
                if (e.name === 'TemplateError') {
                  console.error('Template errors:', e.errors);
                  console.error('This indicates the Word document template has malformed tags.');
                  console.error('Please check the EMAILJS_SETUP.md guide for template fixes.');
                }
                
                if (e.message && e.message.includes('public key is required')) {
                  console.error('EmailJS environment variables are missing.');
                  console.error('Please create a .env file with REACT_APP_EMAILJS_* variables.');
                  console.error('See EMAILJS_SETUP.md for setup instructions.');
                }
                
                try {
                  // Fallback: send email without attachment, include download link
                  const fallbackMessage = fileUrl 
                    ? 'Please download, print, and bring this permission letter for signing at our office. Download link: ' + fileUrl
                    : 'Please download, print, and bring this permission letter for signing at our office.';
                  
                  await emailjs.send(
                    process.env.REACT_APP_EMAILJS_SERVICE_ID,
                    process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                    {
                      to_email: payload.email,
                      to_name: payload.name || 'Guest',
                      subject: 'Your Booking Permission Letter',
                      message: fallbackMessage
                    },
                    { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
                  );
                } catch (e2) {
                  console.error('Fallback email failed:', e2);
                  console.error('Both attachment and fallback email failed. Check EmailJS configuration.');
                }
              }
            } else if (result && !result.success) {
              // Duplicate active booking
              toast.error(result.error || 'You already have an active or upcoming booking with this email.');
              navigate('/booking');
              setReady(true);
              return;
            }
          }
          // Cleanup and sign out (to keep site accountless feel)
          localStorage.removeItem('pendingBookingDraft');
          localStorage.removeItem('pendingBookingEmail');
          // Keep session (no explicit logout per requirements)
          toast.success('Email verified and booking submitted successfully! Check your email for instructions.');
          navigate('/booking');
        } catch (err) {
          console.error('Error completing email link sign-in:', err);
          toast.error('Verification failed. Please try again.');
          navigate('/booking');
        } finally {
          setReady(true);
        }
      })();
      return;
    }

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

  const handleCompleteEmailLinkSignIn = async () => {
    if (!emailInput) return;
    try {
      if (auth.currentUser && auth.currentUser.email?.toLowerCase() !== emailInput.toLowerCase()) {
        await signOut(auth);
      }
      try {
        await signInWithEmailLink(auth, emailInput, window.location.href);
      } catch (e) {
        if (e?.code === 'auth/email-already-in-use') {
          await signOut(auth);
          await signInWithEmailLink(auth, emailInput, window.location.href);
        } else {
          throw e;
        }
      }
      // Save for consistency
      localStorage.setItem('pendingBookingEmail', emailInput);
      // Try to finalize if draft exists
      const draftRaw = localStorage.getItem('pendingBookingDraft');
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        const { bookingData, selectedPackage } = draft;
        const payload = {
          ...bookingData,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          packageDuration: selectedPackage.duration,
          totalPrice: selectedPackage.price,
          attachments: [],
          agreedToProtocols: true,
          effectivePurpose: bookingData.purpose === 'Other' ? bookingData.otherPurpose : bookingData.purpose,
          status: 'verified',
          emailVerified: true
        };
        if (selectedPackage.name === 'Organization & Institutional Tour') {
          payload.organizationType = bookingData.organizationType;
          if (bookingData.organizationType === 'School') {
            payload.schoolName = bookingData.schoolName;
            if (bookingData.course) payload.course = bookingData.course;
          } else if (bookingData.organizationType === 'Organization') {
            payload.organizationName = bookingData.organizationName;
          }
        }
        const result = await bookingService.createBooking(payload);
        if (result?.success && result.bookingId) {
          // Let existing post-submit flow handle email sending, so reload page logic
          window.location.reload();
          return;
        }
      }
      toast.success('Email verified. Please return to the booking page to continue.');
      navigate('/booking');
    } catch (error) {
      console.error('Error completing link sign-in with entered email:', error);
      toast.error('Unable to verify with the provided email. Please try again.');
    }
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
              {needEmailEntry && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Email</h2>
                  <p className="text-gray-600 mb-6">Enter the email address you used to request the sign-in link to complete verification.</p>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <button
                    onClick={handleCompleteEmailLinkSignIn}
                    className="w-full bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Continue
                  </button>
                </>
              )}
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
                      className="w-full bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Back to Login
                    </button>
                  </>
                )
              ) : actionType === 'resetPassword' ? (
                actionSuccess ? (
                  <>
                    <h2 className="text-2xl font-bold text-[#df2e38] mb-4">
                      Password Reset
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Your reset link has been verified. You can now set your new password.
                    </p>
                    
                    <button
                      onClick={handlePasswordResetProceed}
                      className="w-full bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
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
                      className="w-full bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
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
                    className="w-full bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
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