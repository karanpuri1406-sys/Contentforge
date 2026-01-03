import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import GenerationForm from '../components/GenerationForm';
import StatsPanel from '../components/StatsPanel';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('new-sequence');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 flex">
        <div className="flex-1 p-8">
          {activeView === 'new-sequence' && <GenerationForm profile={profile} />}
          {activeView === 'dashboard' && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
              <p className="text-slate-400">Your content statistics and analytics will appear here.</p>
            </div>
          )}
          {activeView === 'archives' && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-4">Archives</h1>
              <p className="text-slate-400">Your saved blog posts will appear here.</p>
            </div>
          )}
        </div>

        <StatsPanel />
      </main>
    </div>
  );
}
