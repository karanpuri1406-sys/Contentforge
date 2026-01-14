import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initializeDatabase } from './lib/db';

// Pages
import Dashboard from './pages/Dashboard';
import GenerateArticle from './pages/GenerateArticle';
import ArticleLibrary from './pages/ArticleLibrary';
import ArticleView from './pages/ArticleView';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="generate" element={<GenerateArticle />} />
          <Route path="articles" element={<ArticleLibrary />} />
          <Route path="articles/:id" element={<ArticleView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
