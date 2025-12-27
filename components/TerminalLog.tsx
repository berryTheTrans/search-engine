import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, SearchMode } from '../types';

interface TerminalLogProps {
  mode: SearchMode;
  isSearching: boolean;
}

const TerminalLog: React.FC<TerminalLogProps> = ({ mode, isSearching }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const randomIP = () => Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
  const randomHash = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const type = Math.random() > 0.9 ? 'warning' : 'info';
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      let message = "";
      if (mode === SearchMode.DEEP) {
        message = `[TOR] Node ${randomHash()} relaying from ${randomIP()}... Handshake complete.`;
      } else {
        message = `[CRAWL] Indexing ${randomHash()}.html from ${randomIP()}... OK.`;
      }

      if (isSearching) {
        message = `[QUERY] Analyzing vector space for input... Match found in sector ${randomHash()}.`;
      }

      const newLog: LogEntry = {
        id: Math.random().toString(),
        timestamp,
        message,
        type
      };

      setLogs(prev => [...prev.slice(-15), newLog]);
    }, isSearching ? 300 : 1500);

    return () => clearInterval(interval);
  }, [mode, isSearching]);

  return (
    <div className="font-mono text-xs p-4 glass-panel rounded-lg h-48 overflow-hidden flex flex-col relative">
        <div className="absolute top-2 right-2 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
        {logs.map(log => (
          <div key={log.id} className={`${log.type === 'warning' ? 'text-yellow-500' : 'text-gray-400'} whitespace-nowrap`}>
            <span className="opacity-50">[{log.timestamp}]</span> {log.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-2 pt-2 border-t border-gray-800 text-gray-500 animate-pulse">
        _ Awaiting input stream...
      </div>
    </div>
  );
};

export default TerminalLog;