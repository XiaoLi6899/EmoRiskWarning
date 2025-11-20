import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Bell, 
  Search, 
  ChevronRight,
  Activity,
  User,
  AlertOctagon,
  Zap
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import MoodTrendChart from './components/MoodTrendChart';
import InsightPanel from './components/InsightPanel';
import TrajectoryMap from './components/TrajectoryMap';
import { MOCK_STUDENT, MOCK_HISTORY, MOCK_TRAJECTORY } from './constants';

const App: React.FC = () => {
  // Get the latest data point for metric cards
  const latestMetrics = MOCK_HISTORY[MOCK_HISTORY.length - 1].details;
  const previousMetrics = MOCK_HISTORY[MOCK_HISTORY.length - 2].details;
  
  const getTrend = (curr: number, prev: number) => curr > prev ? 'up' : curr < prev ? 'down' : 'neutral';

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-800 block leading-none">一生一档</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">校园心理监测</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="总控台" />
          <NavItem icon={<Users size={20}/>} label="学生档案管理" active />
          <NavItem icon={<Calendar size={20}/>} label="干预排期" />
          <NavItem icon={<Settings size={20}/>} label="系统设置" />
        </nav>

        <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              张
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">张老师</p>
              <p className="text-xs text-slate-500">心理咨询中心</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-slate-500">
             <span>学生管理</span>
             <ChevronRight size={14} className="mx-2" />
             <span>{MOCK_STUDENT.grade}</span>
             <ChevronRight size={14} className="mx-2" />
             <span className="text-slate-900 font-medium">{MOCK_STUDENT.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="输入姓名或学号..." 
                className="pl-10 pr-4 py-2 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm transition-all"
              />
            </div>
            <button className="relative p-2 hover:bg-slate-50 rounded-full text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          
          {/* Student Header Profile */}
          <section className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex gap-5">
              <div className="relative">
                <img 
                  src={MOCK_STUDENT.avatarUrl} 
                  alt={MOCK_STUDENT.name} 
                  className="w-24 h-24 rounded-2xl object-cover shadow-md border-4 border-white bg-slate-100"
                />
                <div className="absolute -bottom-2 -right-2 bg-white px-2 py-0.5 rounded-full text-xs font-bold border shadow-sm">
                    ID: {MOCK_STUDENT.id}
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">{MOCK_STUDENT.name}</h1>
                <div className="flex items-center gap-3 text-slate-500 text-sm mb-3">
                  <span>{MOCK_STUDENT.grade}</span>
                  <span className="text-slate-300">•</span>
                  <span>{MOCK_STUDENT.class}</span>
                  <span className="text-slate-300">•</span>
                  <span>有效识别样本: {MOCK_STUDENT.stats.validRecognitions}</span>
                </div>
                <div className="flex gap-2">
                  {MOCK_STUDENT.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">当前预警状态</p>
                    <div className={`flex items-center justify-end gap-2 text-xl font-bold ${
                        MOCK_STUDENT.riskLevel === '预警' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                        {MOCK_STUDENT.riskLevel === '预警' && <AlertOctagon size={24}/>}
                        {MOCK_STUDENT.riskLevel}
                    </div>
                </div>
                {/* Mini Stat */}
                <div className="hidden lg:block h-12 w-px bg-slate-200"></div>
                <div className="hidden lg:block text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">轨迹异常天数</p>
                    <p className="text-xl font-bold text-slate-700">{MOCK_STUDENT.stats.abnormalDays} <span className="text-xs font-normal text-slate-400">/ 本月</span></p>
                </div>
            </div>
          </section>

          {/* Metrics Grid (4 Core Metrics) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard 
              title="压力指数 (Stress)" 
              value={latestMetrics.stress} 
              icon={<Activity size={20}/>} 
              trend={getTrend(latestMetrics.stress, previousMetrics.stress)}
              color="indigo"
              suffix=""
            />
            <MetricCard 
              title="攻击性倾向 (Aggression)" 
              value={latestMetrics.aggression} 
              icon={<Zap size={20}/>} 
              trend={getTrend(latestMetrics.aggression, previousMetrics.aggression)}
              color="red"
              suffix=""
            />
            <MetricCard 
              title="负面情绪 (Negative)" 
              value={latestMetrics.negative} 
              icon={<AlertOctagon size={20}/>} 
              trend={getTrend(latestMetrics.negative, previousMetrics.negative)}
              color="blue"
              suffix=""
            />
             <MetricCard 
              title="情绪波动 (Instability)" 
              value={latestMetrics.instability} 
              icon={<User size={20}/>} 
              trend={getTrend(latestMetrics.instability, previousMetrics.instability)}
              color="amber"
              suffix=""
            />
          </section>

          {/* Main Analytics Grid - Updated Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Visual Data (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top: Mood Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">综合心理预警监测</h2>
                    <p className="text-xs text-slate-400 mt-1">基于面部识别数据的综合风险指数 (点击节点查看归因)</p>
                  </div>
                  <div className="flex gap-2">
                     <div className="flex items-center text-xs text-slate-500">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div> 预警触发
                     </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                   <MoodTrendChart data={MOCK_HISTORY} />
                </div>
              </div>

              {/* Bottom: Virtual Trajectory Map */}
              <div className="h-[400px]">
                <TrajectoryMap data={MOCK_TRAJECTORY} />
              </div>

            </div>

            {/* RIGHT COLUMN: AI Insight (4 cols) */}
            <div className="lg:col-span-4 flex flex-col h-[824px]"> 
              {/* Height matches 400 (chart) + 400 (map) + 24 (gap) */}
              <InsightPanel student={MOCK_STUDENT} history={MOCK_HISTORY} trajectory={MOCK_TRAJECTORY} />
            </div>

          </section>
        </div>

      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
    active 
      ? 'bg-indigo-50 text-indigo-700 font-medium' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
  }`}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
)

export default App;