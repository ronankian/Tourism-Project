# reCAPTCHA Setup Guide

This guide will help you set up Google reCAPTCHA v2 for your tourism website to protect against spam and bot submissions.

## Prerequisites

- Google account
- Google Cloud Console access
- Firebase project

## Step 1: Create reCAPTCHA Keys

1. **Go to Google reCAPTCHA Console**
   - Visit: https://www.google.com/recaptcha/admin
   - Sign in with your Google account

2. **Create a New Site**
   - Click "Create" or "+"
   - Choose "reCAPTCHA v2"
   - Select "I'm not a robot" Checkbox
   - Enter your domain(s):
     - For development: `localhost`, `127.0.0.1`
     - For production: `your-domain.com`, `*.your-domain.com`

3. **Configure Additional Settings**
   - **Service Provider**: Choose **Cloud Armor** (recommended for better protection)
   - **Feature**: Choose **Action** (for modern invisible reCAPTCHA experience)
   - **Web Application Firewall (WAF)**: Enable this option
   - **Testing**: Keep OFF for production use

4. **Get Your Keys**
   - **Site Key**: Public key used in your frontend
   - **Secret Key**: Private key used in your backend (Firebase Functions)

## Step 2: Environment Setup

### Frontend Environment Variables

Create a `.env` file in your project root:

```env
# reCAPTCHA Configuration
REACT_APP_RECAPTCHA_SITE_KEY=your_site_key_here

# Other environment variables
REACT_APP_TEST_MODE=false
```

### Backend Environment Variables (Firebase Functions)

Set the secret key in Firebase Functions environment:

```bash
# Using Firebase CLI
firebase functions:config:set recaptcha.secret_key="your_secret_key_here"

# Or using environment variables (recommended for newer Firebase versions)
# Add to functions/.env file:
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Step 3: Deploy Firebase Functions

1. **Initialize Functions (if not already done)**:
   ```bash
   firebase init functions
   ```

2. **Install Dependencies**:
   ```bash
   cd functions
   npm install
   ```

3. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

## Step 4: Update Security Settings

### Firestore Rules
Ensure your Firestore rules validate reCAPTCHA for sensitive operations:

```javascript
// In firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Booking submissions should be validated server-side
    match /bookings/{bookingId} {
      allow create: if request.auth != null 
        && validateBookingData(request.resource.data);
    }
  }
}
```

## Step 5: Integration Points

The reCAPTCHA integration is already implemented in:

### ✅ Booking Form (`src/pages/Booking.js`)
- Protects against spam booking submissions
- Validates before sending verification emails
- Resets on failed attempts

### ✅ Contact Form (`src/pages/Contact.js`)
- Prevents spam contact messages
- Additional anti-spam measures included
- Rate limiting and content filtering

### ✅ Admin Login (`src/pages/AdminLogin.js`)
- Protects admin panel from brute force attacks
- Resets on failed login attempts
- Additional security layer

## Step 6: Testing

### Test in Development
1. Set `REACT_APP_TEST_MODE=true` in your `.env` file
2. Use test keys for localhost testing
3. Verify forms work correctly with reCAPTCHA

### Test in Production
1. Use production keys
2. Test all forms with reCAPTCHA enabled
3. Monitor Firebase Functions logs for verification results

## Security Features

### Client-Side Protection
- Form validation before submission
- Token expiration handling
- User-friendly error messages
- Automatic reset on failed attempts

### Server-Side Verification
- Firebase Functions verify tokens with Google
- IP address validation
- Detailed logging for monitoring
- Additional booking-specific validations

### Additional Security Measures
- Rate limiting on contact forms
- Content filtering for spam keywords
- Honeypot fields for bot detection
- Email validation against disposable domains

## Monitoring and Maintenance

### Check reCAPTCHA Analytics
- Visit Google reCAPTCHA Admin Console
- Monitor verification rates
- Check for suspicious activity
- Adjust security settings as needed

### Firebase Functions Monitoring
```bash
# View function logs
firebase functions:log

# Monitor specific function
firebase functions:log --only verifyRecaptcha
```

### Common Issues and Solutions

1. **"Invalid site key" error**
   - Verify domain is added to reCAPTCHA console
   - Check environment variable is set correctly
   - Ensure using correct key for environment

2. **"Network request failed"**
   - Check internet connectivity
   - Verify Firebase Functions are deployed
   - Check CORS settings

3. **Token expired**
   - Implement automatic token refresh
   - Clear error messages on expiration
   - Reset reCAPTCHA widget

## Best Practices

1. **Keep Keys Secure**
   - Never commit secret keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **User Experience**
   - Provide clear error messages
   - Handle loading states properly
   - Reset on failures

3. **Monitoring**
   - Monitor verification success rates
   - Set up alerts for unusual activity
   - Regular security reviews

## Support

For issues with reCAPTCHA integration:
1. Check Firebase Functions logs
2. Verify environment variables
3. Test with development keys first
4. Contact Google reCAPTCHA support if needed

---

**Security Note**: This implementation provides multiple layers of protection against spam and malicious submissions while maintaining good user experience. Regular monitoring and updates are recommended.
