# 🚀 Quick Start - Get BlogForge AI Running in 2 Minutes!

## ❌ Current Issue: Missing Supabase Credentials

Your dev server is running but can't connect to the database because the `.env.local` file needs your actual Supabase credentials.

---

## ✅ **Fix in 3 Easy Steps**

### Step 1: Get Your Supabase Credentials

1. Go to: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/settings/api
2. You'll see two values:
   - **Project URL**: `https://luvzgdf6jinqydtflhdj.supabase.co`
   - **Anon/Public Key**: Click the 📋 copy icon next to "anon public" (starts with `sb_pub1sshable_...`)

### Step 2: Update the `.env.local` File

Open `/home/user/webapp/.env.local` and replace `PASTE_YOUR_PUBLISHABLE_KEY_HERE` with your actual key.

**The file should look like this:**
```env
VITE_SUPABASE_URL=https://luvzgdf6jinqydtflhdj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_pub1sshable_YM0vF8cYplgvcQVT81MS1Q_8jQft...
```

### Step 3: Restart the Dev Server

The server will automatically reload once you save the `.env.local` file!

---

## 🎯 **Then Test Your Platform**

Once the server restarts with proper credentials:

1. **Open:** https://5173-ixulet3iirxv4edpetxnn-583b4d74.sandbox.novita.ai/
2. **Sign Up:** Create a test account
3. **Add API Key:** Go to "API Keys" and add your Gemini API key
4. **Generate Article:** Click "Generate Article" and create your first SEO-optimized blog!

---

## 🗄️ **Database Setup (Required)**

Before generating articles, you need to set up your Supabase database:

### Run This SQL in Supabase SQL Editor

Go to: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/sql/new

Copy and paste the SQL from: `/home/user/webapp/supabase/migrations/20260105000001_enhance_for_seo_platform.sql`

**Or use the clean migration I provided earlier in the conversation.**

This creates:
- ✅ User profiles with plan limits
- ✅ Blog posts table
- ✅ API keys storage (encrypted)
- ✅ Generated images tracking
- ✅ Brand voices
- ✅ WordPress sites
- ✅ Row-level security policies

---

## 📝 **Quick Checklist**

- [ ] Get Supabase credentials from project settings
- [ ] Update `.env.local` with actual anon key
- [ ] Server automatically restarts (or manually restart if needed)
- [ ] Run database migration in Supabase SQL editor
- [ ] Test signup at dev server URL
- [ ] Add Gemini API key in platform
- [ ] Generate first article!

---

## 🆘 **Need Help?**

### If the page is still blank:
1. Check browser console (F12) for errors
2. Verify `.env.local` has the correct key (no extra spaces)
3. Make sure database migration ran successfully
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Common Errors:

**"Invalid API key"**
- Double-check you copied the full `sb_pub1sshable_...` key
- Make sure there are no spaces or line breaks

**"Table does not exist"**
- Run the database migration in Supabase SQL editor

**"Failed to load resource"**
- Make sure `.env.local` file is saved
- Restart dev server if auto-reload didn't work

---

## 🎉 **Once It's Working**

You'll have a fully functional AI blog platform with:
- ✅ User authentication
- ✅ Article generation with Gemini AI
- ✅ SEO optimization
- ✅ Image generation
- ✅ Multiple article types
- ✅ HTML widgets
- ✅ Competitor analysis
- ✅ Brand voices

**Enjoy building amazing SEO content!** 🚀
