import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import StatsPanel from './StatsPanel';

interface DashboardLayoutProps {
  children: ReactNode;
  showStats?: boolean;
}

export default function DashboardLayout({ children, showStats = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <main className="flex-1 flex">
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
        {showStats && <StatsPanel />}
      </main>
    </div>
  );
}
