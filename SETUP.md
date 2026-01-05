# 🚀 BlogForge AI - Setup Guide

Complete setup instructions to get BlogForge AI running locally or in production.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier available)
- A Google Gemini API key (free tier available)

---

## 🛠 Step 1: Clone the Repository

```bash
git clone https://github.com/karanpuri1406-sys/Contentforge.git
cd Contentforge
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

---

## 🗄 Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### 3.2 Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Option B: Using SQL Editor**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of:
   - `supabase/migrations/20260103032021_create_initial_schema.sql`
   - `supabase/migrations/20260105000001_enhance_for_seo_platform.sql`
4. Run each migration in order

### 3.3 Get Supabase Credentials

1. Go to Project Settings > API
2. Copy:
   - Project URL (VITE_SUPABASE_URL)
   - Anon/Public Key (VITE_SUPABASE_ANON_KEY)

---

## 🔧 Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
nano .env
```

Your `.env` should look like:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎨 Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🔑 Step 6: Get Your AI API Keys

### Gemini API (Recommended - Free Tier Available)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Free Tier Limits:**
- 60 requests per minute
- 1500 requests per day
- Perfect for getting started!

### OpenRouter (Optional - Premium Quality)

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account
3. Add credits ($5 minimum)
4. Generate an API key

**Benefits:**
- Access to Claude Sonnet 4/4.5
- Premium content quality
- Pay-as-you-go pricing

---

## 👤 Step 7: Create Your Account

1. Open the app at `http://localhost:5173`
2. Click "Sign Up"
3. Enter your email and password
4. Verify your email (check Supabase email settings)

---

## 🔐 Step 8: Add Your API Key

1. Log in to BlogForge AI
2. Go to **Settings > API Keys**
3. Click "Add API Key"
4. Select provider (Gemini or OpenRouter)
5. Paste your API key
6. Click "Add Key" (it will be validated automatically)

---

## ✍️ Step 9: Generate Your First Article

1. Navigate to **Generate Article**
2. Fill in the form:
   - **Topic**: e.g., "Best Coffee Brewing Methods"
   - **Article Type**: Choose from Product Review, Roundup, or Information Guide
   - **Output Format**: Multimedia HTML (recommended)
   - **Tone**: Authoritative
   - **Word Count**: 3000
3. Configure advanced settings as needed
4. Click **"Generate Article"**
5. Wait 1-3 minutes for generation
6. View your SEO-optimized article with embedded images!

---

## 🏗 Step 10: Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

---

## 🚀 Deployment Options

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Cloudflare Pages

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

---

## 🔧 Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts with plan limits |
| `blog_posts` | Generated articles with metadata |
| `api_keys` | User's AI provider API keys |
| `brand_voices` | Custom brand voice definitions |
| `wordpress_sites` | Connected WordPress sites |
| `internal_links` | Parsed sitemap links |
| `generated_images` | AI-generated images |
| `api_usage` | Usage tracking for billing |

### Key Functions

- `can_generate_article(user_id)` - Check if user can generate
- `increment_article_counter(user_id)` - Track usage
- `increment_image_counter(user_id, count)` - Track image usage
- `reset_monthly_counters()` - Reset monthly limits

---

## 🎯 Plan Limits Configuration

Default limits in `profiles` table:

```json
{
  "articles_per_month": 10,
  "images_per_month": 20,
  "wordpress_sites": 1,
  "brand_voices": 1,
  "bulk_generation": false,
  "competitor_analysis": false
}
```

Update these in the database for different plans (Starter/Pro/Premium).

---

## 🐛 Troubleshooting

### "No active API key found"
- Make sure you've added an API key in Settings > API Keys
- Ensure the API key is marked as "Active"

### "Monthly article limit reached"
- Check your plan limits in the database
- Update `plan_limits` in the `profiles` table
- Or wait for the monthly reset

### Supabase Connection Error
- Verify your `.env` file has correct credentials
- Check if Supabase project is running
- Verify your IP isn't blocked in Supabase settings

### Images Not Generating
- Ensure you're using Gemini API (OpenRouter doesn't support images)
- Check Gemini API quota hasn't been exceeded
- Verify API key has Image Generation enabled

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/karanpuri1406-sys/Contentforge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/karanpuri1406-sys/Contentforge/discussions)
- **Email**: support@blogforge.ai

---

## 🎉 You're All Set!

Start generating amazing SEO-optimized content with BlogForge AI! 🚀

If you found this helpful, please ⭐ star the repository on GitHub!

---

**Happy Blogging! ✨**
