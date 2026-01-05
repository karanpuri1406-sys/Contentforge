import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Zap, FileText, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Articles Generated',
      value: profile?.articles_generated_this_month || 0,
      limit: profile?.plan_limits?.articles_per_month || 10,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Images Created',
      value: profile?.images_generated_this_month || 0,
      limit: profile?.plan_limits?.images_per_month || 20,
      icon: TrendingUp,
      color: 'violet'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-slate-400">Let's create some amazing SEO-optimized content</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const percentage = (stat.value / stat.limit) * 100;
            return (
              <div
                key={stat.label}
                className={`bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-${stat.color}-500/50 transition-colors`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-600/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <span className="text-slate-400 text-sm capitalize">{profile?.plan || 'free'} Plan</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {stat.value} / {stat.limit}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{stat.label}</p>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`bg-${stat.color}-500 h-full transition-all`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">Generate Article</h3>
                  <p className="text-blue-100 text-sm">Create SEO-optimized content</p>
                </div>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            <button
              onClick={() => navigate('/api-keys')}
              className="flex items-center justify-between p-6 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">My Content</h3>
                  <p className="text-slate-400 text-sm">View generated articles</p>
                </div>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent activity yet</p>
            <p className="text-slate-500 text-sm">Generate your first article to get started!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
