# BillBox - Smart Financial Tracker

A modern, AI-powered expense tracking application built with React, TypeScript, and Supabase.

## Features

- 🔐 **Google Authentication** via Supabase Auth
- 💰 **Expense Tracking** with AI-powered categorization
- 📊 **Analytics Dashboard** with beautiful charts
- 🔄 **Subscription Management** (monthly, quarterly, yearly)
- 🏦 **EMI Tracking** and management
- 🎯 **Savings Goals** and investment tracking
- 📱 **Mobile-First Design** with glassmorphism UI
- 🌙 **Dark/Light Mode** support
- 🤖 **AI Insights** for spending patterns

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI**: Glassmorphism design with Lucide React icons
- **State Management**: React Hooks + Local Storage
- **Authentication**: Supabase Auth with Google OAuth

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd billbox
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Google OAuth

1. In your Supabase dashboard, go to Authentication > Settings > Auth Providers
2. Enable the Google provider
3. Set up Google OAuth credentials:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API (or Google Identity API)
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:5173` (for development)
4. Copy the Client ID and Client Secret to your Supabase Google provider settings
5. Save the configuration in Supabase

**Important**: Make sure to replace `your-project-ref` with your actual Supabase project reference ID.

### 4. Run Database Migrations

The SQL migration files are in the `supabase/migrations/` folder. Run them in your Supabase SQL editor:

1. `create_user_profiles.sql`
2. `create_expenses.sql` 
3. `create_subscriptions.sql`

### 5. Start Development Server

```bash
# Make sure your .env file is configured with Supabase credentials
npm run dev
```

## Google OAuth Setup Guide

### Step-by-step Google Cloud Console Setup:

1. **Create/Select Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity API"
   - Click "Enable"

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure consent screen if prompted
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     http://localhost:5173
     ```

4. **Configure Supabase**:
   - Copy Client ID and Client Secret
   - In Supabase Dashboard: Authentication > Settings > Auth Providers
   - Enable Google provider
   - Paste your credentials
   - Save configuration

## Environment Setup

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase project URL and anon key from your Supabase dashboard (Settings > API).

### Getting Supabase Credentials:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
5. Paste them into your `.env` file

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Supabase client
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # App constants

supabase/
└── migrations/         # Database migration files
```

## Key Features

### Glassmorphism UI
- Modern glass-like design with backdrop blur effects
- Smooth animations and transitions
- Mobile-responsive design

### AI-Powered Categorization
- Automatic expense categorization using machine learning
- Learning from user behavior
- Smart amount predictions

### Comprehensive Financial Tracking
- Daily/monthly expense analytics
- Subscription management with renewal tracking
- EMI calculations and forecasting
- Savings goals and investment tracking

### Real-time Sync
- Data synced across devices via Supabase
- Real-time updates
- Offline support with local storage fallback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## PWA Icon Setup

To complete PWA support, add the following icon files to your `public/` or project root directory:

- `pwa-192x192.png` (192x192 pixels, PNG)
- `pwa-512x512.png` (512x512 pixels, PNG)

You can generate these using any image editor, or use an online tool like [Favicon Generator](https://realfavicongenerator.net/) or [PWABuilder](https://www.pwabuilder.com/image-generator).

**Tip:** Use a simple, square version of your logo for best results.