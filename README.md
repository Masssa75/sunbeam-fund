# Sunbeam Capital Management System

A comprehensive crypto fund management system for Sunbeam Capital that tracks portfolio positions, generates monthly reports, monitors project updates, and sends alerts to investors.

## Quick Start

1. Clone this repository
2. Copy `.env.example` to `.env` and add your API keys
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Start automation server in another terminal: `npm run automation`

## Features

- **Portfolio Management**: Track crypto positions with entry dates and amounts
- **Monthly Reports**: Automated valuation and performance reports
- **Twitter Monitoring**: Real-time alerts for important project updates
- **Telegram Integration**: Notifications to investor groups
- **Historical Tracking**: End-of-month snapshots for accurate reporting

## Tech Stack

- Next.js 14 + TypeScript
- Supabase (Database + Edge Functions)
- Tailwind CSS
- CoinGecko API for pricing
- Nitter/ScraperAPI for Twitter monitoring
- Gemini AI for content analysis

## Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy-functions` - Deploy Supabase Edge Functions
- `npm run automation` - Start automation server for deployments

## API Keys Required

See `.env.example` for all required environment variables.

## Working Implementations

This project reuses proven implementations from the porta project:
- Nitter/ScraperAPI Twitter monitoring
- Gemini AI batch analysis
- Telegram bot integration
- Cron job monitoring system

## For Developers

Check `CLAUDE.md` for detailed development guidelines and autonomous workflow instructions.