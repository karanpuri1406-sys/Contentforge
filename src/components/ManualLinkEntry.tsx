import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { db } from '../lib/db';

interface ManualLinkEntryProps {
  onLinkAdded: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ManualLinkEntry({ onLinkAdded, onSuccess, onError }: ManualLinkEntryProps) {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const handleAddLink = async () => {
    if (!url.trim() || !title.trim()) {
      onError('Please enter both URL and title');
      return;
    }

    try {
      await db.internalLinks.add({
        url: url.trim(),
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        keywords: [],
        sitemapUrl: 'manual',
        createdAt: new Date(),
      });

      setUrl('');
      setTitle('');
      setExcerpt('');
      setShowForm(false);
      onLinkAdded();
      onSuccess('Internal link added successfully');
    } catch (err) {
      onError('Failed to add internal link');
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Add Link Manually</span>
      </button>
    );
  }

  return (
    <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">Add Internal Link Manually</h4>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          URL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourblog.com/article"
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title"
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description of the article"
          rows={2}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleAddLink}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Link</span>
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
