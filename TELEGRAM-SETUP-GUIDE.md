# Telegram Notification Setup Guide

## Current Status ✅

### What's Already Done:
1. **Database Tables** ✅
   - `investor_telegram` - Stores Telegram connections
   - `notification_logs` - Tracks sent notifications
   
2. **Edge Functions** ✅
   - `send-telegram-notification` - Sends messages to Telegram
   - `telegram-webhook` - Handles bot commands
   - `monitor-projects` - Fixed to use correct table and notification logic
   
3. **Admin Interface** ✅
   - Available at `/admin/telegram`
   - Can view connections and send test messages
   
4. **Bot Created** ✅
   - Bot username: @sunbeam_capital_bot
   - Ready to accept connections

## What's Missing 🔧

### 1. Set Telegram Bot Token
The `TELEGRAM_BOT_TOKEN` needs to be added to Supabase Edge Function secrets:

```bash
# Get the token from @BotFather on Telegram
./supabase-cli/supabase secrets set TELEGRAM_BOT_TOKEN=your_token_here --project-ref gualxudgbmpuhjbumfeh
```

### 2. Set Up Webhook
After setting the token, configure the webhook:

```bash
# Set webhook to receive bot updates
curl -X POST "https://api.telegram.org/bot{YOUR_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/telegram-webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

## How It Works 🚀

### For Investors:
1. **Connect to Bot**:
   - Go to admin panel → Manage Investors
   - Generate connection token for investor
   - Investor messages @sunbeam_capital_bot with `/start TOKEN`
   - Bot confirms connection

2. **Receive Notifications**:
   - High-importance tweets (score ≥ 7) trigger alerts
   - Monthly reports can be sent via bot
   - Portfolio updates when requested

### For Admins:
1. **Monitor Connections**: View all connected investors at `/admin/telegram`
2. **Send Test Messages**: Test notifications to specific investors
3. **View Logs**: Check notification history in database

## Testing the Integration 🧪

### 1. Manual Test (After Setting Token):
```bash
# Run the test script
node scripts/test-telegram-notifications.js
```

### 2. Full Flow Test:
1. Ensure cron job is running (checks every minute)
2. Monitor high-importance tweets appear
3. Check notification_logs table for sent messages

### 3. Test Commands:
Once connected, investors can use:
- `/start TOKEN` - Connect account
- `/status` - Check connection status
- `/help` - Get available commands
- `/preferences` - Update notification settings
- `/disconnect` - Remove connection

## Notification Flow 📤

1. **Twitter Monitoring** → Collects tweets via cron job
2. **AI Analysis** → Scores importance (0-10)
3. **Threshold Check** → Filters tweets ≥ 7
4. **Send Notifications** → All active investors receive alerts
5. **Log Results** → Track in notification_logs table

## Current High-Importance Tweets Ready to Send:
- Kaspa: 4 tweets with score 7
- Bittensor: 1 tweet with score 8

Once the bot token is set, these will be sent to all connected investors!

## Troubleshooting 🔍

### If notifications aren't sending:
1. Check bot token is set: `./supabase-cli/supabase secrets list --project-ref gualxudgbmpuhjbumfeh`
2. Verify webhook is configured: Check webhook info via Telegram API
3. Check cron job logs: Look for errors in Supabase dashboard
4. Verify investor connections: Check investor_telegram table
5. Check notification_logs for errors

### Common Issues:
- **"TELEGRAM_BOT_TOKEN not configured"** - Token not set in secrets
- **No notifications sent** - No active investor connections
- **Webhook errors** - Webhook URL not set or incorrect

## Next Steps 📋
1. Get bot token from @BotFather
2. Set token in Supabase secrets
3. Configure webhook
4. Connect test investor account
5. Verify notifications are received