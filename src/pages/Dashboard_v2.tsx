import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Sparkles, ArrowRight, Key, RefreshCw } from 'lucide-react';
import { db } from '../lib/db';
import { getSetting, getAllSettings } from '../lib/simpleStorage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    draftArticles: 0,
    publishedArticles: 0,
    hasApiKeys: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  /**
   * Check for API keys using simple storage (RocketSEO approach)
   * This gets called fresh every time without caching
   */
  const checkApiKeys = async (): Promise<boolean> => {
    console.log('[Dashboard] Checking API keys directly from IndexedDB...');
    
    // Get keys fresh from IndexedDB every time (no caching)
    const geminiData = await getSetting('gemini_api_key');
    const openrouterData = await getSetting('openrouter_api_key');
    
    const hasGemini = !!(geminiData?.keyValue);
    const hasOpenRouter = !!(openrouterData?.keyValue);
    const hasAnyKey = hasGemini || hasOpenRouter;
    
    console.log('[Dashboard] API Key check:', { 
      hasGemini, 
      hasOpenRouter, 
      hasAnyKey,
      geminiLength: geminiData?.keyValue?.length,
      openrouterLength: openrouterData?.keyValue?.length
    });
    
    return hasAnyKey;
  };

  /**
   * Load stats - gets called on mount and periodically
   */
  const loadStats = async () => {
    const checkId = Date.now();
    setCheckCount(prev => prev + 1);
    
    console.log(`[Dashboard] Loading stats (check #${checkCount + 1}) at ${new Date().toLocaleTimeString()}`);
    
    try {
      // Get articles from Dexie
      const articles = await db.articles.toArray();
      console.log(`[Dashboard] Found ${articles.length} articles`);
      
      // Check API keys using simple storage
      const hasKeys = await checkApiKeys();
      
      // Also log all settings for debugging
      const allSettings = await getAllSettings();
      console.log('[Dashboard] All settings in DB:', allSettings.map(s => ({ key: s.key, hasValue: !!s.value })));
      
      setStats({
        totalArticles: articles.length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        hasApiKeys: hasKeys,
      });
      
      console.log('[Dashboard] Stats updated:', { hasKeys, articles: articles.length });
    } catch (error) {
      console.error('[Dashboard] Error loading stats:', error);
    }
  };

  /**
   * Manual refresh handler
   */
  const handleManualRefresh = async () => {
    console.log('[Dashboard] Manual refresh triggered');
    setIsRefreshing(true);
    await loadStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  /**
   * Effect: Load on mount and poll every 2 seconds
   * Re-runs checkApiKeys on EVERY poll (no caching)
   */
  useEffect(() => {
    console.log('[Dashboard] Component mounted, starting checks...');
    
    // Initial load
    loadStats();
    
    // Poll every 2 seconds for API key changes
    const interval = setInterval(() => {
      console.log('[Dashboard] Polling...');
      loadStats();
    }, 2000);
    
    return () => {
      console.log('[Dashboard] Component unmounting, clearing interval');
      clearInterval(interval);
    };
  }, []); // Empty deps = run once on mount

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to BlogForge AI</h1>
        <p className="text-gray-300 text-lg">
          Create SEO-optimized blog content that ranks. Powered by your own AI.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Check #{checkCount} • {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* API Key Warning */}
      {!stats.hasApiKeys && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Key className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                API Keys Required
              </h3>
              <p className="text-gray-300 mb-4">
                To start generating content, you need to add your Gemini (free) or OpenRouter API key.
                Keys are stored locally in your browser using IndexedDB.
              </p>
              <div className="flex items-center space-x-3">
                <Link
                  to="/settings"
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                >
                  Add API Keys
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
                  title="Refresh to check for API keys"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="ml-2">Refresh</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                💡 Already added a key? Click refresh or wait 2 seconds for auto-detection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Key Success Message */}
      {stats.hasApiKeys && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-400">API Key Connected ✓</h3>
              <p className="text-xs text-gray-400">You're ready to generate content</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.totalArticles}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Total Articles</h3>
          <p className="text-sm text-gray-400 mt-1">All time generated</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.publishedArticles}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Published</h3>
          <p className="text-sm text-gray-400 mt-1">Live articles</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-orange-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.draftArticles}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Drafts</h3>
          <p className="text-sm text-gray-400 mt-1">Work in progress</p>
        </div>
      </div>

      {/* Start Generating Section */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span>Start Generating Content</span>
            </h2>
            <p className="text-gray-300">
              Create SEO-optimized articles with AI-powered research and competitor analysis
            </p>
          </div>
          <Link
            to="/generate"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
          >
            Generate Article
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Writing</h3>
          <p className="text-gray-400 text-sm">
            Generate high-quality, engaging content using Gemini or Claude AI models.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">SEO Optimized</h3>
          <p className="text-gray-400 text-sm">
            Advanced keyword optimization, meta tags, schema markup, and internal linking.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Competitor Analysis</h3>
          <p className="text-gray-400 text-sm">
            Analyze top-ranking articles and create better content that outranks them.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Beautiful HTML</h3>
          <p className="text-gray-400 text-sm">
            Rich formatting with tables, callouts, accordions, and interactive elements.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">WordPress Publishing</h3>
          <p className="text-gray-400 text-sm">
            Publish directly to your WordPress site with one click. Supports categories and tags.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Internal Linking</h3>
          <p className="text-gray-400 text-sm">
            Import your sitemap and automatically add relevant internal links to boost SEO.
          </p>
        </div>
      </div>
    </div>
  );
}
