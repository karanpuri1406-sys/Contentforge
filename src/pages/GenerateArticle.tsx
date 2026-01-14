import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Globe, 
  Target, 
  Wand2,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { db, BrandVoice, InternalLink } from '../lib/db';
import { generateArticle, GenerationOptions } from '../services/aiService';
import { analyzeCompetitors, generateCompetitorSummary, searchInternalLinks } from '../services/scrapingService';

export default function GenerateArticle() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [topic, setTopic] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [webSearchTerm, setWebSearchTerm] = useState('');
  const [articleType, setArticleType] = useState<'informational' | 'product-review' | 'product-roundup' | 'guide' | 'listicle'>('informational');
  const [tone, setTone] = useState<'conversational' | 'professional' | 'authoritative' | 'friendly' | 'technical'>('conversational');
  const [language, setLanguage] = useState('English');
  const [intendedAudience, setIntendedAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [wordCount, setWordCount] = useState(2000);
  
  // Features
  const [enableLiveWebResearch, setEnableLiveWebResearch] = useState(false);
  const [enableCompetitorAnalysis, setEnableCompetitorAnalysis] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '', '', '']);
  
  // Brand voice
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState<number | null>(null);
  
  // Article elements
  const [enableFirstPerson, setEnableFirstPerson] = useState(false);
  const [enableStories, setEnableStories] = useState(true);
  const [enableHook, setEnableHook] = useState(true);
  const [enableHtmlElements, setEnableHtmlElements] = useState(true);
  const [enableCitations, setEnableCitations] = useState(true);
  const [enableInternalLinks, setEnableInternalLinks] = useState(false);
  const [htmlElementInstructions, setHtmlElementInstructions] = useState('');
  
  // Custom outline
  const [customOutline, setCustomOutline] = useState('');
  
  // Image settings
  const [numberOfImages, setNumberOfImages] = useState(3);
  const [generateCoverImage, setGenerateCoverImage] = useState(true);

  useEffect(() => {
    async function loadBrandVoices() {
      const voices = await db.brandVoices.toArray();
      setBrandVoices(voices);
      
      const defaultVoice = voices.find(v => v.isDefault);
      if (defaultVoice?.id) {
        setSelectedBrandVoice(defaultVoice.id);
      }
    }
    loadBrandVoices();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setError('');
    setIsGenerating(true);
    
    try {
      // Step 1: Analyze competitors if enabled
      let competitorAnalysisData = '';
      if (enableCompetitorAnalysis) {
        setGenerationStep('Analyzing competitor articles...');
        const urls = competitorUrls.filter(url => url.trim());
        if (urls.length > 0) {
          const analyses = await analyzeCompetitors(urls);
          const analysisResults = analyses.map(a => ({
            url: a.url,
            title: a.title || '',
            wordCount: a.wordCount || 0,
            keywords: a.keywords || [],
            headings: a.headings || [],
            content: a.content || '',
            metaDescription: '',
            images: 0,
            links: 0,
          }));
          competitorAnalysisData = generateCompetitorSummary(analysisResults);
        }
      }

      // Step 2: Get internal links if enabled
      let internalLinksData: Array<{ url: string; title: string; excerpt?: string }> = [];
      if (enableInternalLinks && targetKeyword) {
        setGenerationStep('Finding relevant internal links...');
        const links = await searchInternalLinks(targetKeyword, 10);
        internalLinksData = links.map(link => ({
          url: link.url,
          title: link.title,
          excerpt: link.excerpt,
        }));
      }

      // Step 3: Get brand voice
      let brandVoiceText = '';
      if (selectedBrandVoice) {
        const voice = await db.brandVoices.get(selectedBrandVoice);
        if (voice) {
          brandVoiceText = `${voice.description}\n\nCharacteristics:\n${voice.characteristics.join('\n')}`;
        }
      }

      // Step 4: Generate article
      setGenerationStep('Generating article with AI...');
      
      const options: GenerationOptions = {
        topic,
        targetKeyword,
        webSearchTerm,
        articleType,
        tone,
        language,
        intendedAudience,
        additionalContext,
        wordCount,
        brandVoice: brandVoiceText,
        competitorUrls: competitorUrls.filter(url => url.trim()),
        enableFirstPerson,
        enableStories,
        enableHook,
        enableHtmlElements,
        enableCitations,
        enableInternalLinks,
        customOutline,
        internalLinksData,
        competitorAnalysis: competitorAnalysisData,
      };

      const result = await generateArticle(options);

      // Step 5: Save article
      setGenerationStep('Saving article...');
      
      const articleId = await db.articles.add({
        title: result.metadata.metaTitle,
        content: result.content,
        htmlContent: result.htmlContent,
        topic,
        targetKeyword,
        webSearchTerm,
        articleType,
        tone,
        language,
        intendedAudience,
        additionalContext,
        wordCount: result.metadata.wordCount,
        metaTitle: result.metadata.metaTitle,
        metaDescription: result.metadata.metaDescription,
        slug: result.metadata.slug,
        seoKeywords: result.metadata.seoKeywords,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        brandVoiceId: selectedBrandVoice || undefined,
        competitorUrls: competitorUrls.filter(url => url.trim()),
        enableFirstPerson,
        enableStories,
        enableHook,
        enableHtmlElements,
        enableCitations,
        enableInternalLinks,
        customOutline,
      });

      setGenerationStep('Complete!');
      
      // Navigate to article view
      setTimeout(() => {
        navigate(`/articles/${articleId}`);
      }, 500);
      
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate article. Please check your API keys and try again.');
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Generate SEO Content</h1>
        <p className="text-gray-300 text-lg">
          Create high-quality, SEO-optimized articles that rank on Google
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error</h3>
            <p className="text-gray-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-6">
        {/* Topic & Keywords */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-400" />
            Topic & Keywords
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Best Coffee Brewing Methods"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Keyword
                </label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g., coffee brewing"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Web Search Term
                </label>
                <input
                  type="text"
                  value={webSearchTerm}
                  onChange={(e) => setWebSearchTerm(e.target.value)}
                  placeholder="e.g., latest coffee brewing methods 2026"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-purple-500/10 rounded-lg">
              <input
                type="checkbox"
                id="liveWebResearch"
                checked={enableLiveWebResearch}
                onChange={(e) => setEnableLiveWebResearch(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label htmlFor="liveWebResearch" className="flex-1">
                <div className="flex items-center text-white font-medium">
                  <Globe className="h-4 w-4 mr-2 text-purple-400" />
                  Enable Live Web Research
                  <span className="ml-2 px-2 py-0.5 bg-purple-600 text-xs rounded">2-STEP</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Research the web for latest information
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Content Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Article Type
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="informational">Informational</option>
                <option value="product-review">Product Review</option>
                <option value="product-roundup">Product Roundup</option>
                <option value="guide">How-To Guide</option>
                <option value="listicle">Listicle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="authoritative">Authoritative</option>
                <option value="friendly">Friendly</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intended Audience
              </label>
              <input
                type="text"
                value={intendedAudience}
                onChange={(e) => setIntendedAudience(e.target.value)}
                placeholder="e.g., Coffee enthusiasts, beginners"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Include any specific information or context..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Word Count: {wordCount}
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500</span>
              <span>5000</span>
            </div>
          </div>
        </div>

        {/* Brand Voice */}
        {brandVoices.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Brand Voice & Knowledge</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Brand Voice
              </label>
              <select
                value={selectedBrandVoice || ''}
                onChange={(e) => setSelectedBrandVoice(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No brand voice</option>
                {brandVoices.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Competitor Analysis */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Competitor Analysis</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">Enable</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCompetitorAnalysis}
                  onChange={(e) => setEnableCompetitorAnalysis(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {enableCompetitorAnalysis && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Analyze top-ranking articles to create better content
              </p>
              
              {competitorUrls.map((url, index) => (
                <input
                  key={index}
                  type="url"
                  value={url}
                  onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                  placeholder={`https://competitor-${index + 1}.com/blog-post-example`}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              ))}

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  ℹ️ Analysis extracts keywords, semantic entities, internal structure, and identifies content gaps to give you a strategic edge.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Article Elements */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Article Elements</h2>
          <p className="text-sm text-gray-400 mb-6">
            Fine-tune the building blocks of your content
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">First Person</div>
                <div className="text-sm text-gray-400">Use "I" or "We" perspective</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableFirstPerson}
                  onChange={(e) => setEnableFirstPerson(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">Stories & Examples</div>
                <div className="text-sm text-gray-400">Include anecdotes and real-world case studies</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableStories}
                  onChange={(e) => setEnableStories(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">Hook</div>
                <div className="text-sm text-gray-400">Generate a high-engagement introduction</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableHook}
                  onChange={(e) => setEnableHook(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">HTML Element</div>
                <div className="text-sm text-gray-400">Add interactive widgets (Calculators, ROI tools, etc.)</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableHtmlElements}
                  onChange={(e) => setEnableHtmlElements(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">Citations</div>
                <div className="text-sm text-gray-400">Include formal references and data sources</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableCitations}
                  onChange={(e) => setEnableCitations(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div>
                <div className="font-medium text-white">Internal Links</div>
                <div className="text-sm text-gray-400">Link to your existing content for SEO hierarchy</div>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableInternalLinks}
                  onChange={(e) => setEnableInternalLinks(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>
          </div>

          {enableHtmlElements && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                HTML Element Instructions (Optional)
              </label>
              <textarea
                value={htmlElementInstructions}
                onChange={(e) => setHtmlElementInstructions(e.target.value)}
                placeholder="Do not add tick marks, arrows and emojis as it clashes with my theme. Also please put the widget at the bottom of the blog."
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Image Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Image Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Content Images: {numberOfImages}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={numberOfImages}
              onChange={(e) => setNumberOfImages(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>5</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generateCoverImage}
                onChange={(e) => setGenerateCoverImage(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <div>
                <div className="text-white font-medium">Generate Cover Image</div>
                <div className="text-sm text-gray-400">Create a cinematic cover image optimized for social sharing</div>
              </div>
            </label>
          </div>

          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-200">
              <strong>Note:</strong> Image generation requires additional API credits. Images will be generated using your configured AI provider.
            </p>
          </div>
        </div>

        {/* Custom Outline */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Custom Outline (Optional)</h2>
          
          <textarea
            value={customOutline}
            onChange={(e) => setCustomOutline(e.target.value)}
            placeholder="Leave blank for default structure, or provide your custom outline here..."
            rows={6}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            disabled={isGenerating}
          >
            Cancel
          </button>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{generationStep || 'Generating...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>Generate SEO Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Background Generation Info */}
      {isGenerating && (
        <div className="fixed bottom-8 right-8 bg-slate-800 border border-purple-500/30 rounded-lg shadow-2xl p-6 max-w-md">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-purple-400" />
            Generating Content
          </h3>
          <p className="text-gray-300 text-sm mb-3">{generationStep}</p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300 animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Your content will be generated in our cloud infrastructure. You can leave this page; we'll notify you when it's ready in your "My Articles" library.
          </p>
        </div>
      )}
    </div>
  );
}
