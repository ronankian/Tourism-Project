# reCAPTCHA v2 Setup Guide

This guide will help you set up Google reCAPTCHA v2 for your tourism website to protect against spam and bot submissions. The implementation now follows the [official Google reCAPTCHA v2 documentation](https://developers.google.com/recaptcha/docs/display).

## ✅ Current Implementation Status

### 1. **Contact Form** (`src/pages/Contact.js`)

- ✅ reCAPTCHA v2 with explicit rendering
- ✅ Follows official Google implementation
- ✅ **Development Mode**: Simulated server-side verification
- ✅ **Production Ready**: Backend integration example provided
- ✅ Comprehensive spam protection:
  - Honeypot field for bot detection
  - Rate limiting (30 seconds between submissions)
  - Email validation against disposable domains
  - Content filtering for spam keywords
  - Form validation and error handling

### 2. **Admin Login** (`src/pages/AdminLogin.js`)

- ✅ reCAPTCHA v2 with explicit rendering
- ✅ **Development Mode**: Simulated server-side verification
- ✅ **Production Ready**: Backend integration example provided
- ✅ Resets on failed login attempts
- ✅ Proper error handling and user feedback

### 3. **Booking Form** (`src/pages/Booking.js`)

- ✅ reCAPTCHA v2 with explicit rendering
- ✅ **Development Mode**: Simulated server-side verification
- ✅ **Production Ready**: Backend integration example provided
- ✅ Integrated with booking validation

## 🔧 Setup Required

### Step 1: Create Environment File

Create a `.env.local` file in your project root with:

```env
# reCAPTCHA Configuration
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
REACT_APP_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Other existing environment variables...
```

**Note**: Use `.env.local` instead of `.env` for React development as it has higher priority and won't be committed to version control.

### Step 2: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Create a new site with:
   - **reCAPTCHA v2**
   - **"I'm not a robot" Checkbox**
3. Add your domains:
   - Development: `localhost`, `127.0.0.1`
   - Production: `your-domain.com`
4. Copy the **Site Key** and add it to your `.env` file

## 🚀 Implementation Details

### How It Works

The implementation follows the [official Google reCAPTCHA v2 documentation](https://developers.google.com/recaptcha/docs/display) using **explicit rendering**:

1. **Script Loading**: Dynamically loads the reCAPTCHA script with explicit rendering
2. **Widget Rendering**: Uses `grecaptcha.render()` method to create the widget
3. **Callback Handling**: Implements proper callback functions for success, expiration, and errors
4. **Reset Functionality**: Provides clean reset functionality for failed attempts
5. **Server-Side Verification**: Simulated in development, requires backend in production

### ⚠️ Important: CORS and Server-Side Verification

**The reCAPTCHA verification must be done on your backend server, not in the frontend.** This is because:

- **CORS Policy**: Browsers block direct requests from frontend to Google's verification API
- **Security**: The secret key should never be exposed in frontend code
- **Best Practice**: Google recommends server-side verification

**Current Implementation:**

- ✅ **Development**: Simulated verification for testing
- ✅ **Production**: Requires backend server (see `BACKEND_RECAPTCHA_EXAMPLE.js`)

### Key Features

#### ✅ Explicit Rendering

```javascript
// Load reCAPTCHA script with explicit rendering
useEffect(() => {
  const script = document.createElement("script");
  script.src =
    "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}, []);
```

#### ✅ Widget Configuration

```javascript
window.grecaptcha.render(recaptchaRef.current, {
  sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  theme: "light",
  callback: handleRecaptchaChange,
  "expired-callback": handleRecaptchaExpired,
  "error-callback": handleRecaptchaError,
});
```

#### ✅ HTML Structure

```html
<div
  ref="{recaptchaRef}"
  className="g-recaptcha"
  data-sitekey="{process.env.REACT_APP_RECAPTCHA_SITE_KEY}"
  data-theme="light"
  data-callback="handleRecaptchaChange"
  data-expired-callback="handleRecaptchaExpired"
  data-error-callback="handleRecaptchaError"
></div>
```

## 🔒 Security Features

### Contact Form Protection:

- ✅ reCAPTCHA v2 verification
- ✅ Honeypot field (hidden from users, visible to bots)
- ✅ Rate limiting (30 seconds between submissions)
- ✅ Email validation (blocks disposable emails)
- ✅ Content filtering (blocks spam keywords)
- ✅ Form validation and error handling

### Admin Login Protection:

- ✅ reCAPTCHA v2 verification
- ✅ Resets on failed attempts
- ✅ Proper error handling
- ✅ Secure passkey authentication

### Booking Form Protection:

- ✅ reCAPTCHA v2 verification
- ✅ Integrated with booking validation
- ✅ Prevents spam bookings

## 📝 Testing Instructions

### Step 1: Environment Setup

1. Create `.env.local` file with your reCAPTCHA site key
2. Restart your development server: `npm start`

### Step 2: Test reCAPTCHA Verification

1. **Development Mode Testing:**

   - Submit any form with reCAPTCHA
   - Check console for: `🔍 Development Mode: Simulating reCAPTCHA verification`
   - Should see: `✅ Development: reCAPTCHA verification simulated successfully`

2. **Production Mode (when you have a backend):**
   - Implement backend verification (see `BACKEND_RECAPTCHA_EXAMPLE.js`)
   - Update `src/utils/recaptchaVerification.js` to use actual API calls

### Step 3: Test Each Form

1. **Contact Form** (`/contact`):

   - Fill out the form
   - Complete reCAPTCHA verification
   - Submit and verify email is sent

2. **Admin Login** (`/admin-login`):

   - Enter admin passkey
   - Complete reCAPTCHA verification
   - Verify successful login

3. **Booking Form** (`/booking`):
   - Fill out booking details
   - Complete reCAPTCHA verification
   - Verify verification email is sent

### Step 4: Error Testing

- Test expired reCAPTCHA (wait 2 minutes)
- Test network errors (disconnect internet)
- Test failed submissions (wrong passkey, invalid email)

## 🛠️ Troubleshooting

### Common Issues:

1. **"reCAPTCHA not loading"**

   - Check if `REACT_APP_RECAPTCHA_SITE_KEY` is set in `.env.local`
   - Verify domain is added to reCAPTCHA console
   - Check browser console for script loading errors

2. **"Invalid site key"**

   - Ensure using correct key for environment (dev/prod)
   - Verify domain matches reCAPTCHA console settings

3. **"Callback not working"**

   - Check if callback functions are properly defined
   - Verify script loading order

4. **"CORS error when verifying reCAPTCHA"**

   - This is expected in development - verification is simulated
   - In production, implement backend verification (see `BACKEND_RECAPTCHA_EXAMPLE.js`)
   - Never make direct frontend calls to Google's verification API

### Debug Steps:

1. Open browser developer tools
2. Check Console tab for errors
3. Check Network tab for script loading
4. Verify environment variables are loaded

## 📊 Monitoring

### reCAPTCHA Analytics:

- Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- Monitor verification success rates
- Check for suspicious activity patterns

### Performance Monitoring:

- Monitor form submission success rates
- Track user experience metrics
- Check for any accessibility issues

## 🔄 Maintenance

### Regular Tasks:

1. **Monthly**: Review reCAPTCHA analytics
2. **Quarterly**: Update spam keyword lists
3. **Annually**: Review and update security measures

### Updates:

- Keep reCAPTCHA implementation up to date
- Monitor for new spam patterns
- Update validation rules as needed

## 📚 Additional Resources

- [Official Google reCAPTCHA v2 Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA Language Codes](https://developers.google.com/recaptcha/docs/language)

---

**Security Note**: This implementation provides multiple layers of protection against spam and malicious submissions while maintaining good user experience. The explicit rendering approach ensures better control and customization options as recommended by Google's official documentation.
