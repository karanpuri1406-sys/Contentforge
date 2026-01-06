-- =====================================================
-- BlogForge AI - Complete Database Setup (Idempotent)
-- Safe to run multiple times - will skip existing objects
-- =====================================================

-- First, drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- 1. CREATE TABLES (IF NOT EXISTS)
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    plan text DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'premium')),
    monthly_credits integer DEFAULT 0,
    articles_generated_this_month integer DEFAULT 0,
    images_generated_this_month integer DEFAULT 0,
    plan_limits jsonb DEFAULT '{"articles_per_month": 10, "images_per_month": 10}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    topic text,
    target_audience text,
    tone text,
    keywords text[],
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    word_count integer DEFAULT 0,
    article_type text CHECK (article_type IN ('product_review', 'product_roundup', 'information_guide')),
    output_format text DEFAULT 'html' CHECK (output_format IN ('text', 'html', 'markdown')),
    web_search_term text,
    target_keyword text,
    language text DEFAULT 'English',
    intended_audience text,
    additional_context text,
    custom_outline text,
    generation_settings jsonb,
    meta_title text,
    meta_description text,
    slug text,
    schema_markup jsonb,
    external_links jsonb,
    internal_links_used jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- API keys table (encrypted storage)
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    provider text NOT NULL CHECK (provider IN ('gemini', 'openrouter')),
    api_key text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tokens_used integer DEFAULT 0,
    cost numeric(10, 6) DEFAULT 0,
    model text,
    created_at timestamptz DEFAULT now()
);

-- Brand voices
CREATE TABLE IF NOT EXISTS brand_voices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    tone text,
    example_content text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- WordPress sites
CREATE TABLE IF NOT EXISTS wordpress_sites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    site_url text NOT NULL,
    site_name text,
    wp_username text,
    wp_app_password text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Internal links
CREATE TABLE IF NOT EXISTS internal_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wordpress_site_id uuid REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    url text NOT NULL,
    anchor_text text,
    page_title text,
    created_at timestamptz DEFAULT now()
);

-- Generated images
CREATE TABLE IF NOT EXISTS generated_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    image_url text NOT NULL,
    alt_text text,
    image_type text CHECK (image_type IN ('cover', 'content', 'custom')),
    provider text DEFAULT 'gemini',
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CREATE INDEXES (IF NOT EXISTS)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id ON brand_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id ON wordpress_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_user_id ON internal_links(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_post_id ON generated_images(blog_post_id);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE POLICIES (Fresh start, no conflicts)
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Blog posts policies
CREATE POLICY "Users can view own posts" ON blog_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own posts" ON blog_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON blog_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON blog_posts FOR DELETE USING (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view own usage" ON api_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON api_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- Brand voices policies
CREATE POLICY "Users can view own brand voices" ON brand_voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brand voices" ON brand_voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand voices" ON brand_voices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand voices" ON brand_voices FOR DELETE USING (auth.uid() = user_id);

-- WordPress sites policies
CREATE POLICY "Users can view own WP sites" ON wordpress_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own WP sites" ON wordpress_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own WP sites" ON wordpress_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own WP sites" ON wordpress_sites FOR DELETE USING (auth.uid() = user_id);

-- Internal links policies
CREATE POLICY "Users can view own internal links" ON internal_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own internal links" ON internal_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own internal links" ON internal_links FOR DELETE USING (auth.uid() = user_id);

-- Generated images policies
CREATE POLICY "Users can view own images" ON generated_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own images" ON generated_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON generated_images FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email)
    );
    RETURN new;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Function to check if user can generate article
CREATE OR REPLACE FUNCTION can_generate_article(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_limit integer;
BEGIN
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    v_limit := COALESCE((v_profile.plan_limits->>'articles_per_month')::integer, 10);
    
    RETURN v_profile.articles_generated_this_month < v_limit;
END;
$$;

-- Function to increment article counter
CREATE OR REPLACE FUNCTION increment_article_counter(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET articles_generated_this_month = articles_generated_this_month + 1
    WHERE id = p_user_id;
END;
$$;

-- Function to increment image counter
CREATE OR REPLACE FUNCTION increment_image_counter(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET images_generated_this_month = images_generated_this_month + p_count
    WHERE id = p_user_id;
END;
$$;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
DROP TRIGGER IF EXISTS update_brand_voices_updated_at ON brand_voices;
DROP TRIGGER IF EXISTS update_wordpress_sites_updated_at ON wordpress_sites;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_voices_updated_at
    BEFORE UPDATE ON brand_voices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordpress_sites_updated_at
    BEFORE UPDATE ON wordpress_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! Your database is ready! ✅
-- =====================================================

SELECT 'Database setup complete! All tables, policies, functions, and triggers are ready.' AS status;
