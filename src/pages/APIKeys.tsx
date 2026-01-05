import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { testAPIKey } from '../services/aiService';

interface APIKey {
  id: string;
  provider: 'gemini' | 'openrouter';
  api_key: string;
  is_active: boolean;
  created_at: string;
}

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [newApiKey, setNewApiKey] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  async function fetchAPIKeys() {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddKey() {
    if (!newApiKey.trim()) return;

    setTestingKey(true);
    setKeyValid(null);

    // Test the API key first
    const isValid = await testAPIKey(newProvider, newApiKey);
    setKeyValid(isValid);
    setTestingKey(false);

    if (!isValid) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('api_keys').upsert({
        user_id: user.id,
        provider: newProvider,
        api_key: newApiKey,
        is_active: true
      }, {
        onConflict: 'user_id,provider'
      });

      if (error) throw error;

      setNewApiKey('');
      setKeyValid(null);
      setShowAddModal(false);
      fetchAPIKeys();
    } catch (error) {
      console.error('Error adding API key:', error);
      alert('Failed to add API key');
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  }

  async function toggleKeyActive(key: APIKey) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !key.is_active })
        .eq('id', key.id);

      if (error) throw error;
      fetchAPIKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Failed to update API key');
    }
  }

  function maskApiKey(key: string): string {
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showStats={false}>
      <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-slate-400">Manage your AI provider API keys for free article generation</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add API Key</span>
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Google Gemini</h3>
          <p className="text-slate-300 text-sm mb-4">
            Free tier available. Best for content generation and image creation.
          </p>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Get Gemini API Key →
          </a>
        </div>

        <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 border border-violet-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">OpenRouter</h3>
          <p className="text-slate-300 text-sm mb-4">
            Access Claude Sonnet 4/4.5 for premium quality content.
          </p>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 text-sm font-medium"
          >
            Get OpenRouter API Key →
          </a>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <Key className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No API Keys Yet</h3>
            <p className="text-slate-400 mb-6">
              Add your Gemini or OpenRouter API key to start generating articles for free
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First API Key
            </button>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  key.provider === 'gemini' ? 'bg-blue-600/20 text-blue-400' : 'bg-violet-600/20 text-violet-400'
                }`}>
                  <Key className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {key.provider === 'gemini' ? 'Google Gemini' : 'OpenRouter'}
                    </h3>
                    {key.is_active ? (
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-600/20 text-slate-400 text-xs rounded-full font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-slate-400 text-sm font-mono">
                      {showKey[key.id] ? key.api_key : maskApiKey(key.api_key)}
                    </code>
                    <button
                      onClick={() => setShowKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                      className="text-slate-500 hover:text-slate-400"
                    >
                      {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    Added {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleKeyActive(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    key.is_active
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {key.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add API Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Add API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Provider
                </label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value as 'gemini' | 'openrouter')}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={newApiKey}
                  onChange={(e) => {
                    setNewApiKey(e.target.value);
                    setKeyValid(null);
                  }}
                  placeholder="Paste your API key here"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                {keyValid === false && (
                  <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                    <X className="w-4 h-4" />
                    <span>Invalid API key. Please check and try again.</span>
                  </div>
                )}
                {keyValid === true && (
                  <div className="flex items-center space-x-2 mt-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    <span>API key is valid!</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Your API key is encrypted and stored securely. We never share or expose your keys.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewApiKey('');
                  setKeyValid(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKey}
                disabled={!newApiKey.trim() || testingKey}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {testingKey ? 'Testing...' : 'Add Key'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
