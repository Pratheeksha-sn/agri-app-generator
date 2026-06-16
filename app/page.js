'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
  if (!prompt.trim()) return;
  setLoading(true);
  setGeneratedCode('');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (data.code) {
      setGeneratedCode(data.code);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Something went wrong. Check your API key.');
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-green-950 text-white flex flex-col">
      
      {/* Header */}
      <header className="p-4 bg-green-900 border-b border-green-700 flex items-center gap-3">
        <span className="text-2xl">🌾</span>
        <h1 className="text-xl font-bold tracking-wide">Agri App Generator</h1>
        <span className="text-green-400 text-sm ml-2">powered by Gemini AI</span>
      </header>

      {/* Prompt Bar */}
      <div className="p-4 bg-green-900 border-b border-green-700 flex gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Build a crop recommendation app based on soil NPK values..."
          className="flex-1 px-4 py-2 rounded-lg bg-green-800 border border-green-600 
                     text-white placeholder-green-400 focus:outline-none focus:border-green-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-6 py-2 bg-green-500 hover:bg-green-400 disabled:bg-green-800 
                     disabled:text-green-600 text-black font-semibold rounded-lg transition"
        >
          {loading ? 'Generating...' : 'Generate App'}
        </button>
      </div>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
        
        {/* Left — Code Panel */}
        <div className="w-1/2 border-r border-green-700 flex flex-col">
          <div className="px-4 py-2 bg-green-900 text-green-400 text-sm font-mono border-b border-green-700">
            📄 Generated Code
          </div>
          <pre className="flex-1 overflow-auto p-4 text-sm font-mono text-green-300 bg-green-950">
            {generatedCode || '// Your generated app code will appear here...'}
          </pre>
        </div>

        {/* Right — Live Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="px-4 py-2 bg-green-900 text-green-400 text-sm font-mono border-b border-green-700">
            🖥️ Live Preview
          </div>
          <div className="flex-1 bg-white">
            {generatedCode ? (
              <iframe
                srcDoc={generatedCode}
                className="w-full h-full border-none"
                title="Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-green-50">
                <div className="text-center text-green-800">
                  <div className="text-5xl mb-3">🌱</div>
                  <p className="text-lg font-medium">Your app preview will appear here</p>
                  <p className="text-sm text-green-600 mt-1">Enter a prompt and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}