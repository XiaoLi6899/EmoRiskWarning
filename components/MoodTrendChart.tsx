import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { DailyEmotionMetrics } from '../types';

interface MoodTrendChartProps {
  data: DailyEmotionMetrics[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyEmotionMetrics;
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-lg text-sm min-w-[200px]">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-500">综合风险指数</span>
          <span className={`font-bold text-lg ${data.isAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
            {data.compositeScore}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">压力 (Stress)</span>
            <span className="font-mono font-medium">{data.details.stress}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-400" style={{width: `${data.details.stress}%`}}></div>
          </div>

          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">情绪波动 (Instability)</span>
            <span className="font-mono font-medium">{data.details.instability}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-amber-400" style={{width: `${data.details.instability}%`}}></div>
          </div>

          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">负面情绪 (Negative)</span>
            <span className="font-mono font-medium">{data.details.negative}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-blue-400" style={{width: `${data.details.negative}%`}}></div>
          </div>

          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">攻击性 (Aggression)</span>
            <span className="font-mono font-medium">{data.details.aggression}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-rose-400" style={{width: `${data.details.aggression}%`}}></div>
          </div>
        </div>

        {data.isAlert && data.alertReason && (
          <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
            <p className="text-xs font-bold text-rose-600 mb-1">已触发预警:</p>
            <div className="flex flex-wrap gap-1">
              {data.alertReason.map((r, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] rounded border border-rose-100">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data }) => {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10}/>
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]}/>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{top: -10}}/>
          
          <ReferenceLine y={60} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '预警阈值', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
          
          <Line 
            name="个体基线 (10次有效均值)" 
            type="monotone" 
            dataKey="baselineScore" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
          />

          <Area 
            type="monotone" 
            dataKey="compositeScore" 
            stroke="none" 
            fill="url(#colorRisk)" 
          />
          
          <Line 
            name="综合风险指数" 
            type="monotone" 
            dataKey="compositeScore" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isAlert) {
                return <circle cx={cx} cy={cy} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} key={payload.date}/>;
              }
              return <circle cx={cx} cy={cy} r={3} fill="#4f46e5" strokeWidth={0} key={payload.date}/>;
            }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrendChart;