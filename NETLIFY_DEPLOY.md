# 🚀 Netlify Deployment Guide for BlogForge AI

## 🔧 Quick Fix for "Site Not Displaying" Issue

If your Netlify site is showing a blank page or not displaying correctly, follow these steps:

---

## ✅ Step 1: Configure Build Settings

In your Netlify dashboard:

1. Go to **Site Settings** > **Build & Deploy** > **Build Settings**
2. Set the following:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher

---

## ✅ Step 2: Add Environment Variables

**CRITICAL**: Your app needs Supabase credentials to work.

1. Go to **Site Settings** > **Environment Variables**
2. Click **Add a variable**
3. Add these variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example**:
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these values**:
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy **Project URL** and **anon/public key**

---

## ✅ Step 3: Redeploy Your Site

After adding environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Clear cache and deploy site**
3. Wait for the build to complete (usually 1-2 minutes)

---

## ✅ Step 4: Check Build Logs

If deployment fails:

1. Go to the latest deploy
2. Click on it to view **Deploy log**
3. Look for error messages

**Common errors**:

### ❌ "Command not found: npm"
**Fix**: Set Node version to 18+ in Build Settings

### ❌ "Module not found"
**Fix**: Make sure `package.json` is committed to git

### ❌ "Build failed"
**Fix**: Check if `npm run build` works locally first

### ❌ Blank page / White screen
**Fix**: Missing environment variables (see Step 2)

---

## 🔍 Debugging Steps

### 1. Test Build Locally

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build

# Test production build locally
npm run preview
```

If it works locally but not on Netlify, it's likely an environment variable issue.

### 2. Check Browser Console

1. Open your Netlify site
2. Press `F12` (or right-click > Inspect)
3. Go to **Console** tab
4. Look for errors

**Common Console Errors**:

#### ❌ "Failed to fetch" or "Network Error"
**Cause**: Missing or incorrect Supabase credentials
**Fix**: Add/update environment variables in Netlify

#### ❌ "Unexpected token '<'" 
**Cause**: 404 errors due to incorrect routing
**Fix**: `netlify.toml` file should be committed (already done!)

#### ❌ CORS errors
**Cause**: Supabase URL mismatch
**Fix**: Double-check `VITE_SUPABASE_URL` is exactly as shown in Supabase dashboard

### 3. Verify Environment Variables Are Applied

After adding environment variables, you MUST redeploy:
- Environment variables are only applied during build time
- Simply saving them doesn't trigger a rebuild
- Use "Clear cache and deploy site" button

---

## 📋 Checklist for Successful Deployment

- [ ] `netlify.toml` is committed to git
- [ ] `public/_redirects` file exists
- [ ] Build command is `npm run build`
- [ ] Publish directory is `dist`
- [ ] Node version is 18+
- [ ] `VITE_SUPABASE_URL` is set in Netlify environment variables
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Netlify environment variables
- [ ] Environment variables match your Supabase project
- [ ] Site has been redeployed after adding environment variables
- [ ] No errors in build log
- [ ] No errors in browser console

---

## 🎯 Expected Behavior After Fix

✅ Site loads properly  
✅ Landing page displays  
✅ Can navigate to Login/Signup  
✅ No console errors  
✅ Supabase authentication works  

---

## 🆘 Still Not Working?

### Option 1: Check Netlify Status
Sometimes Netlify has outages: https://www.netlifystatus.com/

### Option 2: Try a Fresh Deploy

1. Delete the site in Netlify
2. Create new site from Git
3. Follow all steps above carefully
4. Make sure to add environment variables BEFORE first deploy

### Option 3: Alternative Deployment (Vercel)

If Netlify continues to have issues, try Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables when prompted
```

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify SPA Routing](https://docs.netlify.com/routing/redirects/redirect-options/#history-pushstate-and-single-page-apps)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)

---

## ✉️ Need Help?

If you're still stuck after following all steps:

1. Open a [GitHub Issue](https://github.com/karanpuri1406-sys/Contentforge/issues)
2. Include:
   - Netlify deploy log (screenshot)
   - Browser console errors (screenshot)
   - Confirmation that environment variables are set
   - Your Netlify site URL

---

## 🎉 Success!

Once everything is working:
- Your site should be live at `https://neuralscribe.netlify.app/`
- Users can sign up and log in
- Article generation works (after users add their API keys)

**Happy deploying! 🚀**
