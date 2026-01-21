# Deployment Guide

## Netlify Deployment

This application is configured for deployment on Netlify with the necessary configuration files in place.

### Required Files (Already Created)

- `netlify.toml` - Build configuration and redirect rules
- `public/_redirects` - SPA routing fallback

### Environment Variables

Before deploying, configure these environment variables in your Netlify dashboard:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional (for external data sources):**
- `VITE_FORUM_ATTENDEE_URL`
- `VITE_FORUM_ATTENDEE_ANON_KEY`
- `VITE_FORUM_EVENT_URL`
- `VITE_FORUM_EVENT_ANON_KEY`
- `VITE_NON_FORUM_ATTENDEE_URL`
- `VITE_NON_FORUM_ATTENDEE_ANON_KEY`
- `VITE_NON_FORUM_EVENT_URL`
- `VITE_NON_FORUM_EVENT_ANON_KEY`

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect the build settings from `netlify.toml`

3. **Configure Environment Variables**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add all the required environment variables listed above
   - Get these values from your Supabase project dashboard

4. **Deploy**
   - Click "Deploy site"
   - Your site will build and deploy automatically
   - Future pushes to main branch will auto-deploy

### Build Configuration (from netlify.toml)

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA redirect: All routes redirect to index.html

### Troubleshooting

**404 errors on routes:** The `_redirects` file ensures all routes serve `index.html` for client-side routing.

**Environment variables not working:** Make sure all `VITE_*` variables are set in Netlify dashboard and redeploy.

**Build fails:** Check that all dependencies are in package.json and run `npm install` locally first.
