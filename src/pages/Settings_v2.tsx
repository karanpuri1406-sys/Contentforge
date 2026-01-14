import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Key, 
  Save, 
  Trash2, 
  Check,
  AlertCircle,
  Sparkles,
  Globe,
  X,
} from 'lucide-react';
import { saveApiKey, getApiKey, deleteApiKey, getSetting } from '../lib/simpleStorage';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'api-keys' | 'wordpress' | 'internal-links'>('api-keys');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // API Keys state
  const [geminiKey, setGeminiKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [hasOpenrouterKey, setHasOpenrouterKey] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    console.log('[Settings] Loading API keys...');
    
    // Load Gemini key
    const geminiData = await getSetting('gemini_api_key');
    if (geminiData?.keyValue) {
      setGeminiKey(geminiData.keyValue);
      setHasGeminiKey(true);
      console.log('[Settings] Loaded Gemini key');
    }
    
    // Load OpenRouter key
    const openrouterData = await getSetting('openrouter_api_key');
    if (openrouterData?.keyValue) {
      setOpenrouterKey(openrouterData.keyValue);
      setHasOpenrouterKey(true);
      console.log('[Settings] Loaded OpenRouter key');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) {
      showError('Please enter a Gemini API key');
      return;
    }

    try {
      console.log('[Settings] Saving Gemini key...');
      await saveApiKey('gemini', geminiKey.trim());
      setHasGeminiKey(true);
      showSuccess('Gemini API key saved successfully! Redirecting...');
      
      // Wait a bit then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('[Settings] Error saving Gemini key:', err);
      showError(`Failed to save Gemini key: ${err.message}`);
    }
  };

  const handleRemoveGeminiKey = async () => {
    if (confirm('Are you sure you want to remove your Gemini API key?')) {
      try {
        console.log('[Settings] Removing Gemini key...');
        await deleteApiKey('gemini');
        setGeminiKey('');
        setHasGeminiKey(false);
        showSuccess('Gemini API key removed');
      } catch (err: any) {
        console.error('[Settings] Error removing Gemini key:', err);
        showError(`Failed to remove Gemini key: ${err.message}`);
      }
    }
  };

  const handleSaveOpenRouterKey = async () => {
    if (!openrouterKey.trim()) {
      showError('Please enter an OpenRouter API key');
      return;
    }

    try {
      console.log('[Settings] Saving OpenRouter key...');
      await saveApiKey('openrouter', openrouterKey.trim());
      setHasOpenrouterKey(true);
      showSuccess('OpenRouter API key saved successfully!');
    } catch (err: any) {
      console.error('[Settings] Error saving OpenRouter key:', err);
      showError(`Failed to save OpenRouter key: ${err.message}`);
    }
  };

  const handleRemoveOpenRouterKey = async () => {
    if (confirm('Are you sure you want to remove your OpenRouter API key?')) {
      try {
        console.log('[Settings] Removing OpenRouter key...');
        await deleteApiKey('openrouter');
        setOpenrouterKey('');
        setHasOpenrouterKey(false);
        showSuccess('OpenRouter API key removed');
      } catch (err: any) {
        console.error('[Settings] Error removing OpenRouter key:', err);
        showError(`Failed to remove OpenRouter key: ${err.message}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your API keys, WordPress sites, and brand voice</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-green-400">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-1 mb-8 flex space-x-1">
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'api-keys'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab('wordpress')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'wordpress'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          WordPress
        </button>
        <button
          onClick={() => setActiveTab('internal-links')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'internal-links'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Internal Links
        </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-8">
          {/* Gemini API Key */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Google Gemini API</h3>
                <p className="text-sm text-gray-400">Free tier available - Primary engine for content generation</p>
              </div>
            </div>

            {hasGeminiKey ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Gemini Key Connected</p>
                    <p className="text-xs text-gray-400">Key: {geminiKey.substring(0, 20)}...</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveGeminiKey}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="AIza..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={handleSaveGeminiKey}
                  className="w-full bg-purple-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Gemini Key</span>
                </button>
                <p className="text-xs text-gray-500">
                  Get your free API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            )}
          </section>

          {/* OpenRouter API Key */}
          <section className="space-y-4 pt-8 border-t border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white">OpenRouter API</h3>
                <p className="text-sm text-gray-400">Access to Claude and other premium models</p>
              </div>
            </div>

            {hasOpenrouterKey ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">OpenRouter Key Connected</p>
                    <p className="text-xs text-gray-400">Key: {openrouterKey.substring(0, 20)}...</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveOpenRouterKey}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSaveOpenRouterKey}
                  className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save OpenRouter Key</span>
                </button>
                <p className="text-xs text-gray-500">
                  Get your API key from{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    OpenRouter
                  </a>
                </p>
              </div>
            )}
          </section>

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-8">
            <p className="text-sm text-gray-300 mb-2">
              <strong className="text-purple-400">Bring Your Own Keys (BYOK)</strong>
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your API keys are stored locally in your browser using IndexedDB. They never leave your device.
              You only pay for what you use directly to Google or OpenRouter - no middleman fees.
            </p>
          </div>
        </div>
      )}

      {/* WordPress Tab Placeholder */}
      {activeTab === 'wordpress' && (
        <div className="text-center py-20 text-gray-500">
          WordPress configuration coming soon...
        </div>
      )}

      {/* Internal Links Tab Placeholder */}
      {activeTab === 'internal-links' && (
        <div className="text-center py-20 text-gray-500">
          Internal links configuration coming soon...
        </div>
      )}
    </div>
  );
}
