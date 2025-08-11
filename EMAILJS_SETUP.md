# EmailJS Setup Guide

This guide will help you set up EmailJS to fix the email attachment issue.

## Problem
The email with document attachment is failing due to:
1. Corrupted Word document template with malformed template tags
2. Missing EmailJS environment variables

## Solution 1: Fix the Template File

### Step 1: Create a New Word Document Template

1. Open Microsoft Word or Google Docs
2. Create a new document with your permission letter content
3. Use these exact template variables (with double curly braces):

```
Date: {{date_today}}
Visitor Name: {{visitor_name}}
Affiliation: {{visitor_affiliation}}
Email: {{email}}
Phone: {{phone}}
Organization Type: {{organization_type}}
School Name: {{school_name}}
Course: {{course}}
Organization Name: {{organization_name}}
Purpose: {{purpose}}
Requested Date: {{date_requested}}
Requested Time: {{time_requested}}
Number of Guests: {{guests}}
Package: {{package_name}}
```

### Step 2: Save the Template

1. Save the document as `permission-letter.docx`
2. Replace the existing file in `public/templates/permission-letter.docx`

## Solution 2: Set up EmailJS

### Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service

1. Go to EmailJS Dashboard: https://dashboard.emailjs.com/admin
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

### Step 3: Create Email Template

1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Design your email template with these variables:
   - `{{to_email}}` - Recipient email
   - `{{to_name}}` - Recipient name
   - `{{subject}}` - Email subject
   - `{{message}}` - Email message
   - `{{booking_pdf}}` - Base64 attachment (automatic)
   - `{{booking_filename}}` - Attachment filename
4. Save the template and note down your **Template ID**

### Step 4: Get Public Key

1. Go to "Account" in the dashboard
2. Copy your **Public Key**

### Step 5: Create Environment File

Create a `.env` file in your project root with:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace the placeholder values with your actual EmailJS credentials.

### Step 6: Restart Development Server

```bash
npm start
```

## Testing

1. Make a test booking
2. Verify the email is sent with attachment
3. Check the console for any remaining errors

## Troubleshooting

### Template Errors
If you still get template errors:
1. Ensure all template variables use double curly braces: `{{variable_name}}`
2. Check for any extra spaces or special characters
3. Verify the Word document is saved in .docx format

### EmailJS Errors
If EmailJS fails:
1. Verify all environment variables are set correctly
2. Check that your EmailJS account is active
3. Ensure your email service is properly configured
4. Check the EmailJS dashboard for any error messages

### Fallback Behavior
The system has a fallback mechanism:
1. If attachment fails, it tries to send email with download link
2. If EmailJS fails, it logs the error but continues with booking creation

## Alternative: Use Firebase Extensions

If EmailJS continues to have issues, you can switch to Firebase Extensions for email:
1. Follow the `FIREBASE_EMAIL_SETUP.md` guide
2. Modify the code to use Firebase Extensions instead of EmailJS
3. This would require server-side email handling

## Security Notes

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Keep your EmailJS credentials secure
- Regularly rotate your API keys
