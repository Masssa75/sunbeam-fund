# Twitter Monitoring Setup for Sunbeam Fund

## Overview
We've copied the exact Twitter monitoring implementation from Porta, which uses:
- **ScraperAPI** to bypass Twitter rate limits
- **Nitter** (nitter.net) as the data source
- **Gemini AI** for importance scoring
- **Round-robin monitoring** (one project per minute)

## Current Status

### ✅ Completed:
1. Database tables created:
   - `monitored_projects` - Configuration for each project
   - `tweet_analyses` - Stores analyzed tweets
   
2. Projects added for monitoring:
   - Kaspa (@KaspaCurrency)
   - Bittensor (@bittensor_)

3. Edge Functions copied from Porta:
   - `nitter-search` - Fetches and analyzes tweets
   - `monitor-projects` - Orchestrates monitoring

### ⏳ Next Steps:

## 1. Deploy Edge Functions

First, you need your ScraperAPI key. Get it from your [ScraperAPI dashboard](https://www.scraperapi.com/).

```bash
# Deploy the functions with your ScraperAPI key
node scripts/deploy-twitter-monitoring.js
```

The script will:
- Ask for your ScraperAPI key
- Set it as an Edge Function secret
- Deploy both functions

## 2. Test the Functions

After deployment, test that everything works:

```bash
# Test the Twitter monitoring
node scripts/test-nitter-search.js
```

## 3. Set Up Cron Job

Set up automated monitoring (every minute):

```bash
# Configure cron job
node scripts/setup-cronjob.js
```

## 4. Monitor Results

Check the Supabase dashboard:
- **Edge Functions logs**: See real-time activity
- **tweet_analyses table**: View collected tweets
- **Telegram**: High-importance tweets will be sent automatically

## How It Works

1. **Every minute**: Cron job triggers `monitor-projects`
2. **Round-robin**: Selects oldest monitored project
3. **Fetch tweets**: Uses ScraperAPI + Nitter to get latest tweets
4. **AI Analysis**: Gemini scores importance (0-10)
5. **Storage**: Saves to database, avoiding duplicates
6. **Notifications**: Sends Telegram alerts for high scores (≥7)

## Configuration

Adjust in `monitored_projects` table:
- `alert_threshold`: Minimum score for notifications (default: 7)
- `is_active`: Enable/disable monitoring
- `twitter_handle`: Twitter username to monitor

## Adding More Projects

```sql
INSERT INTO monitored_projects (
  project_id, project_name, symbol, twitter_handle, alert_threshold
) VALUES (
  'project-id', 'Project Name', 'SYMBOL', 'TwitterHandle', 7
);
```

## Troubleshooting

1. **No tweets found**:
   - Check ScraperAPI key is set correctly
   - Verify Nitter.net is accessible
   - Check Edge Function logs

2. **No AI scores**:
   - Verify Gemini API key is set
   - Check for API quota limits

3. **No notifications**:
   - Check alert_threshold settings
   - Verify Telegram connections
   - Ensure importance scores are ≥ threshold

## Important Notes

- **Cost**: ScraperAPI charges per request, monitor your usage
- **Rate limits**: One project per minute prevents overload
- **Duplicates**: System checks before AI analysis to save costs
- **Nitter**: If nitter.net is down, monitoring will fail

## Files Created

- `/scripts/create-twitter-monitoring-tables.sql`
- `/scripts/setup-twitter-monitoring-step-by-step.js`
- `/scripts/update-monitored-projects-table.js`
- `/scripts/deploy-twitter-monitoring.js`
- `/scripts/test-nitter-search.js`
- `/scripts/setup-cronjob.js`
- `/supabase/functions/nitter-search/`
- `/supabase/functions/monitor-projects/`