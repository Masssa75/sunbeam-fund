# 🚀 Deploy to Netlify NOW

Your code is already on GitHub: https://github.com/Masssa75/sunbeam-fund

## Option 1: Via Netlify Dashboard (Easiest)

1. Go to: https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select the `sunbeam-fund` repository
5. Build settings will auto-detect (Next.js)
6. Click "Deploy site"

## Option 2: Direct Deploy Link

Click this link to deploy directly:
https://app.netlify.com/start/deploy?repository=https://github.com/Masssa75/sunbeam-fund

## Environment Variables to Add in Netlify

After deployment, go to Site Settings → Environment Variables and add:

```
# Required for API routes
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://YOUR-SITE.netlify.app

# Optional (for future features)
NEXT_PUBLIC_SUPABASE_URL=https://midojobnawatvxhmhmoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Your app will be live in ~2 minutes! 🎉

Features that work immediately:
- Portfolio management
- Live crypto prices (via API routes)
- Data persistence (localStorage)
- Monthly reports
- Mobile responsive