import React, { useEffect, useState } from 'react';
import { Brain, RefreshCw, Fingerprint, HeartPulse, Sprout, ShieldAlert, Tag } from 'lucide-react';
import { StudentProfile, DailyEmotionMetrics, AIAnalysisResult, TrajectoryNode } from '../types';
import { generateStudentReport } from '../services/geminiService';

interface InsightPanelProps {
  student: StudentProfile;
  history: DailyEmotionMetrics[];
  trajectory: TrajectoryNode[];
}

const InsightPanel: React.FC<InsightPanelProps> = ({ student, history, trajectory }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const result = await generateStudentReport(student, history, trajectory);
      setAnalysis(result);
    } catch (e) {
      console.error("Failed to fetch analysis", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTags = (content: string, colorClass: string, bgClass: string, borderClass: string) => {
    // Split by pipe | or newline or Chinese comma
    const tags = content.split(/[||\n，]/).map(t => t.trim()).filter(t => t.length > 0);
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${bgClass} ${colorClass} ${borderClass} shadow-sm`}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const renderCard = (title: string, content: string, icon: React.ReactNode, baseColor: 'indigo' | 'rose' | 'emerald' | 'amber') => {
    
    let styles = {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-100'
    };

    if (baseColor === 'rose') {
      styles = { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', iconBg: 'bg-rose-100' };
    } else if (baseColor === 'emerald') {
      styles = { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100' };
    } else if (baseColor === 'amber') {
      styles = { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100' };
    }

    return (
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 rounded-lg ${styles.iconBg} ${styles.text}`}>
            {icon}
          </div>
          <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
        </div>
        {renderTags(content, styles.text, styles.bg, styles.border)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200">
            <Tag size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">智能画像标签</h2>
            <p className="text-[10px] text-slate-400">AI Generated Profile Tags</p>
          </div>
        </div>
        <button 
          onClick={fetchAnalysis} 
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
             <div className="bg-slate-200 h-24 rounded-xl w-full"></div>
             <div className="bg-slate-200 h-24 rounded-xl w-full"></div>
             <div className="bg-slate-200 h-24 rounded-xl w-full"></div>
             <div className="bg-slate-200 h-24 rounded-xl w-full"></div>
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-1 gap-4 pb-2">
            
            {/* 1. Core Characteristics */}
            {renderCard(
              "核心特征与行为模式", 
              analysis.coreCharacteristics, 
              <Fingerprint size={16} />, 
              "indigo"
            )}

            {/* 2. Mental Health */}
            {renderCard(
              "心理健康情况评估", 
              analysis.mentalHealthAssessment, 
              <HeartPulse size={16} />, 
              "rose"
            )}

            {/* 3. Development Potential */}
            {renderCard(
              "发展潜力评估", 
              analysis.developmentPotential, 
              <Sprout size={16} />, 
              "emerald"
            )}

            {/* 4. Support Strategies */}
            {renderCard(
              "支持策略与危机预警", 
              analysis.supportStrategies, 
              <ShieldAlert size={16} />, 
              "amber"
            )}

          </div>
        ) : (
            <div className="text-center text-slate-400 py-10">暂无标签数据</div>
        )}
      </div>
    </div>
  );
};

export default InsightPanel;