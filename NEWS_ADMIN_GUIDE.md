# News Page Admin Guide

## Overview
The News page now includes admin functionality to add and remove embed link posts. This allows administrators to dynamically manage the content displayed on the news page without needing to modify code.

## Admin Access
To access admin features:
1. Navigate to the admin login page
2. Enter the admin passkey: `Casahacienda1897`
3. Once authenticated, you'll see admin controls on the News page

## Adding New Posts

### Step 1: Access the Add Post Form
- Go to the News page while logged in as admin
- Click the "Add New Post" button in the header section

### Step 2: Fill in the Form
- **Embed URL** (Required): Paste the Facebook embed URL
  - To get this URL:
    1. Go to the Facebook post you want to embed
    2. Click the three dots (...) menu
    3. Select "Embed"
    4. Copy the provided embed code
    5. Extract the `src` attribute from the iframe
- **Title** (Optional): Add a descriptive title for the post
- **Description** (Optional): Add a brief description or context

### Step 3: Save the Post
- Click "Add Post" to save
- The post will appear immediately on the news page

## Removing Posts

### Step 1: Identify the Post
- Posts added through the admin interface will have a red trash icon in the top-right corner
- Default posts (hardcoded) cannot be removed through the admin interface

### Step 2: Remove the Post
- Click the red trash icon on the post you want to remove
- Confirm the deletion in the popup dialog
- The post will be removed immediately

## Facebook Embed URL Format
The embed URL should follow this format:
```
https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3D[POST_ID]%26id%3D[PAGE_ID]&show_text=true&width=500
```

## Features
- **Real-time Updates**: Posts are added/removed immediately
- **Fallback Content**: If no custom posts exist, default Facebook posts are displayed
- **Responsive Design**: Posts adapt to different screen sizes
- **Admin Authentication**: Only authenticated admins can modify posts
- **Confirmation Dialogs**: Prevents accidental deletions

## Technical Notes
- Posts are stored in Firestore under the `news_posts` collection
- Each post includes: embedUrl, title, description, createdAt, updatedAt
- Posts are ordered by creation date (newest first)
- The system maintains backward compatibility with existing hardcoded posts

## Troubleshooting
- If posts don't appear, check that the embed URL is valid
- Ensure you're logged in as admin to see the add/remove controls
- Refresh the page if changes don't appear immediately
