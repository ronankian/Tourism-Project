# Firebase Email Setup Guide

This guide will help you set up automatic email notifications for your booking system using Firebase Extensions.

## Prerequisites

1. Firebase project with Firestore enabled
2. Gmail account (tourismoffice886@gmail.com)
3. Firebase CLI installed

## Step 1: Enable Firebase Extensions

1. Go to your Firebase Console: https://console.firebase.google.com
2. Select your project: `rosariotourismofficial`
3. Navigate to Extensions in the left sidebar
4. Click "Get started" or "Browse the catalog"

## Step 2: Install the Trigger Email Extension

1. Search for "Trigger Email" in the Extensions catalog
2. Click on "Trigger Email" by Firebase
3. Click "Install in Firebase project"
4. Choose your project and click "Continue"

## Step 3: Configure the Extension

1. **Instance ID**: Leave as default or use `firestore-send-email`
2. **SMTP Connection URI**: 
   ```
   smtps://tourismoffice886@gmail.com:your-app-password@smtp.gmail.com:587
   ```
3. **SMTP Password**: Your Gmail App Password (see Step 4)
4. **Default From**: `tourismoffice886@gmail.com`
5. **Default Reply To**: `tourismoffice886@gmail.com`
6. **Location**: `us-central1`
7. **Collections**: Leave as default (`emails`)

## Step 4: Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Name it "Firebase Tourism Website"
7. Copy the generated 16-character password
8. Use this password in the SMTP Password field above

## Step 5: Update Firebase Configuration

Update your `firebase.json` file with the correct credentials:

```json
{
  "extensions": {
    "firestore-send-email": {
      "SMTP_CONNECTION_URI": "smtps://tourismoffice886@gmail.com:YOUR_APP_PASSWORD@smtp.gmail.com:587",
      "SMTP_PASSWORD": "YOUR_APP_PASSWORD",
      "DEFAULT_FROM": "tourismoffice886@gmail.com",
      "DEFAULT_REPLY_TO": "tourismoffice886@gmail.com",
      "LOCATION": "us-central1"
    }
  }
}
```

Replace `YOUR_APP_PASSWORD` with the actual app password from Step 4.

## Step 6: Deploy the Extension

```bash
firebase deploy --only extensions
```

## Step 7: Test the Email System

1. Create a test booking through your website
2. Check if verification email is sent
3. Verify the booking through the email link
4. Test admin approval/rejection emails

## Email Templates

The system automatically sends these emails:

### 1. Booking Verification Email
- **Trigger**: When a new booking is created
- **Content**: Email verification link for the booking

### 2. Booking Confirmation Email
- **Trigger**: When booking email is verified
- **Content**: Confirmation that booking is under review

### 3. Booking Approval Email
- **Trigger**: When admin approves a booking
- **Content**: Approval confirmation with tour details

### 4. Booking Rejection Email
- **Trigger**: When admin rejects a booking
- **Content**: Rejection notice with optional reason

### 5. Tour Completion Email
- **Trigger**: When admin marks tour as completed
- **Content**: Thank you message and feedback request

## Troubleshooting

### Common Issues:

1. **Emails not sending**
   - Check Gmail App Password is correct
   - Verify SMTP settings
   - Check Firebase Extension logs

2. **Authentication errors**
   - Ensure 2-Step Verification is enabled
   - Regenerate App Password if needed
   - Check Gmail account security settings

3. **Extension deployment fails**
   - Verify Firebase CLI is up to date
   - Check project permissions
   - Ensure billing is enabled (required for Extensions)

### Checking Extension Logs:

1. Go to Firebase Console
2. Navigate to Extensions
3. Click on your Trigger Email extension
4. Go to "Logs" tab
5. Check for any error messages

## Security Notes

- Never commit your Gmail App Password to version control
- Use environment variables in production
- Regularly rotate your App Password
- Monitor email sending limits (Gmail: 500/day for free accounts)

## Cost Considerations

- Firebase Extensions: Free tier available
- Gmail SMTP: Free for up to 500 emails/day
- Firestore: Free tier includes 50,000 reads/day

## Support

If you encounter issues:
1. Check Firebase Extension documentation
2. Review Gmail SMTP settings
3. Check Firebase Console logs
4. Contact Firebase support if needed

## Next Steps

After setup:
1. Test the complete booking flow
2. Customize email templates if needed
3. Set up email monitoring
4. Configure backup email service if needed
