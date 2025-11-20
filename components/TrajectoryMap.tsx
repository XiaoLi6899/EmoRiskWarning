import React, { useState } from 'react';
import { TrajectoryNode, EmotionType } from '../types';
import { Route, Layers, Info, AlertTriangle, HelpCircle, Split, Search, Clock } from 'lucide-react';
import { MOCK_PREDICTED_PATH } from '../constants';

interface TrajectoryMapProps {
  data: TrajectoryNode[];
}

// 虚拟地图坐标定义 (0-100)
const ZONES: Record<string, { x: number; y: number; label: string }> = {
  "宿舍楼B栋": { x: 15, y: 20, label: "宿舍" },
  "第一食堂": { x: 15, y: 60, label: "一食堂" },
  "第二食堂": { x: 30, y: 45, label: "二食堂" },
  "高二教学楼": { x: 55, y: 35, label: "教学楼" },
  "图书馆": { x: 80, y: 25, label: "图书馆" },
  "操场角落": { x: 85, y: 75, label: "操场" },
  "未知区域 (缺失)": { x: 50, y: 85, label: "盲区" }, // 虚拟点
};

// 情绪颜色映射
const EMOTION_COLORS: Record<EmotionType, string> = {
  neutral: '#94a3b8', // gray
  happy: '#10b981',   // emerald
  stress: '#f59e0b',  // amber
  agitation: '#ef4444', // red
  depressed: '#6366f1'  // indigo
};

const TrajectoryMap: React.FC<TrajectoryMapProps> = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [showPredicted, setShowPredicted] = useState(true);

  const getCoords = (zoneName: string) => {
    return ZONES[zoneName] || { x: 50, y: 50, label: zoneName };
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Route size={18} />
            </div>
            <h2 className="font-bold text-slate-800 text-sm">时空轨迹与情绪映射</h2>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowPredicted(!showPredicted)}
            className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                showPredicted ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white text-slate-400 border-slate-100'
            }`}
           >
             <Layers size={10} />
             预测路线
           </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-[10px] text-slate-500 px-2">
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>愉悦</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>压力</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>激动/攻击</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>低落/抑郁</div>
         <div className="w-px h-3 bg-slate-200 mx-1"></div>
         <div className="flex items-center gap-1"><AlertTriangle size={10} className="text-rose-500"/>滞留异常</div>
         <div className="flex items-center gap-1"><HelpCircle size={10} className="text-slate-400"/>信号缺失</div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full bg-[#f8fafc] rounded-xl border border-slate-200 overflow-hidden">
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-50" 
             style={{ 
                 backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}>
        </div>

        <svg className="w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrowhead" markerWidth="4" markerHeight="3" refX="3" refY="1.5" orient="auto">
              <polygon points="0 0, 4 1.5, 0 3" fill="#94a3b8" />
            </marker>
          </defs>

          {/* 1. Frequency Heatmap Layer (Static Zones) */}
          {Object.entries(ZONES).map(([name, coords], idx) => {
            const nodeData = data.find(d => d.zone === name);
            const frequency = nodeData?.frequency || 0.1; 
            
            return (
                <g key={`zone-${idx}`}>
                    <circle 
                        cx={coords.x} cy={coords.y} 
                        r={8 * frequency + 2} 
                        fill="#cbd5e1" 
                        className="opacity-20"
                    />
                    <text x={coords.x} y={coords.y + 4} fontSize="2.5" fill="#64748b" textAnchor="middle" className="opacity-50 font-medium select-none pointer-events-none">
                        {coords.label}
                    </text>
                </g>
            )
          })}


          {/* 2. Predicted Routine Path (Dashed Line) */}
          {showPredicted && (
              <polyline 
                points={MOCK_PREDICTED_PATH.map(z => {
                    const c = getCoords(z);
                    return `${c.x},${c.y}`;
                }).join(' ')}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                className="transition-all duration-300"
              />
          )}


          {/* 3. Actual Trajectory Path (Colored Segments) */}
          {data.map((node, i) => {
            if (i === data.length - 1) return null;
            const start = getCoords(node.zone);
            const end = getCoords(data[i + 1].zone);
            const isMissing = node.status === 'missing';
            const emotionColor = EMOTION_COLORS[node.emotion] || EMOTION_COLORS.neutral;
            
            return (
              <g key={`path-segment-${i}`}>
                <line 
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke={isMissing ? "#94a3b8" : emotionColor}
                    strokeWidth={isMissing ? "0.5" : "1"}
                    strokeDasharray={isMissing ? "1 1" : "0"}
                    className="transition-all duration-500"
                />
                {/* Direction Arrow */}
                <polygon 
                    points="-1,-1 1,0 -1,1"
                    fill={isMissing ? "#94a3b8" : emotionColor}
                    transform={`translate(${(start.x + end.x)/2}, ${(start.y + end.y)/2}) rotate(${Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI}) scale(1.5)`} 
                />
              </g>
            );
          })}


          {/* 4. Active Nodes & Anomalies */}
          {data.map((node, i) => {
            const pos = getCoords(node.zone);
            const isHovered = hoveredNode === i;
            const emotionColor = EMOTION_COLORS[node.emotion];

            // Specific Visual Logic for Anomalies
            let AnomalyVisual = null;

            if (node.status === 'missing') {
                // MISSING: Dashed ring + Question Mark Icon
                AnomalyVisual = (
                    <g>
                        <circle cx={pos.x} cy={pos.y} r="5" stroke="#94a3b8" strokeWidth="0.3" strokeDasharray="1 1" fill="none" className="animate-spin-slow origin-center" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
                        <foreignObject x={pos.x - 2.5} y={pos.y - 2.5} width="5" height="5">
                             <div className="w-full h-full flex items-center justify-center">
                                <div className="bg-slate-100 rounded-full p-0.5 border border-slate-300 shadow-sm">
                                    <Search size={10} className="text-slate-400" />
                                </div>
                             </div>
                        </foreignObject>
                    </g>
                );
            } else if (node.status === 'loitering') {
                // LOITERING: Red Pulse + Warning Icon
                AnomalyVisual = (
                    <g>
                        <circle cx={pos.x} cy={pos.y} r="7" fill={emotionColor} className="animate-ping opacity-30" />
                        <circle cx={pos.x} cy={pos.y} r="7" stroke={emotionColor} strokeWidth="0.2" fill="none" className="opacity-50" />
                         <foreignObject x={pos.x - 2.5} y={pos.y - 2.5} width="5" height="5">
                             <div className="w-full h-full flex items-center justify-center">
                                <div className="bg-rose-100 rounded-full p-0.5 border border-rose-500 shadow-sm animate-bounce">
                                    <Clock size={10} className="text-rose-600" />
                                </div>
                             </div>
                        </foreignObject>
                    </g>
                );
            } else if (node.status === 'deviation') {
                 // DEVIATION: Purple Dashed Border + Split Icon
                AnomalyVisual = (
                    <g>
                        <circle cx={pos.x} cy={pos.y} r="5" stroke={emotionColor} strokeWidth="0.3" strokeDasharray="0.5 0.5" fill="none" />
                        <foreignObject x={pos.x - 2.5} y={pos.y - 2.5} width="5" height="5">
                             <div className="w-full h-full flex items-center justify-center">
                                <div className="bg-indigo-50 rounded-full p-0.5 border border-indigo-300 shadow-sm">
                                    <Split size={10} className="text-indigo-500" />
                                </div>
                             </div>
                        </foreignObject>
                    </g>
                );
            } else {
                // NORMAL: Simple dot
                AnomalyVisual = (
                    <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r={isHovered ? 3 : 2} 
                        fill="white" 
                        stroke={emotionColor}
                        strokeWidth="1"
                        className="transition-all duration-300"
                    />
                );
            }

            return (
              <g 
                key={`node-${i}`} 
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer hover:z-20"
              >
                {AnomalyVisual}
                
                {/* Sequence Number Badge (if hovered) */}
                {isHovered && (
                    <g transform={`translate(${pos.x}, ${pos.y - 5})`}>
                         <foreignObject x="-10" y="-4" width="20" height="6">
                             <div className="flex justify-center">
                                <div className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                                    {node.time}
                                </div>
                             </div>
                         </foreignObject>
                    </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredNode !== null && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-100 z-20 animate-in slide-in-from-bottom-2 duration-200">
             <div className="flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{data[hoveredNode].zone}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            data[hoveredNode].status === 'normal' ? 'bg-slate-50 text-slate-500 border-slate-200' : 
                            data[hoveredNode].status === 'missing' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                            'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                            {data[hoveredNode].status === 'missing' && <Search size={10}/>}
                            {data[hoveredNode].status === 'loitering' && <Clock size={10}/>}
                            {data[hoveredNode].status === 'deviation' && <Split size={10}/>}
                            
                            {data[hoveredNode].status === 'missing' ? '信号缺失' : 
                             data[hoveredNode].status === 'loitering' ? '异常滞留' : 
                             data[hoveredNode].status === 'deviation' ? '路线偏离' : '正常'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>时间: {data[hoveredNode].time}</span>
                        <span>停留: {data[hoveredNode].duration}</span>
                    </div>
                 </div>
                 
                 {/* Emotion Tag */}
                 <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">识别情绪</div>
                    <div className="font-bold text-sm" style={{ color: EMOTION_COLORS[data[hoveredNode].emotion] }}>
                        {data[hoveredNode].emotion === 'happy' ? '愉悦' : 
                         data[hoveredNode].emotion === 'stress' ? '高度紧张' :
                         data[hoveredNode].emotion === 'agitation' ? '激动/攻击' :
                         data[hoveredNode].emotion === 'depressed' ? '低落/抑郁' : '平静'}
                    </div>
                 </div>
             </div>
             
             {/* Context info for anomalies */}
             {data[hoveredNode].status !== 'normal' && (
                 <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-rose-600 flex items-start gap-1.5">
                     <Info size={12} className="mt-0.5 flex-shrink-0"/>
                     <span>
                        {data[hoveredNode].status === 'missing' ? '系统未检测到人脸信号，建议核查盲区监控(校外/死角)。' : 
                         data[hoveredNode].status === 'deviation' ? '未按照常规预测路线（去食堂/宿舍），路径出现异常偏离。' :
                         '在该区域停留时间超过群体基线200%，且无社交互动。'}
                     </span>
                 </div>
             )}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400">
        <span>* 圆圈大小代表访问频率 | 闪烁图标代表异常</span>
      </div>
    </div>
  );
};

export default TrajectoryMap;