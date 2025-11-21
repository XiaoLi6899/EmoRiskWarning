import React, { useState, useRef } from 'react';
import { TrajectoryNode, EmotionType } from '../types';
import { Map as MapIcon, UploadCloud, Search, Clock, Split, Plus, Minus, RotateCcw, Move } from 'lucide-react';
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
  
  // GIS Layer Controls
  const [layers, setLayers] = useState({
    basemap: true,
    heatmap: true,
    path: true,
    points: true,
    anomalies: true,
    predicted: true
  });

  // Viewport State (Zoom & Pan)
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCoords = (zoneName: string) => {
    return ZONES[zoneName] || { x: 50, y: 50, label: zoneName };
  };

  // Zoom Handlers
  const handleZoom = (delta: number) => {
    setViewState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(4, prev.scale + delta))
    }));
  };

  const handleReset = () => {
    setViewState({ scale: 1, x: 0, y: 0 });
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - viewState.x, y: e.clientY - viewState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    setViewState(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current!.x,
      y: e.clientY - dragStartRef.current!.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Simple wheel zoom
    // e.preventDefault(); // React synthetic events don't support preventDefault on wheel in passive listeners often, but we can try strictly or just logic
    const scaleAdjustment = -e.deltaY * 0.001;
    setViewState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(4, prev.scale + scaleAdjustment))
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden relative group">
      
      {/* 1. GIS Toolbar Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm shadow-blue-200">
            <MapIcon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">时空轨迹 GIS 分析</h2>
            <p className="text-[10px] text-slate-500 font-mono">EPSG:4326 • WGS84 • Static View</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <UploadCloud size={12} />
                <span>导入底图</span>
            </button>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <LayerToggle label="底图" active={layers.basemap} onClick={() => toggleLayer('basemap')} />
                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                <LayerToggle label="热力" active={layers.heatmap} onClick={() => toggleLayer('heatmap')} />
                <LayerToggle label="轨迹" active={layers.path} onClick={() => toggleLayer('path')} />
                <LayerToggle label="预测" active={layers.predicted} onClick={() => toggleLayer('predicted')} />
                <LayerToggle label="异常" active={layers.anomalies} onClick={() => toggleLayer('anomalies')} color="text-rose-600" />
            </div>
        </div>
      </div>

      {/* 2. Map Viewport */}
      <div 
        className={`relative flex-1 w-full bg-[#eef2f6] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-20 bg-white border border-slate-200 rounded-lg shadow-md p-1">
            <button onClick={() => handleZoom(0.2)} className="p-1.5 hover:bg-slate-50 rounded text-slate-600" title="放大">
                <Plus size={16} />
            </button>
            <div className="h-px bg-slate-100 w-full my-0.5"></div>
            <button onClick={() => handleZoom(-0.2)} className="p-1.5 hover:bg-slate-50 rounded text-slate-600" title="缩小">
                <Minus size={16} />
            </button>
            <div className="h-px bg-slate-100 w-full my-0.5"></div>
            <button onClick={handleReset} className="p-1.5 hover:bg-slate-50 rounded text-slate-600" title="重置视图">
                <RotateCcw size={16} />
            </button>
        </div>

        {/* Map Legend - Floating */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-lg text-[10px] space-y-2 z-10 min-w-[120px] pointer-events-none select-none">
            <div className="font-bold text-slate-700 pb-1 border-b border-slate-100 mb-1">图例 Symbology</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 愉悦 (Happy)</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 压力 (Stress)</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 激动 (Agitation)</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 border border-slate-400 border-dashed rounded-full"></span> 缺失/盲区</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 border-2 border-rose-500 rounded-full"></span> 异常滞留</div>
            <div className="flex items-center gap-2"><span className="w-4 h-0.5 border-t border-dashed border-slate-400"></span> 预测路线</div>
        </div>

        {/* 3. SVG Map Engine */}
        <svg 
            className="w-full h-full touch-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="heatmap-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -6" />
            </filter>
            <pattern id="grass" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#dcfce7"/>
                <circle cx="2" cy="2" r="0.5" fill="#bbf7d0"/>
            </pattern>
            <pattern id="building" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 0 4 L 4 0" stroke="#cbd5e1" strokeWidth="0.5"/>
            </pattern>
            <marker id="arrow-head" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
               <path d="M 0 0 L 4 2 L 0 4 z" fill="#64748b" />
            </marker>
             <marker id="arrow-head-active" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
               <path d="M 0 0 L 4 2 L 0 4 z" fill="#4f46e5" />
            </marker>
          </defs>

          {/* Transform Group for Zoom/Pan */}
          <g transform={`translate(${viewState.x},${viewState.y}) scale(${viewState.scale})`} style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.1s' }}>

              {/* --- LAYER 1: BASEMAP --- */}
              {layers.basemap && (
                <g className="basemap-layer">
                  <rect x="-100" y="-100" width="300" height="300" fill="#f1f5f9" />
                  
                  {/* River */}
                  <path d="M -10 40 Q 20 30 40 45 T 110 35" fill="none" stroke="#bfdbfe" strokeWidth="8" />
                  
                  {/* Roads */}
                  <path d="M 5 5 L 95 5 L 95 95 L 5 95 Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
                  <path d="M 35 5 L 35 95" fill="none" stroke="white" strokeWidth="2.5"/>
                  <path d="M 65 5 L 65 95" fill="none" stroke="white" strokeWidth="2.5"/>
                  <path d="M 5 35 L 95 35" fill="none" stroke="white" strokeWidth="2.5"/>
                  <path d="M 5 65 L 95 65" fill="none" stroke="white" strokeWidth="2.5"/>
                  
                  {/* Green Zones */}
                  <rect x="6" y="6" width="28" height="28" fill="url(#grass)" rx="2" opacity="0.6"/>
                  <rect x="66" y="66" width="28" height="28" fill="url(#grass)" rx="2" opacity="0.6"/>
                  <circle cx="50" cy="50" r="12" fill="url(#grass)" opacity="0.4"/>

                  {/* Buildings */}
                  <rect x="10" y="15" width="18" height="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                  <rect x="12" y="17" width="14" height="8" fill="url(#building)" opacity="0.5" />
                  <text x="19" y="21" fontSize="1.5" fill="#64748b" textAnchor="middle">宿舍楼B</text>
                  
                  <path d="M 45 30 L 65 30 L 65 40 L 45 40 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                  <text x="55" y="36" fontSize="1.5" fill="#64748b" textAnchor="middle">高二教学楼</text>
                  
                  <circle cx="30" cy="45" r="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5"/>
                  <text x="30" y="46" fontSize="1.5" fill="#64748b" textAnchor="middle">食堂</text>

                  <rect x="75" y="20" width="10" height="14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5"/>
                  <text x="80" y="28" fontSize="1.5" fill="#64748b" textAnchor="middle">图书馆</text>

                  <text x="50" y="4" fontSize="1.8" fill="#cbd5e1" textAnchor="middle" letterSpacing="1">江东大道快速路</text>
                  <text x="20" y="98" fontSize="1.8" fill="#cbd5e1" textAnchor="middle" letterSpacing="1">学源街辅路</text>
                </g>
              )}

              {/* --- LAYER 2: HEATMAP --- */}
              {layers.heatmap && (
                <g filter="url(#heatmap-blur)" className="mix-blend-multiply opacity-70 pointer-events-none">
                  {Object.entries(ZONES).map(([name, coords], idx) => {
                    const nodeData = data.find(d => d.zone === name);
                    const frequency = nodeData?.frequency || 0; 
                    if (frequency < 0.1) return null;
                    return (
                        <circle 
                            key={`heat-${idx}`}
                            cx={coords.x} cy={coords.y} 
                            r={12 * frequency} 
                            fill={frequency > 0.6 ? "#ef4444" : "#fbbf24"} 
                        />
                    )
                  })}
                </g>
              )}

              {/* --- LAYER 3: PREDICTED PATH --- */}
              {layers.predicted && (
                 <g opacity="0.5" className="pointer-events-none">
                   <polyline 
                      points={MOCK_PREDICTED_PATH.map(z => {
                          const c = getCoords(z);
                          return `${c.x},${c.y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="0.6"
                      strokeDasharray="2 1"
                    />
                    {MOCK_PREDICTED_PATH.map((z, i) => {
                       const c = getCoords(z);
                       return <circle key={i} cx={c.x} cy={c.y} r="0.6" fill="#64748b" />
                    })}
                 </g>
              )}

              {/* --- LAYER 4: TRAJECTORY PATH (Static) --- */}
              {layers.path && data.map((node, i) => {
                if (i === data.length - 1) return null;
                const start = getCoords(node.zone);
                const end = getCoords(data[i + 1].zone);
                const isMissing = node.status === 'missing';
                const emotionColor = EMOTION_COLORS[node.emotion];
                
                return (
                  <g key={`path-${i}`}>
                    <line 
                        x1={start.x} y1={start.y}
                        x2={end.x} y2={end.y}
                        stroke={isMissing ? "#94a3b8" : "#4f46e5"} 
                        strokeWidth={isMissing ? "0.5" : "0.8"}
                        strokeDasharray={isMissing ? "1 1" : "0"}
                        markerEnd={isMissing ? "" : "url(#arrow-head-active)"}
                    />
                    {/* Static halo for emotion */}
                    {!isMissing && (
                        <line 
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={end.y}
                            stroke={emotionColor}
                            strokeWidth="2"
                            opacity="0.15"
                            strokeLinecap="round"
                        />
                    )}
                  </g>
                );
              })}

              {/* --- LAYER 5: POINTS & ANOMALIES (Static High Contrast) --- */}
              {layers.points && data.map((node, i) => {
                const pos = getCoords(node.zone);
                const isHovered = hoveredNode === i;
                const emotionColor = EMOTION_COLORS[node.emotion];
                const isAnomaly = node.status !== 'normal';

                if (isAnomaly && !layers.anomalies) return null;

                return (
                  <g 
                    key={`node-${i}`} 
                    onMouseEnter={() => setHoveredNode(i)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {/* Anomaly Visualization - Static */}
                    {isAnomaly ? (
                        <g>
                            {node.status === 'missing' && (
                                 <g>
                                    {/* Dotted static ring */}
                                    <circle cx={pos.x} cy={pos.y} r="5" stroke="#64748b" strokeWidth="0.3" strokeDasharray="0.5 0.5" fill="none"/>
                                    <foreignObject x={pos.x - 2} y={pos.y - 2} width="4" height="4">
                                         <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-full border border-slate-400 shadow-sm">
                                            <Search size={8} className="text-slate-600" />
                                         </div>
                                    </foreignObject>
                                 </g>
                            )}
                            {node.status === 'loitering' && (
                                 <g>
                                    {/* Double border for loitering */}
                                    <circle cx={pos.x} cy={pos.y} r="6" stroke="#f43f5e" strokeWidth="0.3" fill="#f43f5e" fillOpacity="0.1"/>
                                    <circle cx={pos.x} cy={pos.y} r="4" stroke="#f43f5e" strokeWidth="0.2" fill="none"/>
                                    <foreignObject x={pos.x - 2} y={pos.y - 2} width="4" height="4">
                                         <div className="w-full h-full flex items-center justify-center bg-rose-50 rounded-full border border-rose-500 shadow-sm">
                                            <Clock size={8} className="text-rose-600" />
                                         </div>
                                    </foreignObject>
                                 </g>
                            )}
                            {node.status === 'deviation' && (
                                 <g>
                                    {/* Dashed box for deviation */}
                                    <rect x={pos.x - 3} y={pos.y - 3} width="6" height="6" stroke="#d97706" strokeWidth="0.4" strokeDasharray="1 1" fill="none" rx="1" />
                                    <foreignObject x={pos.x - 2} y={pos.y - 2} width="4" height="4">
                                         <div className="w-full h-full flex items-center justify-center bg-amber-50 rounded-full border border-amber-500 shadow-sm">
                                            <Split size={8} className="text-amber-600" />
                                         </div>
                                    </foreignObject>
                                 </g>
                            )}
                            
                            {/* Data Label (Always visible for anomalies) */}
                            <foreignObject x={pos.x + 3} y={pos.y - 4} width="35" height="20" className="pointer-events-none">
                               <div className="bg-white border border-slate-300 px-1 py-0.5 rounded text-[3px] font-bold shadow-md whitespace-nowrap text-slate-700 flex items-center gap-1">
                                  <span className="text-slate-500">{node.time}</span>
                                  <span className={node.status === 'loitering' ? 'text-rose-600' : node.status === 'missing' ? 'text-slate-600' : 'text-amber-600'}>
                                    {node.status === 'loitering' ? '! 滞留' : node.status === 'missing' ? '? 缺失' : '⇄ 偏离'}
                                  </span>
                               </div>
                            </foreignObject>
                        </g>
                    ) : (
                        // Standard Point
                        <g>
                            <circle cx={pos.x} cy={pos.y} r="1.5" fill={emotionColor} stroke="white" strokeWidth="0.5" className="drop-shadow-sm"/>
                            {/* Time Label */}
                            <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="1.8" fill="#64748b" fontWeight="bold">
                               {node.time}
                            </text>
                        </g>
                    )}

                    {/* Hover Tooltip */}
                    {isHovered && (
                         <foreignObject x={pos.x - 15} y={pos.y - 14} width="30" height="20" className="z-50 pointer-events-none">
                            <div className="bg-slate-800 text-white p-1.5 rounded shadow-xl text-[3px] leading-tight border border-slate-600">
                               <div className="font-bold mb-0.5 text-white">{node.zone}</div>
                               <div className="text-slate-300">{node.time} • {node.duration}</div>
                               <div className="mt-0.5 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full" style={{background: emotionColor}}></span>
                                  <span className="capitalize text-slate-200">{node.emotion}</span>
                               </div>
                            </div>
                         </foreignObject>
                    )}
                  </g>
                );
              })}
          </g>
        </svg>

        {/* Overlay Interaction Hint */}
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 bg-white/80 px-2 py-1 rounded pointer-events-none">
             使用滚轮缩放 • 拖拽移动
        </div>
      </div>
    </div>
  );
};

const LayerToggle = ({ label, active, onClick, color = "text-slate-700" }: { label: string, active: boolean, onClick: () => void, color?: string }) => (
    <button 
        onClick={onClick}
        className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
            active ? `bg-white border-slate-300 ${color} shadow-sm` : 'bg-slate-100 border-transparent text-slate-400'
        }`}
    >
        {label}
    </button>
);

export default TrajectoryMap;