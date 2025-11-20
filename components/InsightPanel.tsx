import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, RefreshCw, Target, FileText, Microscope } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50/50 to-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
            <Brain size={18} />
          </div>
          <h2 className="font-bold text-slate-800">AI 深度归因分析</h2>
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
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
             <div className="animate-pulse bg-slate-100 w-full h-20 rounded-xl"></div>
             <div className="animate-pulse bg-slate-100 w-3/4 h-6 rounded-xl"></div>
             <div className="animate-pulse bg-slate-100 w-full h-32 rounded-xl"></div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            
            {/* Deep Root Cause */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Microscope size={16} className="text-indigo-600"/>
                <h3 className="text-sm font-bold text-slate-700">深层原因推测</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    analysis.primaryFactor === 'academic' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    analysis.primaryFactor === 'family' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                    {analysis.primaryFactor === 'academic' ? '学业因素' : 
                     analysis.primaryFactor === 'family' ? '家庭因素' : 
                     analysis.primaryFactor === 'social' ? '社交因素' : '待排查'}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {analysis.rootCauseAnalysis}
              </p>
            </div>

            {/* Trajectory Insight */}
            {analysis.trajectoryInsight && (
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                    <AlertTriangle size={16} />
                    轨迹异常洞察 (Missing Analysis)
                </h3>
                <p className="text-rose-900/80 text-sm">
                    {analysis.trajectoryInsight}
                </p>
                </div>
            )}

            {/* Interventions & Feedback Loop */}
            <div>
              <h3 className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
                <Target size={16} className="text-emerald-600"/>
                干预与反馈迭代
              </h3>
              
              {/* Questionnaire Recommendation */}
              <div className="mb-3 flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800">
                <FileText size={18} className="flex-shrink-0"/>
                <div>
                    <div className="text-xs text-indigo-600/70 uppercase font-semibold">推荐测评工具</div>
                    <div className="text-sm font-bold">{analysis.questionnaireType}</div>
                </div>
              </div>

              <div className="space-y-2">
                {analysis.suggestedIntervention?.length > 0 ? (
                  analysis.suggestedIntervention.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic pl-2">暂无建议。</div>
                )}
              </div>
            </div>
          </div>
        ) : (
            <div className="text-center text-slate-400 py-10">分析服务暂时不可用</div>
        )}
      </div>
    </div>
  );
};

export default InsightPanel;