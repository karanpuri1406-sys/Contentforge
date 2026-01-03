import { Activity } from 'lucide-react';

export default function StatsPanel() {
  return (
    <aside className="w-80 bg-slate-950 border-l border-slate-800 p-6 space-y-6">
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">API Telemetry</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Connected</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">OpenAI GPT-4 Turbo</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-green-400 text-xs">Connected</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-xs">45ms Latency</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Monthly Usage</span>
              <span className="text-white font-medium">78%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-slate-400 text-sm font-medium mb-2">Est. Cost</h3>
        <div className="mb-3">
          <span className="text-3xl font-bold text-white">$0.12</span>
          <span className="text-slate-400 text-sm ml-2">/ generation</span>
        </div>
        <p className="text-slate-500 text-xs">
          Based on ~3,200 input/output tokens.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
          <span className="text-slate-400 text-xs font-mono">preview.json</span>
        </div>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-slate-300">
{`{
  "model": "gpt-4-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert
blog writer proficient in SEO..."
    },
    {
      "role": "user",
      "content": "Write a blog post
about The Future of Quantum
Computing targeting Tech
enthusiasts..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2500
}`}
          </pre>
        </div>
      </div>
    </aside>
  );
}
