# 🗄️ Database Setup Instructions

## ✅ **Fix the Policy Error**

The error you're seeing (`policy "Users can view own API keys" already exists`) means you've partially run the migration before. Here's how to fix it:

---

## 📝 **Step-by-Step Instructions**

### **Step 1: Open Supabase SQL Editor**

Click this link: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/sql/new

### **Step 2: Clear the Editor**

- Select all the text in the SQL editor (Ctrl+A or Cmd+A)
- Delete it

### **Step 3: Copy the Clean Migration SQL**

The clean SQL file is located at:
```
/home/user/webapp/supabase/CLEAN_MIGRATION.sql
```

**Or copy it from below:**

1. Open the file: `/home/user/webapp/supabase/CLEAN_MIGRATION.sql`
2. Copy ALL the content (it's about 380 lines)
3. Paste it into the Supabase SQL Editor

### **Step 4: Run the SQL**

- Click the green **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
- Wait for it to complete (should take 5-10 seconds)

### **Step 5: Verify Success**

You should see:
```
✅ Success. No rows returned
```

Or:
```
status: "Database setup complete! All tables, policies, functions, and triggers are ready."
```

---

## 🎯 **What This SQL Does**

### **Safety First:**
- ✅ Drops ALL existing policies first (prevents conflicts)
- ✅ Uses `CREATE TABLE IF NOT EXISTS` (won't fail if tables exist)
- ✅ Uses `CREATE INDEX IF NOT EXISTS` (safe to run multiple times)
- ✅ Safe to run multiple times - idempotent

### **Creates These Tables:**
1. ✅ `profiles` - User profiles with plan limits
2. ✅ `blog_posts` - Generated articles with full metadata
3. ✅ `api_keys` - Encrypted API key storage (Gemini, OpenRouter)
4. ✅ `api_usage` - Track API usage and costs
5. ✅ `brand_voices` - Custom brand voice templates
6. ✅ `wordpress_sites` - WordPress site connections
7. ✅ `internal_links` - Internal linking management
8. ✅ `generated_images` - AI-generated images tracking

### **Security (Row Level Security):**
- ✅ Each user can only see/edit their own data
- ✅ Automatic profile creation on signup
- ✅ Plan limits enforcement
- ✅ Usage tracking per user

### **Functions Created:**
- `handle_new_user()` - Auto-create profile on signup
- `can_generate_article()` - Check if user has credits
- `increment_article_counter()` - Track article generation
- `increment_image_counter()` - Track image generation
- `update_updated_at_column()` - Auto-update timestamps

---

## 🔍 **Troubleshooting**

### **If you see any errors:**

**Error: "relation already exists"**
- ✅ This is OK! The migration handles existing tables
- Just continue, it will skip them

**Error: "policy already exists"**
- ✅ The clean migration drops all policies first
- This shouldn't happen with the new SQL

**Error: "permission denied"**
- Make sure you're logged in to Supabase
- Try refreshing the page and running again

### **To Start Fresh (Optional):**

If you want to completely reset your database:

1. Go to: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/database/tables
2. For each table (profiles, blog_posts, api_keys, etc.):
   - Click on the table
   - Click "Delete table" (trash icon)
3. Run the CLEAN_MIGRATION.sql again

⚠️ **WARNING:** This will delete ALL data in your database!

---

## ✅ **After Database Setup**

Once the SQL runs successfully:

1. **Update `.env.local`** with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://luvzgdf6jinqydtflhdj.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_publishable_key_here
   ```

2. **Reload the dev server**: https://5173-ixulet3iirxv4edpetxnn-583b4d74.sandbox.novita.ai/

3. **Test signup**:
   - Click "Sign Up"
   - Create a test account
   - You should see the dashboard!

4. **Add API Key**:
   - Go to "API Keys" in sidebar
   - Add your Gemini API key
   - Start generating articles!

---

## 🎉 **Expected Result**

After running this SQL, you'll have:
- ✅ All database tables created
- ✅ Row-level security enabled
- ✅ User authentication working
- ✅ Profile auto-creation on signup
- ✅ Plan limits enforced
- ✅ Usage tracking active

**Your platform will be fully functional!** 🚀

---

## 📞 **Need More Help?**

If you're still seeing errors:
1. Take a screenshot of the exact error
2. Check the Supabase logs: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/logs/explorer
3. Make sure you're using the CLEAN_MIGRATION.sql (not the old one)

---

**Ready?** 

👉 Open Supabase SQL Editor: https://app.supabase.com/project/luvzgdf6jinqydtflhdj/sql/new

👉 Copy `/home/user/webapp/supabase/CLEAN_MIGRATION.sql`

👉 Run it!

👉 Enjoy your AI blog platform! 🎊
