
export enum RiskLevel {
  LOW = '低风险',
  MODERATE = '关注',
  HIGH = '预警',
  CRITICAL = '高危干预'
}

export type EmotionType = 'neutral' | 'happy' | 'stress' | 'agitation' | 'depressed';

// 每日情绪监测数据
export interface DailyEmotionMetrics {
  date: string;
  compositeScore: number; // 0-100 综合风险指数 (越高风险越大)
  baselineScore: number;  // 基线 (由10次有效识别生成)
  
  // 四大核心指标 (0-100, 越高越严重)
  details: {
    stress: number;       // 压力
    aggression: number;   // 攻击性
    negative: number;     // 负面情绪
    instability: number;  // 情绪波动
  };
  
  isAlert: boolean;       // 是否触发预警
  alertReason?: string[]; // 触发预警的具体原因 (如: ["压力指数突增", "攻击性倾向"])
}

// 时空轨迹节点
export interface TrajectoryNode {
  id: string;
  time: string;
  zone: string;           // 区域名称
  coordinate?: { x: number, y: number }; // 虚拟坐标 (0-100)
  status: 'normal' | 'missing' | 'loitering' | 'deviation'; // 状态
  duration: string;
  emotion: EmotionType;   // 当时的主要情绪
  frequency: number;      // 该区域的历史访问频率 (0.0 - 1.0)，用于热力图颜色深浅
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  grade: string; // 年级
  class: string; // 班级
  avatarUrl: string;
  riskLevel: RiskLevel;
  
  // 统计概览
  stats: {
    validRecognitions: number; // 有效识别次数 (用于生成基线)
    abnormalDays: number;      // 异常天数
    missingCount: number;      // 轨迹缺失次数
  };
  
  tags: string[];
}

export interface AIAnalysisResult {
  // 0. 总体评价 (新增)
  overallEvaluation: string;
  // 1. 核心特征与行为模式
  coreCharacteristics: string;
  // 2. 心理健康情况评估
  mentalHealthAssessment: string;
  // 3. 发展潜力评估
  developmentPotential: string;
  // 4. 支持策略与危机预警应对
  supportStrategies: string;
}