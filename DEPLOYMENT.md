# Impact Leads - Deployment Guide

## Pre-Deployment Checklist
- [x] Project built successfully (`npm run build`)
- [x] All API routes functional
- [x] Database schema designed
- [x] Environment variables identified
- [x] Cron configuration in `vercel.json`
- [x] Email templates tested
- [x] AI scoring logic implemented

## Deployment Steps

### 1. Git Repository Setup
```bash
git init
git add .
git commit -m "Impact Leads v1.0 - Complete lead generation platform"
```

### 2. GitHub Repository
Create repo: `impact-leads`
```bash
git remote add origin git@github.com:yourusername/impact-leads.git
git branch -M main
git push -u origin main
```

### 3. Vercel Deployment
```bash
npx vercel --prod
```

### 4. Environment Variables (Vercel Dashboard)
Required in Vercel Settings > Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
ANTHROPIC_API_KEY=your_anthropic_key
TUNDE_EMAIL=signhere@signaturebytundeo.com
DENNIS_EMAIL=floridawindowanddoors@gmail.com
```

### 5. Supabase Database Setup
Run this SQL in Supabase SQL Editor:
```sql
-- Already completed in previous setup
-- leads table with all fields and indexes
-- commission_earned generated column
```

### 6. Verify Cron Jobs
Check Vercel Settings > Crons:
- Daily Digest: `0 12 * * *` (12:00 PM UTC)
- Lead Scraping: `0 */6 * * *` (Every 6 hours)

## Post-Deployment Testing

### Test 1: Lead Submission
- [ ] Visit landing page
- [ ] Submit test lead via form
- [ ] Verify lead appears in Supabase
- [ ] Confirm lead gets scored by Claude
- [ ] If score ≥ 70, verify Dennis alert email

### Test 2: Daily Digest  
- [ ] Hit `/api/daily-digest` manually
- [ ] Verify Tunde receives email digest
- [ ] Check email formatting and metrics

### Test 3: Web Scraping
- [ ] Hit `/api/scrape` manually
- [ ] Verify Reddit API calls work
- [ ] Verify Craigslist scraping works
- [ ] Check new leads inserted in database
- [ ] Confirm auto-scoring triggered

### Test 4: Lead Closure
- [ ] Use `/api/close-lead` with test data
- [ ] Verify commission calculated correctly
- [ ] Confirm Tunde receives commission email
- [ ] Check database updates

## Monitoring Setup
- [ ] Vercel deployment dashboard
- [ ] Supabase database monitoring
- [ ] Resend email delivery logs
- [ ] Daily digest emails (health check)

## Business Handoff
- [ ] Provide Vercel URL to stakeholders
- [ ] Train on lead management
- [ ] Explain scoring criteria
- [ ] Set up email monitoring
- [ ] Schedule regular check-ins

## Troubleshooting
- **Email delivery**: Check Resend dashboard
- **Database issues**: Check Supabase logs
- **Cron failures**: Check Vercel function logs
- **API errors**: Check Vercel deployment logs

---
*Ready for production use with real leads and revenue tracking*