-- Content Calendar Table for Automated Blog Posting
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  day_of_week TEXT NOT NULL,
  target_city TEXT,
  topic_focus TEXT,
  article JSONB NOT NULL, -- Contains headline, content, meta_description, slug, etc.
  social_posts JSONB, -- Array of suggested social media posts
  seo_data JSONB, -- Keywords, target location, content angle
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying of due content
CREATE INDEX IF NOT EXISTS idx_content_calendar_due
ON content_calendar (scheduled_date, scheduled_time, status);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_content_calendar_status
ON content_calendar (status, scheduled_date);

-- Social Media Posts Tracking Table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_calendar_id UUID REFERENCES content_calendar(id),
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'nextdoor')),
  post_content TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT,
  engagement_metrics JSONB, -- likes, shares, comments, etc.
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Performance Tracking Table
CREATE TABLE IF NOT EXISTS content_seo_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_calendar_id UUID REFERENCES content_calendar(id),
  page_url TEXT,
  primary_keyword TEXT,
  search_position INTEGER,
  monthly_searches INTEGER,
  organic_traffic INTEGER,
  click_through_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  leads_generated INTEGER DEFAULT 0,
  tracked_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Source Tracking (connect content to leads)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS content_source_id UUID REFERENCES content_calendar(id),
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT;

-- Create triggers for updated_at timestamp
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

-- Insert sample content calendar entry
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
  '{"headline": "Hurricane Season 2026: Essential Window Protection for Miami Homeowners", "content": "Sample content...", "slug": "hurricane-season-2026-miami-windows"}',
  '["🌀 Hurricane Season 2026 is here! Protect your Miami home with impact windows. Read our complete guide: [LINK]", "💪 Strong windows = peace of mind during storms. Miami homeowners, are you prepared? [LINK]"]',
  '{"primary_keyword": "hurricane windows Miami", "target_location": "Miami", "content_angle": "safety and protection"}'
) ON CONFLICT DO NOTHING;