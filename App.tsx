import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, Shield, Globe, Lock, Cpu, Database, ExternalLink, AlertTriangle, Menu, X, Terminal, ChevronRight } from 'lucide-react';
import { SearchMode, SearchResult } from './types';
import { performSearch } from './services/gemini';
import NetworkVisualizer from './components/NetworkVisualizer';
import TerminalLog from './components/TerminalLog';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(SearchMode.SURFACE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await performSearch(query, mode);
      setResult(data);
    } catch (err) {
      setError("Connection to query node failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const themeColor = mode === SearchMode.DEEP ? 'text-green-500' : 'text-blue-500';
  const borderColor = mode === SearchMode.DEEP ? 'border-green-500/50' : 'border-blue-500/50';
  const glowColor = mode === SearchMode.DEEP ? 'shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'shadow-[0_0_20px_rgba(59,130,246,0.2)]';

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-gray-700 selection:text-white overflow-x-hidden">
      
      {/* Background Grid Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg border ${borderColor} ${mode === SearchMode.DEEP ? 'bg-green-950/30' : 'bg-blue-950/30'}`}>
            <Globe className={`w-5 h-5 ${themeColor}`} />
          </div>
          <span className="font-mono font-bold tracking-widest text-lg">
            OCULUS<span className={themeColor}>_V3</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${mode === SearchMode.DEEP ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
            <span>NODE_STATUS: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
             <Shield className="w-3 h-3" />
             <span>PROXY: {mode === SearchMode.DEEP ? 'ACTIVE (TOR_BRIDGE)' : 'DIRECT'}</span>
          </div>
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-300">
            {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 max-w-4xl">
          
          {/* Mode Toggles */}
          <div className="flex gap-4 mb-2 overflow-x-auto pb-2 scrollbar-hide">
             <button
               onClick={() => setMode(SearchMode.SURFACE)}
               className={`flex items-center gap-2 px-6 py-3 rounded-md font-mono text-sm transition-all duration-300 border whitespace-nowrap ${
                 mode === SearchMode.SURFACE 
                 ? 'bg-blue-900/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                 : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-600'
               }`}
             >
               <Globe className="w-4 h-4" />
               SURFACE WEB
             </button>
             <button
               onClick={() => setMode(SearchMode.DEEP)}
               className={`flex items-center gap-2 px-6 py-3 rounded-md font-mono text-sm transition-all duration-300 border whitespace-nowrap ${
                 mode === SearchMode.DEEP
                 ? 'bg-green-900/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                 : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-600'
               }`}
             >
               <Lock className="w-4 h-4" />
               DEEP INDEX / ONION
             </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative group">
            <div className={`absolute -inset-0.5 rounded-lg blur opacity-30 transition duration-200 ${mode === SearchMode.DEEP ? 'bg-green-500' : 'bg-blue-500'} group-hover:opacity-50`}></div>
            <div className="relative flex items-center bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                <Search className={`ml-4 w-5 h-5 ${themeColor}`} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={mode === SearchMode.DEEP ? "Enter .onion address, keyword, or hash..." : "Search the indexed web..."}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-100 placeholder-gray-600 px-4 py-4 font-mono text-sm"
                />
                <div className="pr-4 hidden md:flex gap-2">
                   <button type="submit" className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-gray-300 px-3 py-1 rounded text-xs font-mono">SEARCH</button>
                </div>
            </div>
          </form>

          {/* Results Area */}
          <div className="min-h-[400px] mt-4">
             {isLoading ? (
               <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
                  <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${mode === SearchMode.DEEP ? 'border-green-500' : 'border-blue-500'}`}></div>
                  <div className="font-mono text-xs animate-pulse">
                    {mode === SearchMode.DEEP ? 'ROUTING THROUGH ONION CIRCUITS...' : 'RETRIEVING FROM SURFACE NODES...'}
                  </div>
               </div>
             ) : error ? (
               <div className="p-6 border border-red-900/50 bg-red-950/10 rounded-lg text-red-400 flex items-center gap-3">
                 <AlertTriangle className="w-5 h-5" />
                 {error}
               </div>
             ) : result ? (
               <div className="animate-fade-in space-y-8">
                 
                 {/* Meta Header */}
                 <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-b border-gray-800 pb-2">
                    <span>{result.sources.length} RESULTS FOUND</span>
                    <span className="flex items-center gap-2">
                      <span>LATENCY: {result.latency}ms</span>
                    </span>
                 </div>

                 {/* AI Synthesis Box */}
                 <div className="p-5 rounded-lg bg-gray-900/40 border border-gray-800 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${mode === SearchMode.DEEP ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex items-center gap-2 mb-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                        <Cpu className="w-3 h-3" />
                        <span>Intelligence Report</span>
                    </div>
                    <div className={`prose prose-invert prose-sm max-w-none ${mode === SearchMode.DEEP ? 'prose-headings:text-green-400 prose-a:text-green-400' : 'prose-headings:text-blue-400 prose-a:text-blue-400'}`}>
                      <ReactMarkdown>{result.text}</ReactMarkdown>
                    </div>
                 </div>

                 {/* Search Results List */}
                 {result.sources.length > 0 && (
                   <div className="space-y-6">
                     <h3 className="text-xs font-mono text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                       <Database className="w-3 h-3" />
                       Indexed Directories
                     </h3>
                     <div className="flex flex-col gap-6">
                       {result.sources.map((source, idx) => {
                         // Parse domain for display
                         let domain = '';
                         try { domain = new URL(source.uri).hostname; } catch(e) { domain = source.uri; }
                         
                         return (
                         <div key={idx} className="group flex flex-col gap-1.5 p-3 -mx-3 rounded hover:bg-gray-900/30 transition-colors">
                           <a 
                             href={source.uri} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex items-center gap-2 text-xs text-gray-400"
                           >
                             <div className="w-5 h-5 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-700">
                                <img 
                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                                    alt="" 
                                    className="w-3.5 h-3.5 opacity-80"
                                    onError={(e) => {e.currentTarget.style.display='none'}} 
                                />
                             </div>
                             <span className="group-hover:text-gray-200 transition-colors font-medium">{domain}</span>
                             <div className="w-0.5 h-0.5 rounded-full bg-gray-600"></div>
                             <span className="truncate max-w-[200px] opacity-60 font-mono text-[10px]">{source.uri}</span>
                           </a>
                           
                           <a 
                             href={source.uri} 
                             target="_blank" 
                             rel="noreferrer"
                             className={`text-xl font-medium hover:underline leading-tight ${mode === SearchMode.DEEP ? 'text-green-400 decoration-green-500/30' : 'text-blue-400 decoration-blue-500/30'}`}
                           >
                             {source.title}
                           </a>
                           
                           {/* Simulated Snippet Line */}
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                Access this resource directly via the gateway. Encrypted connection recommended for deep web sources. Click title to initiate handshake.
                              </span>
                           </div>
                         </div>
                       )})}
                     </div>
                   </div>
                 )}

               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                  <Cpu className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-mono text-sm">System ready. Initiate query to begin indexing.</p>
               </div>
             )}
          </div>

        </div>

        {/* Sidebar (Desktop) / Drawer (Mobile) */}
        <div className={`
            fixed lg:relative top-0 right-0 h-full lg:h-auto w-80 bg-gray-950 lg:bg-transparent border-l lg:border-none border-gray-800 z-40 transform transition-transform duration-300 ease-in-out p-6 lg:p-0 flex flex-col gap-6
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="lg:hidden flex justify-end mb-4">
             <button onClick={() => setSidebarOpen(false)}><X className="text-gray-400" /></button>
          </div>

          <div className="space-y-6 sticky top-24">
             {/* Stats Widget */}
             <div className="space-y-2">
               <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">Live Metrics</h3>
               <NetworkVisualizer mode={mode} />
             </div>

             {/* Terminal Log */}
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">System Log</h3>
                 <Terminal className="w-3 h-3 text-gray-600" />
               </div>
               <TerminalLog mode={mode} isSearching={isLoading} />
             </div>

             {/* Info Block */}
             <div className="p-4 rounded border border-gray-800 bg-gray-900/30 text-xs text-gray-500 leading-relaxed">
               <strong className="text-gray-300 block mb-2">Protocol Disclaimer</strong>
               Access to deep web content is simulated for research purposes using high-level reasoning models. 
               Actual encrypted network traffic routing is handled externally. 
               User assumes responsibility for all query intents.
             </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;