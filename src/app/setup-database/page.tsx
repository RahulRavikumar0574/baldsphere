'use client';

import { useState } from 'react';

export default function SetupDatabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createContactTable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-contact-table', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to create table' });
    }
    setLoading(false);
  };

  const checkContactTable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-contact-table');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to check table' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Setup</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Messages Table</h2>
          
          <div className="space-x-4 mb-4">
            <button
              onClick={checkContactTable}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Table'}
            </button>
            
            <button
              onClick={createContactTable}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Check Table" to see if contact_messages table exists</li>
            <li>If it doesn't exist, click "Create Table" to create it</li>
            <li>Once created, your contact form will store submissions in the database</li>
            <li>You can then check submissions in pgAdmin or via API</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
