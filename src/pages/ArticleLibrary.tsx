import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Eye, Trash2, ExternalLink, FileText } from 'lucide-react';
import { db, Article } from '../lib/db';

export default function ArticleLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const allArticles = await db.articles.orderBy('createdAt').reverse().toArray();
    setArticles(allArticles);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await db.articles.delete(id);
      loadArticles();
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Articles</h1>
          <p className="text-gray-300">
            Manage and organize your generated content
          </p>
        </div>
        <Link
          to="/generate"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
        >
          Generate New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full md:w-auto px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{articles.length}</div>
          <div className="text-sm text-gray-400">Total Articles</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">
            {articles.filter(a => a.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-400">Drafts</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">
            {articles.filter(a => a.status === 'published').length}
          </div>
          <div className="text-sm text-gray-400">Published</div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by generating your first article'}
            </p>
            {!searchTerm && (
              <Link
                to="/generate"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
              >
                Generate Article
              </Link>
            )}
          </div>
        ) : (
          filteredArticles.map(article => (
            <div
              key={article.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{article.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : article.status === 'draft'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-3 line-clamp-2">
                    {article.metaDescription || article.content.substring(0, 150) + '...'}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{article.wordCount} words</span>
                    </div>
                    <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {article.articleType}
                    </div>
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {article.tone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/articles/${article.id}`}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                    title="View Article"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => article.id && handleDelete(article.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
