/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest, onCall} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Cloud Function to verify reCAPTCHA token
 * Frontend sends: { token: "recaptcha_token_here" }
 * Returns: { success: true/false, ... }
 */
exports.verifyRecaptcha = onCall(async (data, context) => {
  try {
    const { token } = data;
    
    if (!token) {
      throw new Error('reCAPTCHA token is required');
    }

    // Get reCAPTCHA secret key from environment variables
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!RECAPTCHA_SECRET_KEY) {
      logger.error('RECAPTCHA_SECRET_KEY environment variable is not set');
      throw new Error('Server configuration error');
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
    
    logger.info('Google reCAPTCHA verification result:', result);

    // Return the verification result
    return {
      success: result.success,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
      error_codes: result['error-codes'] || [],
      raw: result
    };

  } catch (error) {
    logger.error('Error verifying reCAPTCHA:', error);
    throw new Error('Failed to verify reCAPTCHA');
  }
});
