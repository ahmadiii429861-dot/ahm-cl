
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VisualizerProps {
  data: { x: number; y: number }[];
  label: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ data, label }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">{label || 'Function Visualization'}</h4>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="x" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748b' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '16px',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
              }}
              itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
              cursor={{ stroke: '#06b6d4', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#06b6d4" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorY)"
              activeDot={{ r: 6, stroke: '#0891b2', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Visualizer;
