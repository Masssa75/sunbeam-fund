# Sunbeam Setup Checklist

## Essential Files Created ✅
- [x] CLAUDE.md - Development guidelines and autonomous workflow
- [x] .env.example - Template for API keys
- [x] package.json - Node.js dependencies
- [x] README.md - Project overview
- [x] automation-server.js - Copied from porta
- [x] automation-commands.json - Command queue
- [x] Directory structure created

## What to Copy from Porta Project

### 1. Working Nitter/ScraperAPI Implementation
- `/porta/supabase/functions/nitter-search/index.ts` → `/sunbeam/supabase/functions/nitter-search/index.ts`
- Contains the proven Twitter monitoring code

### 2. Deployment Scripts
- `/porta/scripts/deploy-*.js` → `/sunbeam/scripts/`
- Especially the Edge Function deployment scripts

### 3. Telegram Integration (if needed)
- `/porta/src/lib/telegram.ts`
- `/porta/supabase/functions/send-telegram-notification/`

### 4. Database Schema (adapt for fund needs)
- `/porta/supabase/schema.sql` - Review and adapt

## Setup Steps for New Instance

1. **Navigate to sunbeam folder**
   ```bash
   cd /Users/marcschwyn/Desktop/projects/sunbeam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Add API keys from porta project:
     - SCRAPERAPI_KEY
     - GEMINI_API_KEY
     - SUPABASE credentials (create new project)
     - TELEGRAM_BOT_TOKEN (create new bot or reuse)
     - COINGECKO_API_KEY (if available)

4. **Create Supabase project**
   - Go to https://app.supabase.com
   - Create new project "sunbeam"
   - Copy project URL and keys to .env

5. **Initialize Next.js app**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```
   When prompted, move files to src/ manually

6. **Deploy Edge Functions**
   - First login: `supabase login`
   - Then deploy: `npm run deploy-functions`

7. **Start development**
   - Terminal 1: `npm run dev`
   - Terminal 2: `npm run automation`

## Database Schema (Initial)

Create these tables in Supabase SQL editor:

```sql
-- Portfolio positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL,
  project_name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  cost_basis DECIMAL,
  entry_date DATE NOT NULL,
  exit_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly snapshots
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  positions JSONB NOT NULL,
  total_value_usd DECIMAL NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_month DATE NOT NULL,
  report_data JSONB NOT NULL,
  ai_summary TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

## Priority Order

1. **Portfolio Management UI** - Add/edit positions
2. **CoinGecko Integration** - Current prices
3. **Snapshot System** - End-of-month values
4. **Report Generation** - Basic reports first
5. **Twitter Monitoring** - Copy from porta
6. **Telegram Alerts** - For high-importance updates

## Notes

- Start simple: Portfolio tracking first
- Add monitoring features after core works
- Reuse porta's proven implementations
- Keep fund data private by default