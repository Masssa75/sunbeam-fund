# How to Connect Telegram Notifications at sunbeam.capital

## For Admins: Setting Up Investor Connections

### Method 1: Via Investor Management Page (Recommended)
1. **Navigate to Admin Menu**:
   - Log in to sunbeam.capital as admin
   - Click hamburger menu (☰) in top right
   - Select "Manage Investors"

2. **Generate Connection Link**:
   - Find the investor you want to connect
   - Click the three dots (⋮) menu next to their name
   - Select "Connect Telegram"
   - The connection link is automatically copied to your clipboard

3. **Share with Investor**:
   - Send the link to the investor via email/text
   - The link looks like: `https://t.me/sunbeam_capital_bot?start=TOKEN`

### Method 2: Via Telegram Admin Page
1. **Navigate to Telegram Admin**:
   - Click hamburger menu (☰)
   - Select "Telegram Notifications"

2. **View Bot Status**:
   - See connected investors
   - Check webhook status
   - Send test messages

## For Investors: Connecting Your Account

### Step 1: Receive Connection Link
Your fund administrator will send you a link that looks like:
`https://t.me/sunbeam_capital_bot?start=abc123xyz`

### Step 2: Connect to Bot
1. **Click the link** on your phone/computer with Telegram installed
   - OR search for `@sunbeam_capital_bot` in Telegram
2. **Start the chat** by clicking "Start" button
3. **Send the command**: If you searched manually, send `/start YOUR_TOKEN`

### Step 3: Confirmation
- The bot will confirm your connection
- You'll see: "✅ Connected successfully! You are now registered as [Your Name]"

### What You'll Receive
- **Important market updates** (score ≥ 7/10)
- **Monthly reports** when published
- **Portfolio alerts** for significant changes

### Bot Commands
- `/status` - Check your connection status
- `/help` - Show available commands
- `/preferences` - Update notification settings
- `/disconnect` - Remove connection

## Current System Status

### ✅ What's Working:
- Twitter monitoring running every minute
- AI analysis scoring tweet importance
- 5 high-importance tweets ready to send
- Bot webhook configured and active
- All API keys set in Supabase

### 📊 Monitoring Activity:
- **Kaspa**: Last checked 2 minutes ago
- **Bittensor**: Last checked 1 minute ago
- **Alert Threshold**: Score ≥ 7/10

### 🔔 Notification Flow:
1. Twitter posts detected → 
2. AI scores importance → 
3. Scores ≥ 7 trigger alerts → 
4. All connected investors notified

## Troubleshooting

### "Token not found" Error
- Token may have expired (24 hours)
- Request a new link from admin

### Not Receiving Notifications
- Check your connection with `/status`
- Ensure notifications are enabled in Telegram settings
- Contact admin to verify your account is active

### Connection Issues
- Make sure you're using the exact token provided
- Try clicking the direct link instead of manual entry
- Ensure @sunbeam_capital_bot isn't blocked

## Admin Quick Reference

### Check System Status:
```bash
# View connected investors
curl https://gualxudgbmpuhjbumfeh.supabase.co/rest/v1/investor_telegram \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"

# Manually trigger monitoring
curl -X POST https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/monitor-projects \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

### View Logs:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gualxudgbmpuhjbumfeh/functions)
2. Click on relevant function
3. View invocation logs

The system is fully operational and ready for investor connections!