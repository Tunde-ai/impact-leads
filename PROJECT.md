# Impact Leads - Florida Impact Windows Lead Generation

## Project Overview
High-converting lead generation platform for Florida impact windows and doors contractors. Built with Next.js 14, Supabase, and AI-powered lead scoring.

## Key Features
- **Landing Page**: Mobile-first lead capture form
- **AI Lead Scoring**: Claude-powered scoring (0-100) with Florida-specific criteria
- **Automated Alerts**: Real-time email notifications for high-value leads
- **Daily Digest**: Comprehensive lead reports with business intelligence
- **Web Scraping**: Automated discovery from Reddit and Craigslist
- **Commission Tracking**: Automatic commission calculations and reporting

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Supabase PostgreSQL, Resend Email, Anthropic Claude
- **Deployment**: Vercel with cron automation
- **Integrations**: Reddit API, Craigslist scraping

## Database Schema
```sql
leads (
  id UUID PRIMARY KEY,
  source TEXT ('form' | 'scraped'),
  full_name TEXT,
  phone TEXT, 
  email TEXT,
  address TEXT,
  city TEXT,
  zip TEXT,
  window_count INTEGER,
  door_count INTEGER,
  urgency TEXT,
  homeowner BOOLEAN,
  score INTEGER (0-100),
  score_reason TEXT,
  status TEXT ('new' | 'sent_to_dennis' | 'contacted' | 'closed'),
  contract_value NUMERIC,
  commission_earned NUMERIC GENERATED (contract_value * 0.03)
)
```

## API Endpoints
- `POST /api/submit-lead` - Landing page form submissions
- `POST /api/score-leads` - Claude AI lead scoring
- `POST /api/alert-dennis` - High-value lead email alerts
- `POST /api/daily-digest` - Daily lead intelligence reports
- `POST /api/scrape` - Automated lead discovery
- `POST /api/close-lead` - Deal closure and commission tracking

## Automation
- **Daily Digest**: 12:00 PM UTC (7 AM EST) - `0 12 * * *`
- **Lead Scraping**: Every 6 hours - `0 */6 * * *`

## Business Logic
- **Hot Lead Threshold**: Score ≥ 70
- **Commission Rate**: 3% of contract value
- **Average Deal Size**: $15,000 (for pipeline calculations)
- **Lead Sources**: Form submissions, Reddit, Craigslist Miami

## Contact Integration
- **Dennis** (Contractor): floridawindowanddoors@gmail.com
- **Tunde** (Partner): signhere@signaturebytundeo.com

## Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
```

## Links
- [[impact-leads-deployment]] - Deployment notes
- [[florida-market-research]] - Market research and insights
- [[lead-scoring-criteria]] - AI scoring methodology

---
*Project Status*: ✅ Complete - Ready for deployment
*Last Updated*: [[2026-05-13]]