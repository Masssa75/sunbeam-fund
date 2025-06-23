# Sunbeam Fund Management System - CLAUDE.md

## Project Overview
A comprehensive crypto fund management system for Sunbeam Fund that tracks portfolio positions, generates monthly reports, monitors important project updates via Twitter, and sends alerts to Telegram groups. Built to showcase advanced crypto tooling capabilities while serving real fund management needs.

## Critical Development Rules
1. **Never create fallback systems without explicit request** - No automatic fallbacks, mockups, or demo content unless specifically requested
2. **Always create backup before major changes** - Complete backup required before database integration, authentication changes, API refactoring, etc.
3. **Do only what's asked; nothing more, nothing less**
4. **Never create files unless absolutely necessary** - Always prefer editing existing files
5. **Never proactively create documentation files unless requested**
6. **API keys go in .env file, never in CLAUDE.md**

## Working Preferences - FULLY AUTONOMOUS MODE

### 🚨 CORE AUTONOMOUS PRINCIPLES (ALWAYS FOLLOW)

#### ✅ Always Do Without Asking:
- Deploy to production (for prototyping/MVP phase)
- Fix bugs and errors  
- Update Edge Functions
- Run tests and diagnostics
- Create automation scripts
- Update documentation
- Try up to 10 different approaches to solve problems
- Deploy via automation server when available
- Test immediately with API calls
- Wait appropriate times (cron: 1-2min, API: immediate)
- Check logs and fix errors autonomously
- Repeat until working (up to 10 attempts)
- Copy working implementations from porta project

#### ❌ Always Ask Before:
- Deleting data
- Major refactors
- Rolling back changes
- Billing/paid services setup
- Long-term architectural decisions

#### 📋 Always Provide:
- **Running commentary** while working
- **Intermediate failures** and what was tried
- **Final results** with clear success/failure status
- **Documentation updates** in CLAUDE.md

### 🔧 Key Automation Commands:
```bash
# Execute via automation server
echo '[{"action": "execute", "params": {"command": "node script.js", "cwd": "/Users/marcschwyn/Desktop/projects/sunbeam"}}]' > automation-commands.json

# Deploy Edge Functions (after supabase login)
./supabase-cli/supabase functions deploy FUNCTION_NAME --project-ref [PROJECT_ID] --no-verify-jwt
```

## 🛠️ Available Tools & Capabilities

### 📁 File System Tools:
- **Read** - Read any file content (including images/screenshots)
- **Write** - Create new files
- **Edit/MultiEdit** - Modify existing files
- **Glob** - Search for files by pattern
- **Grep** - Search file contents with regex
- **LS** - List directory contents

### 🔧 Execution Tools:
- **Bash** - Run shell commands directly
- **Task** - Launch autonomous agents for complex searches
- **TodoRead/TodoWrite** - Track and manage tasks

### 🌐 Web Tools:
- **WebFetch** - Fetch and analyze web content
- **WebSearch** - Search the web for information

### 🤖 Automation Server:
- **Location**: Watches `automation-commands.json`
- **Usage**: `echo '[{"action": "execute", "params": {"command": "cmd", "cwd": "/path"}}]' > automation-commands.json`
- **Results**: Check `latest-result.json` after 2-5 seconds
- **Purpose**: Execute commands that need special permissions

### 📊 APIs Available (configure in .env):
- **Supabase** - Database, Edge Functions, Auth
- **ScraperAPI** - Twitter/Nitter scraping (WORKING IMPLEMENTATION IN PORTA)
- **Gemini AI** - Content analysis & report generation
- **Telegram Bot API** - Notifications to fund investors
- **CoinGecko API** - Crypto prices, historical data, project info
- **Cron-job.org** - Scheduled monitoring

## Technical Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel/Netlify (frontend), Supabase (backend)
- **APIs**: See above list

## Project Structure
```
sunbeam/
├── automation-server.js      # File-based command automation
├── automation-commands.json  # Commands to execute
├── latest-result.json       # Execution results
├── .env                     # API keys (create from .env.example)
├── .env.example            # API key template
├── CLAUDE.md               # This file
├── package.json            # Node dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── src/
│   ├── app/               # Next.js 14 app directory
│   ├── components/        # React components
│   └── lib/              # Utility functions
├── supabase/
│   ├── schema.sql        # Database schema
│   └── functions/        # Edge Functions
│       ├── nitter-search/     # Twitter monitoring (COPY FROM PORTA)
│       ├── analyze-tweets/    # AI analysis (COPY FROM PORTA)
│       ├── portfolio-value/   # Calculate portfolio values
│       └── generate-report/   # Monthly report generation
├── public/               # Static assets
└── scripts/             # Deployment scripts
    ├── deploy-functions.js
    └── setup-cron.js
```

## Key Features to Build

### 1. Portfolio Management
- Add/remove portfolio positions
- Track entry date, amount, cost basis
- Support multiple assets per project
- Historical snapshots for reporting

### 2. Monthly Report Generation
- Automated end-of-month portfolio valuation
- Performance metrics (% change, ROI)
- AI-generated narrative summaries
- Export to PDF/Excel formats
- Investor-specific views (public/private data)

### 3. Twitter Monitoring (COPY FROM PORTA)
- Monitor portfolio projects on Twitter
- Use working Nitter/ScraperAPI implementation
- AI importance scoring (1-10)
- Only alert on significant updates

### 4. Telegram Integration
- Bot for investor group notifications
- Customizable alert thresholds
- Report distribution via bot
- Command interface for queries

### 5. Investor Portal (Optional)
- Secure login for investors
- View portfolio performance
- Download monthly reports
- See recent important updates

## Database Schema (Initial)
```sql
-- Portfolio positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL,          -- CoinGecko ID
  project_name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  cost_basis DECIMAL,
  entry_date DATE NOT NULL,
  exit_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical snapshots
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  positions JSONB NOT NULL,             -- Full position data
  total_value_usd DECIMAL NOT NULL,
  metadata JSONB,                       -- Additional metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_month DATE NOT NULL,
  report_data JSONB NOT NULL,           -- Full report content
  ai_summary TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy these tables from porta:
-- projects (for monitoring)
-- tweet_analyses 
-- notifications
-- telegram_connections
```

## Implementation Priority

### Phase 1: Core Fund Management (TODAY)
1. Basic portfolio CRUD operations
2. CoinGecko integration for current prices
3. Manual report generation trigger
4. Simple UI to manage positions

### Phase 2: Automation (TOMORROW)
1. Copy Twitter monitoring from porta
2. Set up monthly snapshot cron job
3. AI report generation
4. Telegram bot setup

### Phase 3: Polish
1. PDF export functionality
2. Historical charts
3. Investor portal with auth
4. Advanced analytics

## Working From Porta Project

**ALWAYS CHECK PORTA FIRST** for working implementations:
- `/Users/marcschwyn/Desktop/projects/porta/supabase/functions/nitter-search` - Twitter search
- `/Users/marcschwyn/Desktop/projects/porta/supabase/functions/analyze-tweets` - AI analysis
- `/Users/marcschwyn/Desktop/projects/porta/scripts/deploy-*.js` - Deployment scripts
- `/Users/marcschwyn/Desktop/projects/porta/src/lib/telegram.ts` - Telegram integration

## Remember
- This is for a real crypto fund (Sunbeam)
- Professional quality required
- Showcase advanced capabilities
- Start with fund management, add monitoring after
- Copy what works from porta, improve where needed

## Deployment Information

### Live URLs
- **Production**: https://wonderful-strudel-a9c260.netlify.app
- **GitHub**: https://github.com/Masssa75/sunbeam-fund

### Deployment Process
1. Code pushed to GitHub automatically triggers Netlify build
2. If stuck on old commit: Relink repository in Netlify dashboard
3. Manual deploy: "Trigger deploy" → "Clear cache and deploy site"

### Current Features (Live)
- ✅ Portfolio CRUD operations with localStorage persistence
- ✅ CoinGecko price integration (via API routes, no CORS)
- ✅ P&L tracking and calculations
- ✅ Monthly report generation (JSON export)
- ✅ May 31st entry date option with manual price input
- ✅ Mobile responsive design

### API Tokens (All from Porta)
- **Supabase**: Full credentials ready in .env
- **Telegram Bot**: Token ready for notifications
- **Gemini AI**: For content analysis
- **GitHub/Netlify**: Deployment automation
- **Cron Job**: For scheduled tasks

## Next Steps Priority

### Phase 1: Supabase Integration ✅ (Next)
1. Database tables for positions, snapshots, reports
2. Replace localStorage with cloud storage
3. Enable multi-device access
4. Historical data tracking

### Phase 2: Authentication
1. Supabase Auth for admin access
2. Separate investor portal with limited access
3. Role-based permissions

### Phase 3: Twitter Monitoring
1. Copy working implementation from porta
2. Set up Edge Functions
3. Configure cron jobs

### Phase 4: Telegram Integration
1. Notifications for important updates
2. Monthly report distribution
3. Command interface

## Version
- Current Version: 1.0.0
- Created: 2025-06-23
- Status: Deployed and operational
- Last Updated: 2025-06-23