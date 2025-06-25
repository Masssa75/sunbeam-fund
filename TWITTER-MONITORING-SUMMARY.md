# Twitter Monitoring System Summary

## How Twitter Monitoring Works in Sunbeam

### 1. Database Structure
- **Table**: `monitored_projects`
- **Key fields**:
  - `project_id`: CoinGecko ID (matches portfolio positions)
  - `project_name`: Display name
  - `symbol`: Token symbol
  - `twitter_handle`: Twitter username (without @)
  - `alert_threshold`: Minimum importance score (0-10) for notifications
  - `is_active`: Whether to monitor this project
  - `last_monitored`: Timestamp of last check (for round-robin)

### 2. Monitoring Process
- **Edge Function**: `monitor-projects` runs every minute via cron job
- **Round-robin**: Checks one project per minute (oldest `last_monitored` first)
- **Flow**:
  1. Select project with oldest `last_monitored` timestamp
  2. Call `nitter-search` Edge Function to fetch tweets
  3. AI analyzes tweets and assigns importance scores (0-10)
  4. If score ≥ `alert_threshold`, send Telegram notifications
  5. Update `last_monitored` timestamp

### 3. Admin Interface
- **URL**: `/admin/twitter-monitoring`
- Shows all monitored projects with last check time
- Displays collected tweets sorted by importance score
- Filter tweets by project

### 4. Projects Currently Monitored (10 total)
1. **Kaspa** (@KaspaCurrency) - Threshold: 7
2. **Bittensor** (@bittensor_) - Threshold: 7
3. **Sui** (@SuiNetwork) - Threshold: 7
4. **Toncoin** (@ton_blockchain) - Threshold: 7
5. **Ethereum** (@ethereum) - Threshold: 8 (higher due to more general tweets)
6. **Solana** (@solana) - Threshold: 7
7. **Virtuals Protocol** (@virtuals_io) - Threshold: 7
8. **Brickken** (@Brickken_) - Threshold: 7
9. **Coinweb** (@coinwebofficial) - Threshold: 7
10. **AUKI** (@aukiapp) - Threshold: 7

### 5. Monitoring Frequency
- With 10 projects and 1 check per minute:
- Each project is monitored approximately every 10 minutes
- High-importance tweets (score ≥ threshold) trigger immediate Telegram alerts

## How to Add More Projects

### Option 1: Using a Script (Recommended)
```javascript
// Add to projectsToAdd array in add-more-monitored-projects.js
{
  project_id: 'coingecko-id',  // Must match portfolio position
  project_name: 'Project Name',
  symbol: 'TOKEN',
  twitter_handle: 'twitter_username',  // Without @
  alert_threshold: 7  // 1-10, typically 7
}
```

Then run: `node add-more-monitored-projects.js`

### Option 2: Direct Database Insert
```sql
INSERT INTO monitored_projects (
  project_id, project_name, symbol, twitter_handle, alert_threshold, is_active
) VALUES (
  'project-id', 'Project Name', 'symbol', 'twitter_handle', 7, true
);
```

### Option 3: Build Admin UI (Not Yet Implemented)
Could add CRUD interface to `/admin/twitter-monitoring` page

## Notes
- Projects not in portfolio but still relevant to monitor:
  - CURE Protocol (custom project, no CoinGecko ID)
  - Keeta (could add if Twitter handle found)
  - Neiro on ETH (meme coin, might be too noisy)
  - USDC (stablecoin, probably not worth monitoring)
  - cat in a dogs world (meme coin, might be too noisy)

- Twitter handles should be verified before adding
- Higher thresholds (8-9) for projects with many general tweets
- Lower thresholds (6-7) for projects with fewer, more important tweets