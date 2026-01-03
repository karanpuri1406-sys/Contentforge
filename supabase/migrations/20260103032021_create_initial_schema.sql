/*
  # Initial Schema for ContentForge AI

  ## Overview
  This migration creates the core database structure for the ContentForge AI blog writing SaaS platform.

  ## New Tables

  ### 1. profiles
  Stores user profile information and preferences.
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `plan` (text) - Subscription plan (free, pro, enterprise)
  - `monthly_credits` (integer) - Available generation credits
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. blog_posts
  Stores generated blog posts and their configuration.
  - `id` (uuid, primary key) - Unique post identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `title` (text) - Blog post title
  - `content` (text) - Generated content
  - `topic` (text) - Main topic/subject
  - `target_audience` (text) - Target audience description
  - `tone` (text) - Tone of voice
  - `keywords` (text[]) - SEO keywords array
  - `status` (text) - Post status (draft, published, archived)
  - `word_count` (integer) - Word count of content
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. api_usage
  Tracks API usage for billing and rate limiting.
  - `id` (uuid, primary key) - Unique usage record identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `tokens_used` (integer) - Number of tokens consumed
  - `cost` (decimal) - Estimated cost
  - `model` (text) - AI model used
  - `created_at` (timestamptz) - Usage timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce authentication and ownership checks
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  plan text DEFAULT 'free' NOT NULL,
  monthly_credits integer DEFAULT 10 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  topic text NOT NULL,
  target_audience text,
  tone text,
  keywords text[],
  status text DEFAULT 'draft' NOT NULL,
  word_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tokens_used integer NOT NULL,
  cost decimal(10, 4) NOT NULL,
  model text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Blog posts policies
CREATE POLICY "Users can view own blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view own API usage"
  ON api_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage"
  ON api_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();