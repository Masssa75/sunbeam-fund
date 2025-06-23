# 🚀 Quick Deploy Instructions

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Name: `sunbeam-fund`
3. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands:
```bash
cd /Users/marcschwyn/Desktop/projects/sunbeam
git remote add origin https://github.com/YOUR_USERNAME/sunbeam-fund.git
git push -u origin main
```

## Step 3: Deploy to Netlify

### Easy Way (via Browser):
1. Go to: https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect GitHub and select `sunbeam-fund`
4. Deploy with default settings

### Or via CLI:
```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

## That's it! 🎉

Your app will be live at: `https://YOUR-SITE-NAME.netlify.app`

## What Works Now:
- ✅ Add/edit/delete portfolio positions
- ✅ CoinGecko price fetching (via API routes, no CORS)
- ✅ Data persists in browser (localStorage)
- ✅ Generate reports (JSON download)
- ✅ Mobile-responsive design

## Next Steps:
- Set up Supabase for cloud storage
- Add authentication
- Implement investor portal from wireframes
- Add Twitter monitoring

The app is fully functional for portfolio tracking right now!