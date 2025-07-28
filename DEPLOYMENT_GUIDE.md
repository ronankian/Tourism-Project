# 🚀 Deployment Guide - Rosario Tourism Website

This guide will walk you through deploying the React tourism website to Firebase Hosting.

## 📋 Prerequisites

- Node.js (v16 or higher) installed
- npm or yarn package manager
- Google account for Firebase
- Git repository (optional but recommended)

## 🔧 Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd Lakwartsero

# Install all dependencies
npm install
```

### Step 2: Test Locally

```bash
# Start development server
npm start
```

Open `http://localhost:3000` in your browser to verify everything works correctly.

### Step 3: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools
```

### Step 4: Login to Firebase

```bash
# Login with your Google account
firebase login
```

This will open your browser for authentication.

### Step 5: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `rosario-tourism-website`
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### Step 6: Initialize Firebase

```bash
# Initialize Firebase in your project
firebase init hosting
```

When prompted:

- **Select project**: Choose your newly created project
- **Public directory**: Enter `build` (this is where React builds the app)
- **Single-page app**: Answer `Yes`
- **Overwrite index.html**: Answer `No`

### Step 7: Build the Application

```bash
# Build the React app for production
npm run build
```

This creates a `build` folder with optimized production files.

### Step 8: Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy
```

### Step 9: Verify Deployment

After successful deployment, Firebase will provide you with:

- **Hosting URL**: `https://your-project-id.web.app`
- **Project Console**: Link to manage your project

Visit the hosting URL to see your live website!

## 🔄 Continuous Deployment

### Option 1: Manual Deployment

```bash
# Build and deploy in one command
npm run deploy
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: your-project-id
```

## 🛠️ Configuration Files

### Firebase Configuration

Your `firebase.json` should look like this:

```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

### Project Configuration

Your `.firebaserc` should contain:

```json
{
  "projects": {
    "default": "rosario-tourism-website"
  }
}
```

## 🔧 Custom Domain Setup

### Step 1: Add Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `tourism.rosario.gov.ph`)
4. Follow the verification steps

### Step 2: DNS Configuration

Add these DNS records to your domain provider:

```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195

Type: CNAME
Name: www
Value: your-project-id.web.app
```

## 📊 Performance Optimization

### Enable Compression

Add to `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Content-Encoding",
            "value": "gzip"
          }
        ]
      }
    ]
  }
}
```

### Enable Caching

The configuration already includes optimal caching headers for static assets.

## 🔒 Security Headers

The Firebase configuration includes security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Deployment fails**

   ```bash
   # Check Firebase CLI version
   firebase --version

   # Re-login to Firebase
   firebase logout
   firebase login
   ```

3. **404 errors on refresh**

   - Ensure `rewrites` in `firebase.json` redirects all routes to `index.html`
   - Verify `single-page app` was set to `Yes` during initialization

4. **Slow loading**
   - Check image sizes and optimize them
   - Verify caching headers are working
   - Use Firebase CDN for better global performance

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Check hosting configuration
firebase hosting:channel:list

# View deployment history
firebase hosting:releases:list
```

## 📞 Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Verify all configuration files are correct
3. Test locally before deploying
4. Check Firebase documentation for updates

## 🎉 Success!

Your Rosario Tourism website is now live on Firebase Hosting!

**Next Steps:**

- Set up custom domain
- Configure Google Analytics
- Set up monitoring and alerts
- Plan content updates and maintenance

---

**Happy Deploying! 🚀**
