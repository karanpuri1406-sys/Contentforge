/*
  # Enhanced Schema for AI SEO Blog Platform
  
  ## New Features
  - API Keys storage (Gemini, OpenRouter)
  - Brand Voices
  - Competitor Analysis
  - Article Elements & Settings
  - WordPress Integration
  - Enhanced blog_posts with all SEO features
  - Image generations tracking
  - Internal links management
*/

-- Add API keys table for user's own keys
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL, -- 'gemini', 'openrouter'
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider)
);

-- Add brand voices table
CREATE TABLE IF NOT EXISTS brand_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  tone text,
  style_guidelines text,
  sample_content text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add WordPress sites table
CREATE TABLE IF NOT EXISTS wordpress_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  username text,
  application_password text, -- WordPress application password
  sitemap_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add internal links table (parsed from sitemaps)
CREATE TABLE IF NOT EXISTS internal_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wordpress_site_id uuid REFERENCES wordpress_sites(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  excerpt text,
  keywords text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(wordpress_site_id, url)
);

-- Add image generations table
CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  image_type text, -- 'cover', 'content', 'featured'
  provider text DEFAULT 'gemini', -- 'gemini', 'dalle', etc.
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enhance blog_posts table with new columns
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS article_type text DEFAULT 'information'; -- 'product_review', 'product_roundup', 'information'
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS output_format text DEFAULT 'multimedia'; -- 'text', 'multimedia', 'markdown'
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS web_search_term text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_keyword text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS language text DEFAULT 'english';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS intended_audience text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS additional_context text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS custom_outline text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS brand_voice_id uuid REFERENCES brand_voices(id) ON DELETE SET NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS wordpress_site_id uuid REFERENCES wordpress_sites(id) ON DELETE SET NULL;

-- Article generation settings (stored as JSONB for flexibility)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generation_settings jsonb DEFAULT '{
  "enable_web_research": true,
  "enable_competitor_analysis": false,
  "competitor_urls": [],
  "enable_first_person": false,
  "enable_stories": true,
  "enable_hook": true,
  "enable_html_elements": true,
  "html_element_instructions": "",
  "enable_citations": true,
  "enable_internal_links": true,
  "enable_external_links": true,
  "generate_images": true,
  "num_content_images": 2,
  "generate_cover_image": true
}'::jsonb;

-- SEO metadata
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS schema_markup jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_links jsonb; -- [{url, anchor_text, title}]
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS internal_links_used jsonb; -- [{url, anchor_text}]

-- WordPress publishing info
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS wordpress_post_id bigint;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS wordpress_published_at timestamptz;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS wordpress_url text;

-- Update profiles table with new fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS articles_generated_this_month integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS images_generated_this_month integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_limits jsonb DEFAULT '{
  "articles_per_month": 10,
  "images_per_month": 20,
  "wordpress_sites": 1,
  "brand_voices": 1,
  "bulk_generation": false,
  "competitor_analysis": false
}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id ON brand_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id ON wordpress_sites(id);
CREATE INDEX IF NOT EXISTS idx_internal_links_site_id ON internal_links(wordpress_site_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_post_id ON generated_images(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_wordpress_site ON blog_posts(wordpress_site_id);

-- Enable RLS on new tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Brand Voices policies
CREATE POLICY "Users can view own brand voices"
  ON brand_voices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own brand voices"
  ON brand_voices FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WordPress Sites policies
CREATE POLICY "Users can view own WordPress sites"
  ON wordpress_sites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own WordPress sites"
  ON wordpress_sites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Internal Links policies
CREATE POLICY "Users can view internal links for own sites"
  ON internal_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wordpress_sites
      WHERE wordpress_sites.id = internal_links.wordpress_site_id
      AND wordpress_sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage internal links for own sites"
  ON internal_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wordpress_sites
      WHERE wordpress_sites.id = internal_links.wordpress_site_id
      AND wordpress_sites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wordpress_sites
      WHERE wordpress_sites.id = internal_links.wordpress_site_id
      AND wordpress_sites.user_id = auth.uid()
    )
  );

-- Generated Images policies
CREATE POLICY "Users can view own generated images"
  ON generated_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own generated images"
  ON generated_images FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_voices_updated_at BEFORE UPDATE ON brand_voices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wordpress_sites_updated_at BEFORE UPDATE ON wordpress_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset monthly counters (call this from a cron job)
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    articles_generated_this_month = 0,
    images_generated_this_month = 0
  WHERE 
    DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can generate article
CREATE OR REPLACE FUNCTION can_generate_article(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_articles_generated integer;
  v_article_limit integer;
BEGIN
  SELECT 
    articles_generated_this_month,
    (plan_limits->>'articles_per_month')::integer
  INTO v_articles_generated, v_article_limit
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_articles_generated < v_article_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment article counter
CREATE OR REPLACE FUNCTION increment_article_counter(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET articles_generated_this_month = articles_generated_this_month + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment image counter
CREATE OR REPLACE FUNCTION increment_image_counter(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET images_generated_this_month = images_generated_this_month + p_count
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
