# 🚀 Deploying Bolt.new Project to Netlify

## ⚡ Quick Fix for Your Blank Page Issue

Your site https://neuralscribe.netlify.app/ is showing a blank page because **Netlify doesn't have your Supabase credentials**.

---

## ✅ **3-Step Fix (5 minutes)**

### **Step 1: Get Your Supabase Credentials**

1. Go to https://app.supabase.com
2. **If you don't have a project yet:**
   - Click "New Project"
   - Fill in project details
   - Wait 2 minutes for setup
3. Once project is ready:
   - Go to **Settings** (⚙️ icon in sidebar)
   - Click **API**
   - Copy these two values:
     - **Project URL** (e.g., `https://abc123xyz.supabase.co`)
     - **anon public** key (long string starting with `eyJ...`)

### **Step 2: Add Environment Variables to Netlify**

1. Go to https://app.netlify.com
2. Click on your "neuralscribe" site
3. Go to **Site configuration** > **Environment variables**
4. Click **"Add a variable"** and add:

**First Variable:**
```
Key: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
```

**Second Variable:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your long key)
```

### **Step 3: Redeploy Your Site**

**IMPORTANT**: Environment variables only work after redeployment!

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** button (top right)
3. Select **"Clear cache and deploy site"**
4. Wait 1-2 minutes
5. ✅ Your site should now work!

---

## 🗄️ **Step 4: Set Up Your Database (Required!)**

Even after the site loads, you need to run database migrations:

### **Option A: Using Supabase Dashboard (Easy)**

1. In your Supabase project, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the contents of `supabase/migrations/20260103032021_create_initial_schema.sql`
4. Click **"Run"**
5. Create another new query
6. Copy and paste the contents of `supabase/migrations/20260105000001_enhance_for_seo_platform.sql`
7. Click **"Run"**

### **Option B: Using Supabase CLI (Advanced)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

---

## 🎯 **Expected Result**

After completing ALL steps:

✅ Site loads properly at https://neuralscribe.netlify.app/  
✅ Landing page displays with "BlogForge AI" branding  
✅ "Login" and "Sign Up" buttons work  
✅ Users can create accounts  
✅ Users can add their API keys  
✅ Users can generate articles  

---

## 🔍 **Testing Your Deployment**

1. **Open** https://neuralscribe.netlify.app/
2. **Press F12** (or right-click → Inspect)
3. **Go to Console tab**
4. **Look for errors**

### **Common Console Errors:**

❌ **"Missing Supabase environment variables"**
- **Fix**: Add environment variables in Netlify (Step 2)

❌ **"Failed to fetch"**  
- **Fix**: Double-check your Supabase URL and key are correct

❌ **"relation does not exist"**
- **Fix**: Run database migrations (Step 4)

❌ **"Invalid API key"**
- **Fix**: Make sure you copied the **anon public** key, not the service role key

---

## 📋 **Complete Checklist**

### Setup:
- [ ] Created Supabase project
- [ ] Copied Project URL and anon key
- [ ] Added `VITE_SUPABASE_URL` to Netlify
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Netlify
- [ ] Triggered redeploy in Netlify
- [ ] Ran database migrations in Supabase

### Testing:
- [ ] Site loads without blank page
- [ ] No errors in browser console
- [ ] Can click "Sign Up"
- [ ] Can create an account
- [ ] Can log in
- [ ] Can access dashboard

---

## 🆘 **Still Having Issues?**

### Issue: Site still shows blank page after redeploy

**Solution:**
1. Go to Netlify **Deploys** tab
2. Click on the latest deploy
3. Scroll down to **Deploy log**
4. Look for any errors
5. Common issue: Make sure both environment variables are added

### Issue: "Missing Supabase environment variables" error

**Solution:**
1. Verify in Netlify: **Site configuration** > **Environment variables**
2. Make sure both variables are there
3. Make sure there are no extra spaces in the values
4. Redeploy after adding/fixing them

### Issue: Can't sign up / Login doesn't work

**Solution:**
1. Check if database migrations were run
2. In Supabase dashboard, go to **Table Editor**
3. You should see tables: `profiles`, `blog_posts`, `api_keys`, etc.
4. If tables don't exist, run migrations (Step 4)

### Issue: Environment variables not working

**Solution:**
In Netlify, environment variables MUST start with `VITE_` for Vite projects:
- ✅ Correct: `VITE_SUPABASE_URL`
- ❌ Wrong: `SUPABASE_URL`

---

## 📱 **What Your Users Will See**

1. **Landing Page**: Introduction to BlogForge AI
2. **Sign Up**: Create account with email/password
3. **Dashboard**: View stats and quick actions
4. **Generate Article**: Form with 20+ customization options
5. **API Keys**: Add Gemini or OpenRouter API keys
6. **My Content**: View generated articles

---

## 💡 **Pro Tips**

1. **Test locally first**: Run `npm run dev` to make sure everything works
2. **Check build**: Run `npm run build` to ensure build succeeds
3. **Use Netlify CLI**: `netlify dev` to test locally with Netlify environment
4. **Enable Netlify Functions**: If you add serverless functions later
5. **Custom Domain**: Add your own domain in Netlify settings

---

## 🎊 **Success!**

Once everything is working, you'll have a fully functional AI blog generation platform live on the internet!

**Share it:**
- Tweet about it
- Post on LinkedIn
- Share on Reddit (r/SideProject)
- Add to your portfolio

---

## 📚 **Additional Resources**

- [Netlify Docs](https://docs.netlify.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Full Setup Guide](SETUP.md)
- [Netlify Troubleshooting](NETLIFY_DEPLOY.md)

---

**Need more help?** Open an issue on GitHub or check the [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md) for detailed troubleshooting.

**Good luck! 🚀**
