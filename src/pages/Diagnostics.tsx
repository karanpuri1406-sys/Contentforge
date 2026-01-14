import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { Check, X, AlertCircle } from 'lucide-react';

export default function Diagnostics() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      indexedDBSupported: 'indexedDB' in window,
      tests: {},
    };

    try {
      // Test 1: Database exists
      results.tests.dbExists = {
        name: 'Database Initialization',
        status: false,
        details: '',
      };
      
      try {
        await db.open();
        results.tests.dbExists.status = true;
        results.tests.dbExists.details = 'Database opened successfully';
      } catch (err: any) {
        results.tests.dbExists.details = `Error: ${err.message}`;
      }

      // Test 2: API Keys table
      results.tests.apiKeysTable = {
        name: 'API Keys Table',
        status: false,
        count: 0,
        keys: [],
      };

      try {
        const allKeys = await db.apiKeys.toArray();
        results.tests.apiKeysTable.status = true;
        results.tests.apiKeysTable.count = allKeys.length;
        results.tests.apiKeysTable.keys = allKeys.map(k => ({
          id: k.id,
          provider: k.provider,
          isActive: k.isActive,
          nickname: k.nickname,
          keyPreview: k.keyValue ? `${k.keyValue.substring(0, 10)}...` : 'empty',
          createdAt: k.createdAt?.toISOString(),
        }));
      } catch (err: any) {
        results.tests.apiKeysTable.details = `Error: ${err.message}`;
      }

      // Test 3: Active API Keys query
      results.tests.activeKeys = {
        name: 'Active API Keys Query',
        status: false,
        count: 0,
        keys: [],
      };

      try {
        const activeKeys = await db.apiKeys.where({ isActive: true }).toArray();
        results.tests.activeKeys.status = true;
        results.tests.activeKeys.count = activeKeys.length;
        results.tests.activeKeys.keys = activeKeys.map(k => ({
          id: k.id,
          provider: k.provider,
          keyPreview: k.keyValue ? `${k.keyValue.substring(0, 10)}...` : 'empty',
        }));
      } catch (err: any) {
        results.tests.activeKeys.details = `Error: ${err.message}`;
      }

      // Test 4: Articles table
      results.tests.articlesTable = {
        name: 'Articles Table',
        status: false,
        count: 0,
      };

      try {
        const articles = await db.articles.count();
        results.tests.articlesTable.status = true;
        results.tests.articlesTable.count = articles;
      } catch (err: any) {
        results.tests.articlesTable.details = `Error: ${err.message}`;
      }

      // Test 5: Settings table
      results.tests.settingsTable = {
        name: 'Settings Table',
        status: false,
        exists: false,
      };

      try {
        const settings = await db.appSettings.toArray();
        results.tests.settingsTable.status = true;
        results.tests.settingsTable.exists = settings.length > 0;
        results.tests.settingsTable.count = settings.length;
      } catch (err: any) {
        results.tests.settingsTable.details = `Error: ${err.message}`;
      }

    } catch (err: any) {
      results.error = err.message;
    }

    setDbStatus(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Database Diagnostics</h1>
        <p className="text-gray-300">Check your IndexedDB status and API keys</p>
      </div>

      {/* Browser Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Browser Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">IndexedDB Supported:</span>
            <span className={dbStatus?.indexedDBSupported ? 'text-green-400' : 'text-red-400'}>
              {dbStatus?.indexedDBSupported ? 'Yes ✓' : 'No ✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Timestamp:</span>
            <span className="text-white">{dbStatus?.timestamp}</span>
          </div>
          <div className="text-gray-400 mt-2">
            <span>Browser: </span>
            <span className="text-white text-xs">{dbStatus?.browser}</span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {dbStatus?.tests && Object.entries(dbStatus.tests).map(([key, test]: [string, any]) => (
        <div key={key} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{test.name}</h3>
            {test.status ? (
              <Check className="h-6 w-6 text-green-400" />
            ) : (
              <X className="h-6 w-6 text-red-400" />
            )}
          </div>

          {test.details && (
            <div className="text-sm text-gray-400 mb-3">
              {test.details}
            </div>
          )}

          {test.count !== undefined && (
            <div className="text-sm mb-2">
              <span className="text-gray-400">Count: </span>
              <span className="text-white font-semibold">{test.count}</span>
            </div>
          )}

          {test.keys && test.keys.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-400 mb-2">Keys Found:</p>
              <div className="space-y-2">
                {test.keys.map((k: any, idx: number) => (
                  <div key={idx} className="bg-slate-700/30 rounded p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white">{k.id}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-purple-400">{k.provider}</span>
                    </div>
                    {k.isActive !== undefined && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Active:</span>
                        <span className={k.isActive ? 'text-green-400' : 'text-red-400'}>
                          {k.isActive ? 'Yes ✓' : 'No ✗'}
                        </span>
                      </div>
                    )}
                    {k.keyPreview && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Key:</span>
                        <span className="text-white font-mono text-xs">{k.keyPreview}</span>
                      </div>
                    )}
                    {k.nickname && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Nickname:</span>
                        <span className="text-white">{k.nickname}</span>
                      </div>
                    )}
                    {k.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white text-xs">{k.createdAt}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Raw JSON */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Raw Diagnostic Data</h3>
        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(dbStatus, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={runDiagnostics}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
        >
          Run Again
        </button>
        <button
          onClick={() => {
            const dataStr = JSON.stringify(dbStatus, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'blogforge-diagnostics.json';
            link.click();
          }}
          className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
        >
          Download Report
        </button>
      </div>

      {/* Help */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-blue-400 mb-2">How to use this page:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All tests should show green checkmarks</li>
              <li>API Keys count should match what you added in Settings</li>
              <li>Active Keys count should show keys with isActive=true</li>
              <li>If counts are 0, try adding an API key in Settings</li>
              <li>Download the report to share for debugging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
