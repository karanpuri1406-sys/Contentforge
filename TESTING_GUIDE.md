# Testing Guide for API Key & Navigation Fixes

## 🎯 What Was Fixed

### Issue #1: API Keys Not Being Detected
**Problem**: After adding an API key in Settings, the Dashboard still showed "API Keys Required" warning.

**Root Causes**:
1. IndexedDB write operations weren't completing before navigation
2. Dashboard wasn't properly polling for changes
3. No verification that keys were actually saved

**Solutions**:
1. Added `dbHelpers.ts` with robust database operations
2. Enhanced Dashboard with multi-method API key detection
3. Added 300ms delay after saving to ensure IndexedDB write completes
4. Increased polling interval to 3 seconds with proper logging
5. Added multiple verification steps when saving keys

### Issue #2: Settings Navigation Issues
**Problem**: Settings page was using `window.location.href` which caused full page reloads and potential state loss.

**Solution**: Changed to use React Router's `navigate()` function for smooth client-side navigation.

---

## 🧪 Testing Steps

### Test 1: Fresh Start - No API Keys

1. **Open the app**: https://5177-i57gqy9s2kiht89j1qaiv-02b9cc79.sandbox.novita.ai

2. **Clear IndexedDB** (to simulate fresh user):
   - Open Chrome DevTools (F12)
   - Go to **Application** tab
   - Find **IndexedDB** → **SEOBlogDatabase**
   - Right-click and **Delete Database**
   - Refresh the page (F5)

3. **You should see**:
   - Yellow warning box: "API Keys Required"
   - Stats showing 0 articles
   - "Add API Keys" button

4. **Open Console** (still in DevTools, go to Console tab):
   - You should see logs like:
     ```
     [Dashboard] Component mounted, loading stats...
     [Dashboard] Stats loaded: {articles: 0, activeKeys: 0, ...}
     [Dashboard] Polling for updates...
     ```

### Test 2: Add Your First API Key

1. **Click "Add API Keys"** button (should navigate to Settings)

2. **Verify navigation**:
   - URL should change to `/settings`
   - Settings page should load without full page reload
   - No flashing or re-initialization

3. **Add a Gemini API Key**:
   - Provider: Gemini
   - API Key: `AIza...` (get one from https://makersuite.google.com/app/apikey)
   - Nickname: "My Gemini Key" (optional)
   - Click **Add API Key**

4. **Watch the Console**:
   You should see logs like:
   ```
   [Settings] Adding API key... {provider: 'gemini', hasNickname: true, ...}
   [Settings] API key added with ID: 1
   [Settings] Verified saved key: {id: 1, provider: 'gemini', ...}
   [Settings] All keys in DB now: 1 [{id: 1, ...}]
   [Settings] Active keys: 1
   [Settings] Navigating to dashboard...
   ```

5. **After 1.5 seconds**:
   - You should see success message: "API key added successfully! Redirecting to dashboard..."
   - Smooth navigation to Dashboard (no full page reload)

6. **Dashboard should now show**:
   - NO yellow warning (API key detected!)
   - Stats cards
   - "Start Generating" section

### Test 3: Debug Information

1. **On Dashboard**, scroll down to see:
   - Collapsible debug section: "🔧 Debug Info (Click to expand)"
   - Click it to see detailed logs

2. **You should see**:
   ```
   [2026-01-14T...] Loading dashboard stats...
   Found 0 articles
   getActiveApiKeys() returned 1 keys
   Total keys in DB: 1
   Query for active keys returned: 1
   ```

3. **Click "View Full Diagnostics Page"** link

### Test 4: Diagnostics Page

1. **You should see** comprehensive database information:
   - **Database Stats**: articles, apiKeys, activeApiKeys, etc.
   - **API Keys Details**: List of all API keys with:
     - ID, Provider, Nickname
     - Active status
     - Created date
   - **Database Structure**: Tables and their counts
   - **Recent Activity**: What's happening in the database

2. **Test actions**:
   - Click "Refresh Diagnostics" - should reload data
   - Click "View in Console" - opens IndexedDB in DevTools

### Test 5: Manual Refresh

1. **Delete your API key** (Settings → API Keys → Delete)

2. **Go back to Dashboard**:
   - Should see yellow warning again after 3 seconds (polling)
   - Click **Refresh** button
   - Warning should update immediately

3. **Add key again** (Settings → Add API Key)

4. **Dashboard should update** automatically within 3 seconds

### Test 6: Multiple API Keys

1. **Add second API key** (Settings):
   - Provider: OpenRouter
   - API Key: `sk-or-...`
   - Nickname: "OpenRouter"

2. **Toggle keys on/off**:
   - Click toggle switch next to each key
   - Watch console for:
     ```
     [DB] Toggling API key active status: X
     [DB] API key toggled successfully
     ```

3. **Dashboard should detect changes** within 3 seconds

---

## 🔍 How to Debug Issues

### If API Key Still Not Detected:

1. **Check Console** for errors or warnings
2. **Check IndexedDB**:
   - DevTools → Application → IndexedDB → SEOBlogDatabase
   - Click **apiKeys** table
   - Verify your key exists with `isActive: true`

3. **Check Debug Info** on Dashboard:
   - Expand "🔧 Debug Info"
   - Look for mismatches between:
     - `getActiveApiKeys() returned X keys`
     - `Total keys in DB: Y`
     - `Query for active keys returned: Z`

4. **Try Manual Refresh**:
   - Click the Refresh button on Dashboard
   - Should force immediate reload

5. **Check Diagnostics Page** (`/diagnostics`):
   - See complete database state
   - Verify API keys are listed
   - Check "Active" status

### If Navigation Issues Persist:

1. **Check browser console** for navigation errors
2. **Verify React Router** is working:
   - URL should change without full page reload
   - No white flash or re-initialization
3. **Try hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R)

### Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| Keys not saved | Browser storage disabled | Enable cookies/storage in browser settings |
| Polling not working | Tab in background | Bring tab to foreground; polling runs normally |
| Keys disappear | IndexedDB cleared | Re-add keys; they persist until manually deleted |
| Navigation loops | Conflicting routes | Check React Router configuration |

---

## 📊 Expected Behavior

### Normal Flow:
1. **First Visit**: See warning, 0 active keys
2. **Add Key**: Logs show save → verify → redirect
3. **Dashboard**: Warning disappears, stats show 1+ active keys
4. **Polling**: Every 3 seconds, Dashboard checks for changes
5. **Settings Changes**: Detected automatically within 3 seconds

### Performance:
- **Add Key**: ~500ms (including verification)
- **Navigation**: Instant (React Router, no reload)
- **Polling**: Every 3 seconds (low overhead)
- **IndexedDB Read**: <10ms typically

---

## 🎓 Understanding the Logging

### Console Log Prefixes:

- `[Dashboard]` - Dashboard component
- `[Settings]` - Settings page
- `[DB]` - Database helper functions
- `[Service]` - AI/WordPress/Scraping services

### Key Logs to Watch:

**When adding a key:**
```
[Settings] Adding API key... → Key add initiated
[Settings] API key added with ID: X → Successfully saved
[Settings] Verified saved key: {...} → Read back from DB
[Settings] All keys in DB now: X → Total count
[Dashboard] Found API keys: [...] → Dashboard detected it
```

**Polling (every 3 seconds):**
```
[Dashboard] Polling for updates...
[Dashboard] Stats loaded: {articles: X, activeKeys: Y}
```

**Debug info shows:**
- Timestamp of each check
- Number of articles found
- Number of active keys (multiple methods)
- Any discrepancies

---

## 🚀 Deployment Testing

### When deploying to Netlify/Vercel:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder**

3. **Test in production**:
   - Clear browser cache
   - Test full flow (add key → generate article)
   - Check browser console for any errors

4. **IndexedDB persists** even after closing browser:
   - Close and reopen browser
   - Go back to your app
   - API keys should still be there

---

## 📞 Support

If you encounter issues:

1. **Check this guide** first
2. **Check browser console** for errors
3. **Check Diagnostics page** for database state
4. **Provide logs** when reporting issues

---

## ✅ Success Criteria

You know it's working when:

- ✅ Add API key → immediately verified in console
- ✅ Navigate to Dashboard → warning disappears
- ✅ Refresh page → keys still there
- ✅ Dashboard polls every 3 seconds
- ✅ Manual refresh button works
- ✅ Diagnostics page shows correct data
- ✅ No JavaScript errors in console
- ✅ Navigation is smooth (no full page reloads)

---

**Current Version**: v1.1.0 (with API key detection & navigation fixes)  
**Last Updated**: 2026-01-14  
**Live Demo**: https://5177-i57gqy9s2kiht89j1qaiv-02b9cc79.sandbox.novita.ai
