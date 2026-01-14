import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  ExternalLink, 
  Check,
  Eye,
  Code,
} from 'lucide-react';
import { db, Article } from '../lib/db';
import { publishToWordPress } from '../services/wordpressService';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');

  useEffect(() => {
    if (id) {
      loadArticle(Number(id));
    }
  }, [id]);

  const loadArticle = async (articleId: number) => {
    const data = await db.articles.get(articleId);
    if (data) {
      setArticle(data);
    }
  };

  const handleCopyHtml = () => {
    if (article) {
      navigator.clipboard.writeText(article.htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadHtml = () => {
    if (article) {
      const blob = new Blob([article.htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.slug || 'article'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePublishToWordPress = async () => {
    if (!article || !article.id) return;

    const wordPressSites = await db.wordPressSites.where({ isActive: true }).toArray();
    
    if (wordPressSites.length === 0) {
      alert('No active WordPress site configured. Please add one in Settings.');
      return;
    }

    const site = wordPressSites[0];
    setIsPublishing(true);
    setPublishSuccess('');

    try {
      const response = await publishToWordPress(site.id!, article);
      setPublishSuccess(`Successfully published! View at: ${response.link}`);
      
      // Update article status
      await db.articles.update(article.id, {
        status: 'published',
        publishedAt: new Date(),
      });
      
      loadArticle(article.id);
    } catch (error: any) {
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/articles')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Articles</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'preview' ? 'html' : 'preview')}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2"
          >
            {viewMode === 'preview' ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{viewMode === 'preview' ? 'View HTML' : 'Preview'}</span>
          </button>

          <button
            onClick={handleCopyHtml}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center space-x-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          <button
            onClick={handlePublishToWordPress}
            disabled={isPublishing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish to WordPress'}</span>
          </button>
        </div>
      </div>

      {publishSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400">{publishSuccess}</p>
        </div>
      )}

      {/* Article Metadata */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded ${
              article.status === 'published'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {article.status}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Word Count:</span>
            <span className="ml-2 text-white">{article.wordCount}</span>
          </div>
          <div>
            <span className="text-gray-400">Type:</span>
            <span className="ml-2 text-white">{article.articleType}</span>
          </div>
          <div>
            <span className="text-gray-400">Tone:</span>
            <span className="ml-2 text-white">{article.tone}</span>
          </div>
        </div>

        {article.metaDescription && (
          <div className="mt-4">
            <span className="text-gray-400 text-sm">Meta Description:</span>
            <p className="text-white mt-1">{article.metaDescription}</p>
          </div>
        )}

        {article.seoKeywords && article.seoKeywords.length > 0 && (
          <div className="mt-4">
            <span className="text-gray-400 text-sm">SEO Keywords:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {article.seoKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-2xl">
        {viewMode === 'preview' ? (
          <div
            className="prose prose-lg max-w-none p-8"
            dangerouslySetInnerHTML={{ __html: article.htmlContent }}
            style={{
              color: '#1f2937',
              lineHeight: '1.75',
            }}
          />
        ) : (
          <div className="p-8">
            <pre className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{article.htmlContent}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Article Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Article Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Created:</span>
            <span className="ml-2 text-white">
              {new Date(article.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Last Updated:</span>
            <span className="ml-2 text-white">
              {new Date(article.updatedAt).toLocaleString()}
            </span>
          </div>
          {article.publishedAt && (
            <div>
              <span className="text-gray-400">Published:</span>
              <span className="ml-2 text-white">
                {new Date(article.publishedAt).toLocaleString()}
              </span>
            </div>
          )}
          {article.slug && (
            <div>
              <span className="text-gray-400">Slug:</span>
              <span className="ml-2 text-white">{article.slug}</span>
            </div>
          )}
        </div>

        {article.competitorUrls && article.competitorUrls.length > 0 && (
          <div className="mt-4">
            <span className="text-gray-400 text-sm block mb-2">Analyzed Competitors:</span>
            <ul className="space-y-1">
              {article.competitorUrls.map((url, idx) => (
                <li key={idx}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{url}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Used */}
        <div className="mt-4">
          <span className="text-gray-400 text-sm block mb-2">Features Used:</span>
          <div className="flex flex-wrap gap-2">
            {article.enableHook && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Hook
              </span>
            )}
            {article.enableFirstPerson && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                First Person
              </span>
            )}
            {article.enableStories && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Stories
              </span>
            )}
            {article.enableHtmlElements && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                HTML Elements
              </span>
            )}
            {article.enableCitations && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Citations
              </span>
            )}
            {article.enableInternalLinks && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Internal Links
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
