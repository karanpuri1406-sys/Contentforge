import { useState, useEffect } from 'react';
import { 
  Key, 
  Globe, 
  Mic, 
  Save, 
  Plus, 
  Trash2, 
  Check,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { db, ApiKey, WordPressSite, BrandVoice, InternalLink } from '../lib/db';
import { testWordPressConnection } from '../services/wordpressService';
import { importSitemap } from '../services/scrapingService';
import ManualLinkEntry from '../components/ManualLinkEntry';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'wordpress' | 'brand-voice' | 'internal-links'>('api-keys');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState({ provider: 'gemini' as 'gemini' | 'openrouter', keyValue: '', nickname: '' });

  // WordPress
  const [wordPressSites, setWordPressSites] = useState<WordPressSite[]>([]);
  const [newWordPressSite, setNewWordPressSite] = useState({
    name: '',
    url: '',
    username: '',
    applicationPassword: '',
  });
  const [testingConnection, setTestingConnection] = useState(false);

  // Brand Voice
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [newBrandVoice, setNewBrandVoice] = useState({
    name: '',
    description: '',
    characteristics: [''],
    tone: 'professional',
  });

  // Internal Links
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [importingLinks, setImportingLinks] = useState(false);
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const keys = await db.apiKeys.toArray();
    setApiKeys(keys);

    const sites = await db.wordPressSites.toArray();
    setWordPressSites(sites);

    const voices = await db.brandVoices.toArray();
    setBrandVoices(voices);

    const links = await db.internalLinks.toArray();
    setInternalLinks(links);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // API Keys Functions
  const handleAddApiKey = async () => {
    if (!newApiKey.keyValue.trim()) {
      showError('Please enter an API key');
      return;
    }

    try {
      console.log('[Settings] Adding API key...', { 
        provider: newApiKey.provider, 
        hasNickname: !!newApiKey.nickname,
        timestamp: new Date().toISOString()
      });
      
      const keyId = await db.apiKeys.add({
        provider: newApiKey.provider,
        keyValue: newApiKey.keyValue.trim(),
        nickname: newApiKey.nickname.trim() || undefined,
        isActive: true,
        createdAt: new Date(),
      });
      
      console.log('[Settings] API key added with ID:', keyId);
      
      // Wait a bit to ensure IndexedDB write completes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify it was saved with multiple checks
      const savedKey = await db.apiKeys.get(keyId);
      console.log('[Settings] Verified saved key:', savedKey);
      
      const allKeys = await db.apiKeys.toArray();
      console.log('[Settings] All keys in DB now:', allKeys.length, allKeys);
      
      const activeKeys = await db.apiKeys.where({ isActive: true }).toArray();
      console.log('[Settings] Active keys:', activeKeys.length);
      
      setNewApiKey({ provider: 'gemini', keyValue: '', nickname: '' });
      await loadSettings();
      showSuccess('API key added successfully! Redirecting to dashboard...');
      
      // Use navigate instead of window.location to avoid full page reload
      setTimeout(() => {
        console.log('[Settings] Navigating to dashboard...');
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('[Settings] Failed to add API key:', err);
      showError(`Failed to add API key: ${err.message}`);
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      await db.apiKeys.delete(id);
      loadSettings();
      showSuccess('API key deleted');
    }
  };

  const handleToggleApiKey = async (id: number, isActive: boolean) => {
    await db.apiKeys.update(id, { isActive: !isActive });
    loadSettings();
  };

  // WordPress Functions
  const handleTestWordPressConnection = async () => {
    if (!newWordPressSite.url || !newWordPressSite.username || !newWordPressSite.applicationPassword) {
      showError('Please fill in all WordPress fields');
      return;
    }

    setTestingConnection(true);
    try {
      const success = await testWordPressConnection({
        ...newWordPressSite,
        isActive: true,
      });

      if (success) {
        showSuccess('✓ Connection successful!');
      } else {
        showError('Connection failed. Please check your credentials.');
      }
    } catch (err) {
      showError('Connection failed. Please check your credentials.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddWordPressSite = async () => {
    if (!newWordPressSite.name || !newWordPressSite.url || !newWordPressSite.username || !newWordPressSite.applicationPassword) {
      showError('Please fill in all fields');
      return;
    }

    try {
      await db.wordPressSites.add({
        ...newWordPressSite,
        isActive: true,
        createdAt: new Date(),
      });
      setNewWordPressSite({ name: '', url: '', username: '', applicationPassword: '' });
      loadSettings();
      showSuccess('WordPress site added successfully');
    } catch (err) {
      showError('Failed to add WordPress site');
    }
  };

  const handleDeleteWordPressSite = async (id: number) => {
    if (confirm('Are you sure you want to delete this WordPress site?')) {
      await db.wordPressSites.delete(id);
      loadSettings();
      showSuccess('WordPress site deleted');
    }
  };

  // Brand Voice Functions
  const handleAddBrandVoice = async () => {
    if (!newBrandVoice.name || !newBrandVoice.description) {
      showError('Please fill in name and description');
      return;
    }

    try {
      await db.brandVoices.add({
        ...newBrandVoice,
        characteristics: newBrandVoice.characteristics.filter(c => c.trim()),
        vocabulary: [],
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setNewBrandVoice({ name: '', description: '', characteristics: [''], tone: 'professional' });
      loadSettings();
      showSuccess('Brand voice added successfully');
    } catch (err) {
      showError('Failed to add brand voice');
    }
  };

  const handleDeleteBrandVoice = async (id: number) => {
    if (confirm('Are you sure you want to delete this brand voice?')) {
      await db.brandVoices.delete(id);
      loadSettings();
      showSuccess('Brand voice deleted');
    }
  };

  const updateCharacteristic = (index: number, value: string) => {
    const newCharacteristics = [...newBrandVoice.characteristics];
    newCharacteristics[index] = value;
    setNewBrandVoice({ ...newBrandVoice, characteristics: newCharacteristics });
  };

  const addCharacteristic = () => {
    setNewBrandVoice({
      ...newBrandVoice,
      characteristics: [...newBrandVoice.characteristics, ''],
    });
  };

  // Internal Links Functions
  const handleImportSitemap = async () => {
    if (!sitemapUrl.trim()) {
      showError('Please enter a sitemap URL');
      return;
    }

    setImportingLinks(true);
    try {
      const count = await importSitemap(sitemapUrl);
      loadSettings();
      showSuccess(`Successfully imported ${count} internal links`);
      setSitemapUrl('');
    } catch (err: any) {
      showError(`Failed to import sitemap: ${err.message}`);
    } finally {
      setImportingLinks(false);
    }
  };

  const handleClearInternalLinks = async () => {
    if (confirm('Are you sure you want to clear all internal links?')) {
      await db.internalLinks.clear();
      loadSettings();
      showSuccess('Internal links cleared');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-300">Configure your API keys, WordPress sites, and brand voice</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-400" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="flex border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'api-keys'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Key className="h-5 w-5 inline mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('wordpress')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'wordpress'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Globe className="h-5 w-5 inline mr-2" />
            WordPress
          </button>
          <button
            onClick={() => setActiveTab('brand-voice')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'brand-voice'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Mic className="h-5 w-5 inline mr-2" />
            Brand Voice
          </button>
          <button
            onClick={() => setActiveTab('internal-links')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'internal-links'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <LinkIcon className="h-5 w-5 inline mr-2" />
            Internal Links
          </button>
        </div>

        <div className="p-6">
          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Add New API Key</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                    <select
                      value={newApiKey.provider}
                      onChange={(e) => setNewApiKey({ ...newApiKey, provider: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="gemini">Gemini (Free - Recommended)</option>
                      <option value="openrouter">OpenRouter (Premium)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <input
                      type="password"
                      value={newApiKey.keyValue}
                      onChange={(e) => setNewApiKey({ ...newApiKey, keyValue: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nickname (Optional)</label>
                    <input
                      type="text"
                      value={newApiKey.nickname}
                      onChange={(e) => setNewApiKey({ ...newApiKey, nickname: e.target.value })}
                      placeholder="My API Key"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleAddApiKey}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add API Key</span>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">How to get API keys:</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>
                      <strong>Gemini (Free):</strong> Visit{' '}
                      <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        Google AI Studio
                      </a>
                    </li>
                    <li>
                      <strong>OpenRouter:</strong> Visit{' '}
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        OpenRouter Keys
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Existing API Keys */}
              {apiKeys.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your API Keys</h3>
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">
                              {key.nickname || `${key.provider} API Key`}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              key.provider === 'gemini'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {key.provider}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              key.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Added: {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => key.id && handleToggleApiKey(key.id, key.isActive)}
                            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors text-sm"
                          >
                            {key.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => key.id && handleDeleteApiKey(key.id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WordPress Tab */}
          {activeTab === 'wordpress' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Add WordPress Site</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={newWordPressSite.name}
                      onChange={(e) => setNewWordPressSite({ ...newWordPressSite, name: e.target.value })}
                      placeholder="My Blog"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">WordPress URL</label>
                    <input
                      type="url"
                      value={newWordPressSite.url}
                      onChange={(e) => setNewWordPressSite({ ...newWordPressSite, url: e.target.value })}
                      placeholder="https://yourblog.com"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={newWordPressSite.username}
                      onChange={(e) => setNewWordPressSite({ ...newWordPressSite, username: e.target.value })}
                      placeholder="admin"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Application Password</label>
                    <input
                      type="password"
                      value={newWordPressSite.applicationPassword}
                      onChange={(e) => setNewWordPressSite({ ...newWordPressSite, applicationPassword: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleTestWordPressConnection}
                      disabled={testingConnection}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
                    >
                      {testingConnection ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                      onClick={handleAddWordPressSite}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Site</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">How to generate Application Password:</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Go to WordPress Dashboard → Users → Your Profile</li>
                    <li>Scroll to "Application Passwords" section</li>
                    <li>Enter a name (e.g., "BlogForge AI") and click "Add New"</li>
                    <li>Copy the generated password and paste it above</li>
                  </ol>
                </div>
              </div>

              {/* Existing WordPress Sites */}
              {wordPressSites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your WordPress Sites</h3>
                  <div className="space-y-3">
                    {wordPressSites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">{site.name}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              site.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {site.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{site.url}</div>
                        </div>
                        <button
                          onClick={() => site.id && handleDeleteWordPressSite(site.id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Brand Voice Tab */}
          {activeTab === 'brand-voice' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Create Brand Voice</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newBrandVoice.name}
                      onChange={(e) => setNewBrandVoice({ ...newBrandVoice, name: e.target.value })}
                      placeholder="Tech Startup Voice"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newBrandVoice.description}
                      onChange={(e) => setNewBrandVoice({ ...newBrandVoice, description: e.target.value })}
                      placeholder="Innovative, data-driven, and forward-thinking"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Characteristics</label>
                    {newBrandVoice.characteristics.map((char, idx) => (
                      <div key={idx} className="mb-2">
                        <input
                          type="text"
                          value={char}
                          onChange={(e) => updateCharacteristic(idx, e.target.value)}
                          placeholder="e.g., Uses data-driven insights"
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addCharacteristic}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Characteristic</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                    <select
                      value={newBrandVoice.tone}
                      onChange={(e) => setNewBrandVoice({ ...newBrandVoice, tone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="conversational">Conversational</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddBrandVoice}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Brand Voice</span>
                  </button>
                </div>
              </div>

              {/* Existing Brand Voices */}
              {brandVoices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your Brand Voices</h3>
                  <div className="space-y-3">
                    {brandVoices.map((voice) => (
                      <div
                        key={voice.id}
                        className="p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-white font-medium">{voice.name}</span>
                              {voice.isDefault && (
                                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{voice.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {voice.characteristics.map((char, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-slate-600/50 text-gray-300 rounded text-xs"
                                >
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                          {!voice.isDefault && (
                            <button
                              onClick={() => voice.id && handleDeleteBrandVoice(voice.id)}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Internal Links Tab */}
          {activeTab === 'internal-links' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Import Sitemap</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sitemap URL</label>
                    <input
                      type="url"
                      value={sitemapUrl}
                      onChange={(e) => setSitemapUrl(e.target.value)}
                      placeholder="https://yourblog.com/sitemap.xml"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleImportSitemap}
                      disabled={importingLinks}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{importingLinks ? 'Importing...' : 'Import Sitemap'}</span>
                    </button>
                    
                    {internalLinks.length > 0 && (
                      <button
                        onClick={handleClearInternalLinks}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
                      >
                        Clear All Links
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">How it works:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>Enter your website's sitemap URL (usually /sitemap.xml)</li>
                    <li>We'll extract all page URLs and their metadata</li>
                    <li>When generating articles, relevant internal links will be automatically suggested</li>
                    <li>This improves your site's SEO through better internal linking structure</li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-yellow-400 font-medium mb-2">⚠️ CORS Issues?</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    If sitemap import fails due to browser security restrictions, you can add links manually below.
                  </p>
                </div>
              </div>

              {/* Manual Link Entry */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Add Links Manually</h3>
                <ManualLinkEntry
                  onLinkAdded={loadSettings}
                  onSuccess={showSuccess}
                  onError={showError}
                />
              </div>

              {/* Internal Links List */}
              {internalLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Imported Links ({internalLinks.length})
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {internalLinks.slice(0, 50).map((link) => (
                      <div
                        key={link.id}
                        className="p-3 bg-slate-700/30 rounded-lg text-sm"
                      >
                        <div className="text-white font-medium">{link.title}</div>
                        <div className="text-gray-400 text-xs mt-1">{link.url}</div>
                        {link.excerpt && (
                          <div className="text-gray-500 text-xs mt-1">{link.excerpt.substring(0, 100)}...</div>
                        )}
                      </div>
                    ))}
                    {internalLinks.length > 50 && (
                      <div className="text-center text-gray-400 text-sm py-4">
                        ... and {internalLinks.length - 50} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
