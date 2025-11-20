import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'red' | 'green' | 'amber' | 'indigo';
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  suffix = '', 
  trend, 
  color = 'blue', 
  icon,
  isActive = false,
  onClick
}) => {
  
  const getColorClass = () => {
    switch (color) {
      case 'red': return 'text-red-600 bg-red-50 border-red-100';
      case 'green': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-200 cursor-pointer relative overflow-hidden
        ${isActive 
          ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md transform scale-[1.02]' 
          : 'border-slate-100 hover:shadow-md hover:-translate-y-1'
        }`}
    >
      {isActive && (
        <div className={`absolute top-0 left-0 w-1 h-full ${
           color === 'red' ? 'bg-red-500' : 
           color === 'green' ? 'bg-emerald-500' : 
           color === 'amber' ? 'bg-amber-500' : 
           color === 'indigo' ? 'bg-indigo-500' : 'bg-blue-500'
        }`}></div>
      )}
      
      <div className="flex justify-between items-start mb-3 pl-2">
        <div className={`p-2 rounded-xl ${getColorClass()}`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 
            trend === 'down' ? 'text-rose-700 bg-rose-100' : 'text-slate-600 bg-slate-100'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} className="mr-1"/> : 
             trend === 'down' ? <TrendingDown size={12} className="mr-1"/> : <Minus size={12} className="mr-1"/>}
            {trend === 'up' ? '+2.4%' : trend === 'down' ? '-5.1%' : '0%'}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2">{title}</h3>
      <div className="text-2xl font-bold text-slate-800 pl-2">
        {value}{suffix}
      </div>
    </div>
  );
};

export default MetricCard;