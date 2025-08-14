/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - The reCAPTCHA response token
 * @returns {Promise<Object>} - Verification result
 */
export const verifyRecaptchaToken = async (token) => {
  try {
    // For development: Simulate verification since CORS blocks direct API calls
    // In production, this should be handled by your backend server
    console.log('🔍 Development Mode: Simulating reCAPTCHA verification');
    console.log('📝 Token received:', token ? 'Valid token received' : 'No token');
    
    // Simulate a successful verification for development
    // In production, replace this with actual backend API call
    const simulatedResult = {
      success: true,
      challenge_ts: new Date().toISOString(),
      hostname: window.location.hostname,
      error_codes: [],
      raw: {
        success: true,
        challenge_ts: new Date().toISOString(),
        hostname: window.location.hostname
      }
    };

    console.log('✅ Development: reCAPTCHA verification simulated successfully');
    console.log('📋 Production Note: Replace this with actual backend verification');
    
    return simulatedResult;

    /* 
    PRODUCTION CODE (uncomment when you have a backend):
    
    // Create form data for POST request
    const formData = new FormData();
    formData.append('secret', process.env.REACT_APP_RECAPTCHA_SECRET_KEY);
    formData.append('response', token);

    // Make POST request to your backend API (not directly to Google)
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();
    console.log('reCAPTCHA verification result:', result);

    return {
      success: result.success,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
      error_codes: result['error-codes'] || [],
      raw: result
    };
    */

  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return {
      success: false,
      error_codes: ['verification-failed'],
      error: error.message
    };
  }
};

/**
 * Check if verification result indicates success
 * @param {Object} verificationResult - Result from verifyRecaptchaToken
 * @returns {boolean} - True if verification was successful
 */
export const isRecaptchaValid = (verificationResult) => {
  return verificationResult.success === true;
};

/**
 * Get human-readable error message from verification result
 * @param {Object} verificationResult - Result from verifyRecaptchaToken
 * @returns {string} - Error message
 */
export const getRecaptchaErrorMessage = (verificationResult) => {
  if (verificationResult.success) {
    return null;
  }

  const errorMessages = {
    'missing-input-secret': 'The secret parameter is missing.',
    'invalid-input-secret': 'The secret parameter is invalid or malformed.',
    'missing-input-response': 'The response parameter is missing.',
    'invalid-input-response': 'The response parameter is invalid or malformed.',
    'bad-request': 'The request is invalid or malformed.',
    'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously.',
    'verification-failed': 'Failed to verify reCAPTCHA. Please try again.'
  };

  for (const errorCode of verificationResult.error_codes) {
    if (errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }
  }

  return 'reCAPTCHA verification failed. Please try again.';
};
