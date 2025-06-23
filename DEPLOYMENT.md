# Sunbeam Fund Deployment Guide

## 1. GitHub Setup

Please create a GitHub repository manually:

1. Go to https://github.com/new
2. Repository name: `sunbeam-fund`
3. Description: "Crypto fund management system for Sunbeam Fund"
4. Make it Public (or Private if you prefer)
5. Click "Create repository"

Then run these commands locally:
```bash
cd /Users/marcschwyn/Desktop/projects/sunbeam
git remote add origin https://github.com/YOUR_USERNAME/sunbeam-fund.git
git branch -M main
git push -u origin main
```

## 2. Netlify Deployment

### Option A: Deploy via Netlify CLI (Recommended)
```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

### Option B: Deploy via Netlify Dashboard
1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select your `sunbeam-fund` repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (if needed)

## 3. Environment Variables

Set these in Netlify Dashboard > Site Settings > Environment Variables:

```
# Required for API routes to work
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-netlify-site.netlify.app

# Optional (add when ready)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Build Configuration

Create `netlify.toml` in the root directory:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_PRIVATE_TARGET = "server"
```

## 5. After Deployment

1. Update NEXT_PUBLIC_APP_URL in Netlify to your actual domain
2. Test the deployed site
3. Set up custom domain if needed

## Notes

- The CoinGecko API routes will work on Netlify without CORS issues
- Portfolio data is currently stored in browser (localStorage)
- For production, set up Supabase for persistent storage