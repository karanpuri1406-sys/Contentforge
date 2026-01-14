import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileEdit, 
  Library, 
  Settings as SettingsIcon,
  Sparkles,
  Activity,
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/generate', icon: FileEdit, label: 'Generate Content' },
    { path: '/articles', icon: Library, label: 'My Articles' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900/50 backdrop-blur-sm border-r border-purple-500/20">
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold">BlogForge AI</h1>
                <p className="text-xs text-purple-300">SEO Content Generator</p>
              </div>
            </Link>
          </div>

          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 mx-4 mb-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
            <p className="text-xs text-purple-200 mb-2">💡 Tip of the Day</p>
            <p className="text-xs text-gray-300">
              Use competitor analysis to outrank top articles by covering their topics plus unique insights.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
