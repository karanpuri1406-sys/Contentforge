import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Sparkles, ArrowRight, Key, RefreshCw, AlertTriangle } from 'lucide-react';
import { db } from '../lib/db';
import { getActiveApiKeys } from '../lib/dbHelpers';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    draftArticles: 0,
    publishedArticles: 0,
    hasApiKeys: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const loadStats = async () => {
    const logs: string[] = [];
    try {
      logs.push(`[${new Date().toISOString()}] Loading dashboard stats...`);
      
      const articles = await db.articles.toArray();
      logs.push(`Found ${articles.length} articles`);
      
      // Try multiple methods to get API keys
      const activeKeys = await getActiveApiKeys();
      logs.push(`getActiveApiKeys() returned ${activeKeys.length} keys`);
      
      const allKeys = await db.apiKeys.toArray();
      logs.push(`Total keys in DB: ${allKeys.length}`);
      
      const activeKeysQuery = await db.apiKeys.where({ isActive: true }).toArray();
      logs.push(`Query for active keys returned: ${activeKeysQuery.length}`);

      console.log('[Dashboard] Stats loaded:', { 
        articles: articles.length, 
        activeKeys: activeKeys.length,
        allKeys: allKeys.length,
        keys: allKeys
      });

      setStats({
        totalArticles: articles.length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        hasApiKeys: activeKeys.length > 0,
      });
      
      setDebugInfo(logs);
    } catch (error) {
      logs.push(`Error: ${(error as Error).message}`);
      console.error('[Dashboard] Error loading stats:', error);
      setDebugInfo(logs);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    console.log('[Dashboard] Component mounted, loading stats...');
    loadStats();
    
    // Poll for changes every 3 seconds to detect API key additions
    const interval = setInterval(() => {
      console.log('[Dashboard] Polling for updates...');
      loadStats();
    }, 3000);
    
    return () => {
      console.log('[Dashboard] Component unmounting, clearing interval');
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to BlogForge AI</h1>
        <p className="text-gray-300 text-lg">
          Create SEO-optimized blog content that ranks. Powered by your own AI.
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
                Don't worry - we store them locally in your browser, and you only pay for what you use.
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
                💡 Already added a key? Click refresh or wait a few seconds for auto-detection.
              </p>
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

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/generate"
            className="group flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Generate New Article</h3>
              <p className="text-purple-100 text-sm">Create SEO-optimized content</p>
            </div>
            <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/articles"
            className="group flex items-center justify-between p-6 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all border border-slate-600"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">View Articles</h3>
              <p className="text-gray-400 text-sm">Manage your content library</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/settings"
            className="group flex items-center justify-between p-6 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all border border-slate-600"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Configure Settings</h3>
              <p className="text-gray-400 text-sm">API keys, WordPress, brand voice</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-lg border border-purple-500/30">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">📊 Coming Soon</h3>
              <p className="text-gray-400 text-sm">Analytics & performance tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">What Makes BlogForge AI Special?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bring Your Own Key</h3>
            <p className="text-gray-400 text-sm">
              Use your own Gemini (free) or OpenRouter API keys. Pay only for AI usage, not platform markup.
            </p>
          </div>

          <div>
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">SEO Optimized</h3>
            <p className="text-gray-400 text-sm">
              Advanced keyword optimization, meta tags, schema markup, and internal linking.
            </p>
          </div>

          <div>
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Competitor Analysis</h3>
            <p className="text-gray-400 text-sm">
              Analyze top-ranking articles and create better content that outranks them.
            </p>
          </div>

          <div>
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Beautiful HTML</h3>
            <p className="text-gray-400 text-sm">
              Rich formatting with tables, callouts, accordions, and interactive elements.
            </p>
          </div>

          <div>
            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">WordPress Publishing</h3>
            <p className="text-gray-400 text-sm">
              Publish directly to your WordPress site with one click. Supports categories and tags.
            </p>
          </div>

          <div>
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

      {/* Debug Info - Collapsible */}
      {debugInfo.length > 0 && (
        <details className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300">
            🔧 Debug Info (Click to expand)
          </summary>
          <div className="mt-3 space-y-1 text-xs font-mono text-gray-400">
            {debugInfo.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700">
            <Link 
              to="/diagnostics"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              → View Full Diagnostics Page
            </Link>
          </div>
        </details>
      )}
    </div>
  );
}
