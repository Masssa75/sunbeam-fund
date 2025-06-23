# Key Porta Implementations to Copy

## 1. Nitter/ScraperAPI Edge Function (CRITICAL - This was hard to get working!)
**Location**: `/porta/supabase/functions/nitter-search/index.ts`
**Why Important**: 
- Contains the working ScraperAPI integration
- Proper HTML parsing for Nitter
- Batch AI analysis to save costs
- Duplicate checking before AI analysis

## 2. Deployment Scripts
**Location**: `/porta/scripts/deploy-*.js`
**Copy These**:
- `deploy-monitor-function.js`
- `deploy-telegram-webhook-no-auth.js`
- Any other deployment helpers

## 3. CoinGecko Integration
**Location**: Check `/porta/src/app/page.tsx` or components
**Look For**:
- Project search functionality
- API integration patterns
- Rate limiting handling

## 4. Telegram Bot Integration
**Location**: `/porta/supabase/functions/send-telegram-notification/`
**Contains**:
- Proper message formatting
- Bot API integration
- Error handling

## 5. Cron Job Setup
**Location**: `/porta/scripts/setup-cron.js` or similar
**Important**:
- How to set up monitoring cron jobs
- API key configuration
- Round-robin monitoring pattern

## 6. Frontend Components
**Location**: `/porta/src/components/`
**Useful Components**:
- Project search UI
- Portfolio display components
- Notification settings

## 7. Database Helpers
**Location**: `/porta/src/lib/`
**Look For**:
- Supabase client setup
- Database query patterns
- Type definitions

## Quick Copy Commands

When in the sunbeam directory, run these to copy key files:

```bash
# Copy Nitter search function
cp -r ../porta/supabase/functions/nitter-search ./supabase/functions/

# Copy deployment scripts
cp ../porta/scripts/deploy-*.js ./scripts/

# Copy any TypeScript types/interfaces
cp ../porta/src/types/*.ts ./src/types/ 2>/dev/null || true
```

## API Keys to Transfer

From porta's `.env` file, you'll need:
- SCRAPERAPI_KEY (essential for Twitter monitoring)
- GEMINI_API_KEY (for AI analysis)
- TELEGRAM_BOT_TOKEN (create new bot for fund)
- CRONJOB_API_KEY (for scheduled tasks)

## Key Differences for Sunbeam

1. **Portfolio Focus**: Sunbeam needs position tracking, porta doesn't
2. **Reports**: Sunbeam needs monthly report generation
3. **Privacy**: Sunbeam data should be private by default
4. **Investors**: Sunbeam needs investor-specific features

## Testing Checklist

After copying implementations:
1. ✓ Test Nitter search returns tweets
2. ✓ Test AI analysis gives importance scores
3. ✓ Test database storage works
4. ✓ Test deployment scripts run
5. ✓ Test Telegram notifications send