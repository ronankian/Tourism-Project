# Facebook API Setup Guide

This guide will help you set up the Facebook Graph API integration to fetch posts from the Casa Hacienda de Tejeros Facebook page and display them on your News page.

## Prerequisites

1. Facebook Developer Account
2. Facebook App (to get access tokens)
3. Access to the Casa Hacienda Facebook page (as admin or with permissions)

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in the app details:
   - **App Name**: Casa Hacienda Tourism Website
   - **Contact Email**: tourismoffice886@gmail.com
5. Click "Create App"

## Step 2: Configure the Facebook App

1. In your app dashboard, go to "Settings" → "Basic"
2. Add your domain to "App Domains": `rosariotourismofficial.web.app`
3. Add your website URL: `https://rosariotourismofficial.web.app`
4. Save changes

## Step 3: Get Facebook Page Access Token

### Method 1: Using Facebook Graph API Explorer (Recommended for testing)

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Grant the necessary permissions:
   - `pages_read_engagement`
   - `pages_show_list`
5. Copy the generated access token

### Method 2: Using Facebook Login (For production)

1. In your app dashboard, go to "Products" → "Facebook Login"
2. Click "Set Up"
3. Configure the settings:
   - **Valid OAuth Redirect URIs**: `https://rosariotourismofficial.web.app`
4. Use the Facebook Login SDK to get user access tokens

## Step 4: Get Page Access Token

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Use this endpoint: `GET /me/accounts`
3. Find your page in the results and copy the `access_token`

## Step 5: Test the API

Test the API endpoint with your page ID and access token:

```
GET https://graph.facebook.com/v18.0/61575235395467/posts?fields=id,message,created_time,permalink_url,full_picture,type,likes.summary(true),comments.summary(true)&access_token=YOUR_ACCESS_TOKEN&limit=10
```

## Step 6: Set Up Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

**Important**: Never commit your access token to version control!

## Step 7: Deploy with Environment Variables

For Firebase Hosting, you'll need to set environment variables:

```bash
firebase functions:config:set facebook.access_token="your_access_token_here"
```

Or use Firebase Hosting environment variables:

```bash
firebase hosting:channel:deploy preview --env-file .env
```

## Step 8: Update the News Component

The News component is already configured to use the environment variable. Make sure the Facebook Page ID is correct:

```javascript
const FACEBOOK_PAGE_ID = '61575235395467';
const FACEBOOK_ACCESS_TOKEN = process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN;
```

## API Permissions Required

Your Facebook app needs these permissions:

- `pages_read_engagement` - Read page posts and engagement
- `pages_show_list` - Access to page information
- `public_profile` - Basic profile information

## Rate Limits

Facebook API has rate limits:
- **User Access Tokens**: 200 calls per hour per user
- **Page Access Tokens**: 200 calls per hour per page
- **App Access Tokens**: 200 calls per hour per app

## Security Considerations

1. **Never expose access tokens** in client-side code for production
2. **Use server-side API calls** for production applications
3. **Implement proper error handling** for API failures
4. **Cache responses** to reduce API calls
5. **Monitor API usage** to stay within rate limits

## Alternative: Server-Side Implementation

For better security, consider implementing the Facebook API calls on the server side:

### Using Firebase Functions:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.getFacebookPosts = functions.https.onCall(async (data, context) => {
  const FACEBOOK_PAGE_ID = '61575235395467';
  const FACEBOOK_ACCESS_TOKEN = functions.config().facebook.access_token;
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,type,likes.summary(true),comments.summary(true)&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=10`
    );
    
    const data = await response.json();
    return { success: true, posts: data.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

## Troubleshooting

### Common Issues:

1. **"Invalid access token"**
   - Check if the token is expired
   - Verify the token has the correct permissions
   - Regenerate the token if needed

2. **"Permissions error"**
   - Ensure your app has the required permissions
   - Check if the page is public or you have admin access

3. **"Rate limit exceeded"**
   - Implement caching to reduce API calls
   - Monitor your API usage
   - Consider using a server-side implementation

4. **"Page not found"**
   - Verify the page ID is correct
   - Check if the page is accessible with your token

### Testing:

1. Use the [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/) to test endpoints
2. Check the [Facebook API Documentation](https://developers.facebook.com/docs/graph-api/reference/page/posts)
3. Monitor API responses for error messages

## Production Deployment

For production, consider:

1. **Server-side API calls** using Firebase Functions
2. **Caching** to reduce API calls and improve performance
3. **Error handling** for API failures
4. **Monitoring** API usage and rate limits
5. **Fallback content** when API is unavailable

## Support

If you encounter issues:
1. Check [Facebook API Documentation](https://developers.facebook.com/docs/graph-api)
2. Review [Facebook API Error Codes](https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling)
3. Test with [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
4. Contact Facebook Developer Support if needed

## Next Steps

After setup:
1. Test the API integration
2. Customize the News page design
3. Implement caching for better performance
4. Add error handling and fallback content
5. Monitor API usage and performance
