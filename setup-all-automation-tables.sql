-- Complete Database Schema for All Automation Systems
-- Run this in your Supabase SQL Editor

-- 1. Content Calendar Table (Content Generation System)
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  day_of_week TEXT NOT NULL,
  target_city TEXT,
  topic_focus TEXT,
  article JSONB NOT NULL,
  social_posts JSONB,
  seo_data JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Social Media Posts Table (Social Media Automation)
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_calendar_id UUID REFERENCES content_calendar(id),
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'nextdoor')),
  content_type TEXT,
  post_content TEXT NOT NULL,
  hashtags JSONB,
  media_type TEXT,
  target_url TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  posted_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT,
  engagement_metrics JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'ready_to_post')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Email Sequences Table (Email Automation)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  sequence_type TEXT NOT NULL,
  email_template TEXT NOT NULL,
  subject TEXT NOT NULL,
  scheduled_send_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_id TEXT, -- From email service
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Review Requests Table (Review Automation)
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  request_type TEXT NOT NULL,
  email_template TEXT NOT NULL,
  platforms JSONB NOT NULL,
  scheduled_send_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled_review_received', 'skipped_has_review')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Customer Reviews Table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  platform TEXT NOT NULL,
  review_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SEO Rankings Table (SEO Monitoring)
CREATE TABLE IF NOT EXISTS seo_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  city TEXT,
  current_position INTEGER,
  previous_position INTEGER,
  position_change INTEGER,
  search_volume INTEGER,
  competition_score DECIMAL(3,2),
  tracked_date DATE NOT NULL,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Competitor Rankings Table
CREATE TABLE IF NOT EXISTS competitor_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position INTEGER,
  estimated_traffic INTEGER,
  tracked_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SEO Reports Table
CREATE TABLE IF NOT EXISTS seo_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Local Citations Table
CREATE TABLE IF NOT EXISTS local_citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  directory_name TEXT NOT NULL,
  city TEXT,
  is_listed BOOLEAN DEFAULT false,
  is_accurate BOOLEAN DEFAULT false,
  listing_url TEXT,
  needs_update BOOLEAN DEFAULT false,
  checked_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to leads table for automation tracking
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS email_sequence_started TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_request_started TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS content_source_id UUID REFERENCES content_calendar(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled ON content_calendar (scheduled_date, scheduled_time, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_media_posts (scheduled_date, scheduled_time, status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled ON email_sequences (scheduled_send_time, status);
CREATE INDEX IF NOT EXISTS idx_review_requests_scheduled ON review_requests (scheduled_send_time, status);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_date_keyword ON seo_rankings (tracked_date, keyword);
CREATE INDEX IF NOT EXISTS idx_competitor_rankings_date ON competitor_rankings (tracked_date, competitor_domain);
CREATE INDEX IF NOT EXISTS idx_local_citations_directory ON local_citations (directory_name, city);

-- Update trigger for content_calendar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_calendar_updated_at
    BEFORE UPDATE ON content_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO content_calendar (
  scheduled_date,
  scheduled_time,
  day_of_week,
  target_city,
  topic_focus,
  article,
  social_posts,
  seo_data
) VALUES (
  CURRENT_DATE + INTERVAL '1 day',
  '09:00',
  'Monday',
  'Miami',
  'Hurricane Preparation',
  '{"headline": "Hurricane Season 2026: Essential Window Protection for Miami Homeowners", "content": "Sample content...", "slug": "hurricane-season-2026-miami-windows", "meta_description": "Prepare your Miami home for hurricane season 2026"}',
  '["🌀 Hurricane Season 2026 is here! Protect your Miami home with impact windows.", "💪 Strong windows = peace of mind during storms. Miami homeowners, are you prepared?"]',
  '{"primary_keyword": "hurricane windows Miami", "target_location": "Miami", "content_angle": "safety and protection"}'
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions (adjust based on your setup)
-- These might not be needed depending on your Supabase configuration
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Create RLS policies (customize based on your security requirements)
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_citations ENABLE ROW LEVEL SECURITY;

-- Allow service_role to access all data (for API operations)
CREATE POLICY "Allow service_role full access" ON content_calendar FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON social_media_posts FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON email_sequences FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON review_requests FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON customer_reviews FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON seo_rankings FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON competitor_rankings FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON seo_reports FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON local_citations FOR ALL TO service_role USING (true);