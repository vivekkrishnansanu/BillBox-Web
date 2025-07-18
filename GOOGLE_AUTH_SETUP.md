# Google Authentication Setup Guide

Follow these steps to set up Google authentication for your BillBox application:

## 1. Google Cloud Console Setup

### Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity API"
3. Click "Enable"

### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add your domain to authorized domains
4. Choose "Web application" as application type
5. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback (for development)
   ```
6. Copy the Client ID and Client Secret

## 2. Supabase Configuration

### Enable Google Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Authentication → Settings → Auth Providers
4. Find "Google" and toggle it on
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Click "Save"

### Configure Redirect URLs
1. In the same Auth Providers section
2. Add your site URL: `http://localhost:5173` (for development)
3. For production, add your actual domain

## 3. Environment Variables

Make sure your `.env` file contains:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## 5. Troubleshooting

### Common Issues:

**"Error 400: redirect_uri_mismatch"**
- Check that your redirect URI in Google Console matches exactly: `https://your-project-ref.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

**"This app isn't verified"**
- This is normal for development. Click "Advanced" → "Go to [your-app] (unsafe)"
- For production, you'll need to verify your app with Google

**"Access blocked: This app's request is invalid"**
- Check that the Google+ API is enabled
- Verify your OAuth consent screen is properly configured

**User data not saving**
- Check that your database policies allow authenticated users to insert/update their profiles
- Verify the user_profiles table exists and has proper RLS policies

## 6. Production Deployment

When deploying to production:
1. Update your Google OAuth redirect URIs to include your production domain
2. Update your Supabase site URL to your production domain
3. Verify your app with Google if needed for public use

## 7. Security Best Practices

- Never expose your Client Secret in frontend code
- Use HTTPS in production
- Regularly rotate your OAuth credentials
- Monitor authentication logs in Supabase dashboard
- Set up proper CORS policies

Your Google authentication should now be working! Users can sign in with their Google accounts and their profiles will be automatically created in your Supabase database.