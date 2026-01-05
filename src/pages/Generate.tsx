import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AdvancedGenerationForm from '../components/AdvancedGenerationForm';
import { ArticleGenerator } from '../services/articleGenerator';
import type { ArticleGenerationSettings } from '../types/article';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function Generate() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleGenerate(settings: ArticleGenerationSettings) {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setCurrentStep('Initializing...');

    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's API keys
      const { data: apiKeys, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (keysError || !apiKeys) {
        throw new Error('No active API key found. Please add an API key in Settings.');
      }

      // Check if user can generate article
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const canGenerate = await supabase.rpc('can_generate_article', { p_user_id: user.id });
      
      if (!canGenerate.data) {
        const limit = profile.plan_limits?.articles_per_month || 10;
        throw new Error(`Monthly article limit reached (${limit} articles). Please upgrade your plan.`);
      }

      // Initialize article generator
      const generator = new ArticleGenerator(
        {
          provider: apiKeys.provider as 'gemini' | 'openrouter',
          apiKey: apiKeys.api_key,
          model: apiKeys.provider === 'gemini' ? 'gemini-2.0-flash-exp' : 'anthropic/claude-3.5-sonnet'
        },
        settings
      );

      // Generate article
      const result = await generator.generate((step, prog) => {
        setCurrentStep(step);
        setProgress(prog);
      });

      // Save to database
      setCurrentStep('Saving article...');
      setProgress(95);

      const { data: savedArticle, error: saveError } = await supabase
        .from('blog_posts')
        .insert({
          user_id: user.id,
          title: result.article.title,
          content: result.article.content,
          topic: settings.topic,
          target_audience: settings.intendedAudience,
          tone: settings.tone,
          keywords: settings.targetKeyword ? [settings.targetKeyword] : [],
          status: 'draft',
          word_count: result.article.wordCount,
          article_type: settings.articleType,
          output_format: settings.outputFormat,
          web_search_term: settings.webSearchTerm,
          target_keyword: settings.targetKeyword,
          language: settings.language,
          intended_audience: settings.intendedAudience,
          additional_context: settings.additionalContext,
          custom_outline: settings.customOutline,
          generation_settings: {
            enable_web_research: settings.enableWebResearch,
            enable_competitor_analysis: settings.enableCompetitorAnalysis,
            competitor_urls: settings.competitorUrls,
            enable_first_person: settings.enableFirstPerson,
            enable_stories: settings.enableStories,
            enable_hook: settings.enableHook,
            enable_html_elements: settings.enableHtmlElements,
            html_element_instructions: settings.htmlElementInstructions,
            enable_citations: settings.enableCitations,
            enable_internal_links: settings.enableInternalLinks,
            enable_external_links: settings.enableExternalLinks,
            generate_images: settings.generateImages,
            num_content_images: settings.numContentImages,
            generate_cover_image: settings.generateCoverImage
          },
          meta_title: result.article.metaTitle,
          meta_description: result.article.metaDescription,
          slug: result.article.slug,
          schema_markup: result.article.schemaMarkup,
          external_links: result.article.externalLinks,
          internal_links_used: result.article.internalLinksUsed
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Save generated images
      if (result.images.length > 0) {
        const imageInserts = result.images.map(img => ({
          user_id: user.id,
          blog_post_id: savedArticle.id,
          prompt: img.prompt,
          image_url: img.url,
          alt_text: img.altText,
          image_type: img.type,
          provider: 'gemini'
        }));

        await supabase.from('generated_images').insert(imageInserts);

        // Increment image counter
        await supabase.rpc('increment_image_counter', {
          p_user_id: user.id,
          p_count: result.images.length
        });
      }

      // Increment article counter
      await supabase.rpc('increment_article_counter', { p_user_id: user.id });

      setProgress(100);
      setCurrentStep('Complete!');
      setSuccess(true);

      // Navigate to the article after a short delay
      setTimeout(() => {
        navigate(`/article/${savedArticle.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate article');
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <DashboardLayout showStats={false}>
      {/* Progress Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-6">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Generating Your Article
            </h3>
            <p className="text-slate-400 text-center mb-6">{currentStep}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-violet-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-center text-sm">{progress}% complete</p>

            <div className="mt-6 bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm text-center">
                This may take 1-3 minutes. Please don't close this window.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 border border-green-500 rounded-lg p-4 flex items-center space-x-3 shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
            <div>
              <p className="text-white font-semibold">Article Generated!</p>
              <p className="text-green-100 text-sm">Redirecting to your article...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-600/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-semibold mb-1">Generation Failed</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      <AdvancedGenerationForm onGenerate={handleGenerate} isGenerating={isGenerating} />
    </DashboardLayout>
  );
}
