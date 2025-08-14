/**
 * FIREBASE CLOUD FUNCTIONS EXAMPLE
 * 
 * This shows how to implement reCAPTCHA verification using Firebase Cloud Functions.
 * You would deploy this to Firebase Functions, not include it in your React app.
 */

// Example Firebase Cloud Function for reCAPTCHA verification
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Your reCAPTCHA secret key (store this in Firebase environment variables)
const RECAPTCHA_SECRET_KEY = functions.config().recaptcha.secret_key;

/**
 * Cloud Function to verify reCAPTCHA token
 * 
 * To deploy this:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize Firebase Functions: firebase init functions
 * 3. Add this code to functions/index.js
 * 4. Set secret: firebase functions:config:set recaptcha.secret_key="your_secret_key"
 * 5. Deploy: firebase deploy --only functions
 */
exports.verifyRecaptcha = functions.https.onCall(async (data, context) => {
  try {
    const { token } = data;
    
    if (!token) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'reCAPTCHA token is required'
      );
    }

    // Create form data for Google's verification API
    const formData = new URLSearchParams();
    formData.append('secret', RECAPTCHA_SECRET_KEY);
    formData.append('response', token);

    // Make POST request to Google's verification API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.json();
    
    console.log('Google reCAPTCHA verification result:', result);

    // Return the verification result
    return {
      success: result.success,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
      error_codes: result['error-codes'] || [],
      raw: result
    };

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify reCAPTCHA'
    );
  }
});

/**
 * Example Cloud Function for contact form submission with reCAPTCHA
 */
exports.submitContactForm = functions.https.onCall(async (data, context) => {
  try {
    const { name, email, subject, message, recaptchaToken } = data;
    
    // First verify the reCAPTCHA token
    const recaptchaFormData = new URLSearchParams();
    recaptchaFormData.append('secret', RECAPTCHA_SECRET_KEY);
    recaptchaFormData.append('response', recaptchaToken);

    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: recaptchaFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'reCAPTCHA verification failed'
      );
    }

    // If reCAPTCHA is valid, save to Firestore
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp();
    }

    const db = admin.firestore();
    
    // Save contact form submission to Firestore
    await db.collection('contact_submissions').add({
      name,
      email,
      subject,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      recaptchaVerified: true
    });

    // You could also send email here using Firebase Admin SDK
    // or integrate with EmailJS from the Cloud Function

    return {
      success: true,
      message: 'Contact form submitted successfully'
    };

  } catch (error) {
    console.error('Error processing contact form:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to process contact form'
    );
  }
});

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Install Firebase CLI:
 *    npm install -g firebase-tools
 * 
 * 2. Login to Firebase:
 *    firebase login
 * 
 * 3. Initialize Firebase Functions in your project:
 *    firebase init functions
 * 
 * 4. Add the above code to functions/index.js
 * 
 * 5. Set your reCAPTCHA secret key:
 *    firebase functions:config:set recaptcha.secret_key="your_secret_key_here"
 * 
 * 6. Install dependencies:
 *    cd functions
 *    npm install node-fetch
 * 
 * 7. Deploy the functions:
 *    firebase deploy --only functions
 * 
 * 8. Update your frontend to call the Cloud Function:
 *    - Install Firebase SDK: npm install firebase
 *    - Call the function using firebase.functions().httpsCallable()
 */

/**
 * FRONTEND INTEGRATION EXAMPLE:
 * 
 * In your React app, you would call the Cloud Function like this:
 * 
 * import { getFunctions, httpsCallable } from 'firebase/functions';
 * 
 * const functions = getFunctions();
 * const verifyRecaptcha = httpsCallable(functions, 'verifyRecaptcha');
 * 
 * // In your form submission:
 * try {
 *   const result = await verifyRecaptcha({ token: recaptchaToken });
 *   console.log('Verification result:', result.data);
 * } catch (error) {
 *   console.error('Verification failed:', error);
 * }
 */
