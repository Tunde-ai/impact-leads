# Impact Leads - Florida Impact Windows Lead Generation

## Project Context
High-converting lead generation platform for Florida impact windows contractors. This is a production system handling real leads and generating real commissions.

## Key Stakeholders
- **Tunde Ogunjulugbe**: Lead generation partner, commission recipient
- **Dennis**: Florida contractor, receives high-value lead alerts
- **Target Audience**: Florida homeowners needing impact windows/doors

## Business Model
- 3% commission on closed deals
- Average deal value: $15,000
- Hot leads trigger immediate contractor alerts
- Automated lead discovery through web scraping

## Development Guidelines
- **Mobile-first**: Most users are on phones
- **Speed matters**: Fast loading for better conversion
- **AI scoring**: Use Florida-specific criteria for lead quality
- **Email reliability**: Critical for business operations
- **Error handling**: Never lose a lead due to technical issues

## API Integration Flows
```
Lead Submission → AI Scoring → Hot Lead Alert (if score ≥ 70)
Daily Digest → Email Reports → Business Intelligence
Web Scraping → Lead Discovery → Automated Scoring → Alerts
Deal Closure → Commission Calculation → Confirmation Email
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ANTHROPIC_API_KEY
TUNDE_EMAIL=signhere@signaturebytundeo.com
DENNIS_EMAIL=floridawindowanddoors@gmail.com
```

## Deployment Notes
- Vercel deployment with cron jobs
- Database: Supabase PostgreSQL
- Email: Resend service
- AI: Anthropic Claude Sonnet 4

## Critical Features
1. **Lead capture form** - Primary conversion point
2. **AI scoring system** - Business intelligence core  
3. **Email alerts** - Revenue-critical notifications
4. **Commission tracking** - Financial accuracy essential
5. **Web scraping** - Automated lead discovery

## Monitoring
- Daily digest emails confirm system health
- Lead scoring accuracy affects business decisions
- Email delivery critical for operations
- Scraping volume indicates market activity

---
*This is a live business system generating real revenue*

@AGENTS.md
