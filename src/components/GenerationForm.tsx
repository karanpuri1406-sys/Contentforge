import { useState } from 'react';
import { Save, Zap, Search, Sliders, X } from 'lucide-react';
import { Profile, supabase } from '../lib/supabase';

interface GenerationFormProps {
  profile: Profile | null;
}

export default function GenerationForm({ profile }: GenerationFormProps) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Professional & Authoritative');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [autoMeta, setAutoMeta] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2500);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const toneOptions = [
    'Professional & Authoritative',
    'Casual & Friendly',
    'Technical & Detailed',
    'Persuasive & Sales-Oriented',
    'Educational & Informative',
  ];

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
    }, 3000);
  };

  const handleSaveDraft = async () => {
    if (!topic.trim() || !profile) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('blog_posts').insert({
        user_id: profile.id,
        title: topic,
        content: 'Draft content will be generated here...',
        topic,
        target_audience: targetAudience,
        tone,
        keywords,
        status: 'draft',
        word_count: 0,
      });

      if (error) throw error;
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Initiate New Sequence</h1>
          <p className="text-slate-400">Configure generation parameters for your custom API model.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={!topic.trim() || saving}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-slate-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Core Parameters</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Main Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the primary subject of your article (e.g., The Future of Quantum Computing)"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Tech enthusiasts..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {toneOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-violet-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">SEO Optimization</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Focus Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:bg-blue-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Enter..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div>
                <p className="text-white font-medium">Auto-Generate Meta Description</p>
                <p className="text-slate-400 text-sm">Uses extra tokens to create SEO meta tags.</p>
              </div>
              <button
                onClick={() => setAutoMeta(!autoMeta)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoMeta ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoMeta ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Model Configuration</h2>
            </div>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Advanced Mode
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">
                  Creativity (Temperature)
                </label>
                <span className="text-blue-400 font-mono text-sm">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">
                  Max Length (Tokens)
                </label>
                <span className="text-blue-400 font-mono text-sm">{maxTokens.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Short</span>
                <span>Long Form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
