import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SearchMode } from '../types';

interface NetworkVisualizerProps {
  mode: SearchMode;
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ mode }) => {
  const [data, setData] = useState<{ time: string; packets: number; indexed: number }[]>([]);

  useEffect(() => {
    // Initialize fake data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      packets: Math.floor(Math.random() * 1000) + 500,
      indexed: Math.floor(Math.random() * 50) + 10,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData((prev) => {
        const newTime = (parseInt(prev[prev.length - 1].time) + 1).toString();
        const baseActivity = mode === SearchMode.DEEP ? 2000 : 800;
        const volatility = mode === SearchMode.DEEP ? 1000 : 300;
        
        const newPacket = Math.floor(Math.random() * volatility) + baseActivity;
        const newIndexed = Math.floor(Math.random() * (mode === SearchMode.DEEP ? 20 : 100)) + 5;

        const newData = [...prev.slice(1), { time: newTime, packets: newPacket, indexed: newIndexed }];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  const color = mode === SearchMode.DEEP ? "#22c55e" : "#3b82f6"; // Green for Onion/Deep, Blue for Surface

  return (
    <div className="h-48 w-full glass-panel rounded-lg p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">Network Traffic & Indexing</h3>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${mode === SearchMode.DEEP ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
          {mode === SearchMode.DEEP ? 'ENCRYPTED' : 'CLEARTEXT'}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
              itemStyle={{ color: color }}
            />
            <Area 
              type="monotone" 
              dataKey="packets" 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorPackets)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2 text-xs font-mono text-gray-500">
        <span>IN: {data[data.length-1]?.packets.toLocaleString()} kb/s</span>
        <span>INDEXED: {data[data.length-1]?.indexed.toLocaleString()} pgs</span>
      </div>
    </div>
  );
};

export default NetworkVisualizer;