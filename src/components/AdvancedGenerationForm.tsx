import { useState } from 'react';
import { Zap, Settings, FileText, Image as ImageIcon, Link, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import type { ArticleGenerationSettings, ArticleType, OutputFormat, ToneType } from '../types/article';

interface AdvancedGenerationFormProps {
  onGenerate: (settings: ArticleGenerationSettings) => Promise<void>;
  isGenerating: boolean;
}

export default function AdvancedGenerationForm({ onGenerate, isGenerating }: AdvancedGenerationFormProps) {
  // Basic Settings
  const [topic, setTopic] = useState('');
  const [webSearchTerm, setWebSearchTerm] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('information');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('multimedia');
  const [tone, setTone] = useState<ToneType>('authoritative');
  const [language, setLanguage] = useState('english');
  const [intendedAudience, setIntendedAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [wordCount, setWordCount] = useState(3000);
  const [customOutline, setCustomOutline] = useState('');

  // Features
  const [enableWebResearch, setEnableWebResearch] = useState(true);
  const [enableCompetitorAnalysis, setEnableCompetitorAnalysis] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);

  // Article Elements
  const [enableFirstPerson, setEnableFirstPerson] = useState(false);
  const [enableStories, setEnableStories] = useState(true);
  const [enableHook, setEnableHook] = useState(true);
  const [enableHtmlElements, setEnableHtmlElements] = useState(true);
  const [htmlElementInstructions, setHtmlElementInstructions] = useState('');
  const [enableCitations, setEnableCitations] = useState(true);
  const [enableInternalLinks, setEnableInternalLinks] = useState(true);
  const [enableExternalLinks, setEnableExternalLinks] = useState(true);

  // Images
  const [generateImages, setGenerateImages] = useState(true);
  const [numContentImages, setNumContentImages] = useState(2);
  const [generateCoverImage, setGenerateCoverImage] = useState(true);

  // UI State
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    features: false,
    elements: false,
    images: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addCompetitorUrl = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const removeCompetitorUrl = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const settings: ArticleGenerationSettings = {
      topic,
      webSearchTerm: webSearchTerm || topic,
      targetKeyword: targetKeyword || topic,
      articleType,
      outputFormat,
      tone,
      language,
      intendedAudience,
      additionalContext,
      wordCount,
      customOutline,
      enableWebResearch,
      enableCompetitorAnalysis,
      competitorUrls: competitorUrls.filter(url => url.trim() !== ''),
      enableFirstPerson,
      enableStories,
      enableHook,
      enableHtmlElements,
      htmlElementInstructions,
      enableCitations,
      enableInternalLinks,
      enableExternalLinks,
      generateImages,
      numContentImages,
      generateCoverImage
    };

    await onGenerate(settings);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generate SEO Article</h1>
        <p className="text-slate-400">Create world-class, AI-optimized content with stunning HTML multimedia elements</p>
      </div>

      {/* Generate Button - Fixed at top */}
      <div className="mb-6">
        <button
          onClick={handleSubmit}
          disabled={!topic.trim() || isGenerating}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
        >
          <Zap className="w-5 h-5" />
          <span>{isGenerating ? 'Generating Article...' : 'Generate Article'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Content Settings</h2>
            </div>
            {expandedSections.basic ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections.basic && (
            <div className="p-6 pt-0 space-y-5">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Topic <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Best Coffee Brewing Methods"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Web Search Term */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Web Search Term
                  </label>
                  <input
                    type="text"
                    value={webSearchTerm}
                    onChange={(e) => setWebSearchTerm(e.target.value)}
                    placeholder="e.g., latest coffee brewing methods 2026"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Target Keyword */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="e.g., coffee brewing"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {/* Article Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Article Type
                  </label>
                  <select
                    value={articleType}
                    onChange={(e) => setArticleType(e.target.value as ArticleType)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="information">Information Guide</option>
                    <option value="product_review">Product Review</option>
                    <option value="product_roundup">Product Roundup</option>
                  </select>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="multimedia">Multimedia HTML</option>
                    <option value="markdown">Markdown</option>
                    <option value="text">Plain Text</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ToneType)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="authoritative">Authoritative</option>
                    <option value="conversational">Conversational</option>
                    <option value="technical">Technical</option>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>

                {/* Intended Audience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Intended Audience
                  </label>
                  <input
                    type="text"
                    value={intendedAudience}
                    onChange={(e) => setIntendedAudience(e.target.value)}
                    placeholder="e.g., CLAT Aspirants, Coffee Enthusiasts"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Word Count: {wordCount}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>500</span>
                  <span>5000</span>
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Include any specific information or context..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Custom Outline */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Outline (Optional)
                </label>
                <textarea
                  value={customOutline}
                  onChange={(e) => setCustomOutline(e.target.value)}
                  placeholder="Provide a custom outline structure..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Advanced Features</h2>
            </div>
            {expandedSections.features ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections.features && (
            <div className="p-6 pt-0 space-y-4">
              {/* Enable Web Research */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Live Web Research</p>
                  <p className="text-slate-400 text-sm">Research the web for latest information</p>
                </div>
                <button
                  onClick={() => setEnableWebResearch(!enableWebResearch)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableWebResearch ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableWebResearch ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Competitor Analysis */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Competitor Analysis</p>
                    <p className="text-slate-400 text-sm">Analyze top-ranking articles</p>
                  </div>
                  <button
                    onClick={() => setEnableCompetitorAnalysis(!enableCompetitorAnalysis)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enableCompetitorAnalysis ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableCompetitorAnalysis ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {enableCompetitorAnalysis && (
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm text-slate-300 mb-2">Competitor URLs (up to 5)</label>
                    {competitorUrls.map((url, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                          placeholder="https://example.com/article"
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                        />
                        {competitorUrls.length > 1 && (
                          <button
                            onClick={() => removeCompetitorUrl(index)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {competitorUrls.length < 5 && (
                      <button
                        onClick={addCompetitorUrl}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        + Add URL
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Article Elements */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('elements')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Article Elements</h2>
            </div>
            {expandedSections.elements ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections.elements && (
            <div className="p-6 pt-0 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <ToggleOption label="First Person" enabled={enableFirstPerson} onChange={setEnableFirstPerson} description="Use 'I' and 'we'" />
                <ToggleOption label="Stories & Examples" enabled={enableStories} onChange={setEnableStories} description="Include anecdotes" />
                <ToggleOption label="Hook" enabled={enableHook} onChange={setEnableHook} description="Engaging introduction" />
                <ToggleOption label="Citations" enabled={enableCitations} onChange={setEnableCitations} description="Include references" />
                <ToggleOption label="Internal Links" enabled={enableInternalLinks} onChange={setEnableInternalLinks} description="Link to your content" />
                <ToggleOption label="External Links" enabled={enableExternalLinks} onChange={setEnableExternalLinks} description="Authoritative sources" />
              </div>

              {outputFormat === 'multimedia' && (
                <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">HTML Interactive Elements</p>
                      <p className="text-slate-400 text-sm">Tables, accordions, widgets</p>
                    </div>
                    <button
                      onClick={() => setEnableHtmlElements(!enableHtmlElements)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableHtmlElements ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enableHtmlElements ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {enableHtmlElements && (
                    <textarea
                      value={htmlElementInstructions}
                      onChange={(e) => setHtmlElementInstructions(e.target.value)}
                      placeholder="Describe what HTML elements you want (e.g., 'Create a comparison table with 5 products')"
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('images')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ImageIcon className="w-5 h-5 text-pink-400" />
              <h2 className="text-xl font-semibold text-white">Image Settings</h2>
            </div>
            {expandedSections.images ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections.images && (
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Generate Images</p>
                  <p className="text-slate-400 text-sm">Automatically generate images with Gemini</p>
                </div>
                <button
                  onClick={() => setGenerateImages(!generateImages)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    generateImages ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    generateImages ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {generateImages && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Content Images: {numContentImages}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={numContentImages}
                      onChange={(e) => setNumContentImages(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Generate Cover Image</p>
                      <p className="text-slate-400 text-sm">Hero image for the article</p>
                    </div>
                    <button
                      onClick={() => setGenerateCoverImage(!generateCoverImage)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        generateCoverImage ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        generateCoverImage ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, enabled, onChange, description }: { label: string; enabled: boolean; onChange: (value: boolean) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
