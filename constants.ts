import { StudentProfile, RiskLevel, DailyEmotionMetrics, TrajectoryNode } from "./types";

export const MOCK_STUDENT: StudentProfile = {
  id: "20220831",
  name: "陈子轩",
  age: 16,
  grade: "高二年级",
  class: "3班",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  riskLevel: RiskLevel.HIGH,
  stats: {
    validRecognitions: 142, // 远超10次基线要求
    abnormalDays: 4,
    missingCount: 3
  },
  tags: ["学业压力", "考前焦虑", "轨迹异常"]
};

// 过去14天的数据
export const MOCK_HISTORY: DailyEmotionMetrics[] = [
  { 
    date: "10-01", compositeScore: 20, baselineScore: 25, 
    details: { stress: 20, aggression: 10, negative: 15, instability: 10 },
    isAlert: false 
  },
  { 
    date: "10-02", compositeScore: 22, baselineScore: 25, 
    details: { stress: 25, aggression: 10, negative: 15, instability: 12 },
    isAlert: false 
  },
  { 
    date: "10-03", compositeScore: 45, baselineScore: 26, 
    details: { stress: 55, aggression: 15, negative: 40, instability: 30 },
    isAlert: false 
  },
  { 
    date: "10-04", compositeScore: 30, baselineScore: 25, 
    details: { stress: 35, aggression: 10, negative: 20, instability: 20 },
    isAlert: false 
  },
  { 
    date: "10-05", compositeScore: 25, baselineScore: 25, 
    details: { stress: 25, aggression: 10, negative: 20, instability: 15 },
    isAlert: false 
  },
  { 
    date: "10-06", compositeScore: 65, baselineScore: 26, 
    details: { stress: 70, aggression: 20, negative: 60, instability: 50 },
    isAlert: true, alertReason: ["压力过载", "负面情绪激增"] 
  },
  { 
    date: "10-07", compositeScore: 72, baselineScore: 26, 
    details: { stress: 80, aggression: 25, negative: 65, instability: 60 },
    isAlert: true, alertReason: ["持续高压", "情绪波动剧烈"] 
  },
  { 
    date: "10-08", compositeScore: 50, baselineScore: 27, 
    details: { stress: 55, aggression: 15, negative: 45, instability: 40 },
    isAlert: false 
  },
  { 
    date: "10-09", compositeScore: 85, baselineScore: 27, 
    details: { stress: 88, aggression: 30, negative: 80, instability: 75 },
    isAlert: true, alertReason: ["压力极高", "严重负面情绪"] 
  },
  { 
    date: "10-10", compositeScore: 88, baselineScore: 28, 
    details: { stress: 90, aggression: 35, negative: 82, instability: 80 },
    isAlert: true, alertReason: ["多项指标异常", "攻击性上升"] 
  },
  { 
    date: "10-11", compositeScore: 40, baselineScore: 28, 
    details: { stress: 45, aggression: 15, negative: 35, instability: 30 },
    isAlert: false 
  },
  { 
    date: "10-12", compositeScore: 35, baselineScore: 28, 
    details: { stress: 40, aggression: 12, negative: 30, instability: 25 },
    isAlert: false 
  },
  { 
    date: "10-13", compositeScore: 75, baselineScore: 29, 
    details: { stress: 80, aggression: 20, negative: 70, instability: 65 },
    isAlert: true, alertReason: ["情绪波动", "负面情绪"] 
  },
  { 
    date: "10-14", compositeScore: 82, baselineScore: 29, 
    details: { stress: 85, aggression: 40, negative: 75, instability: 70 },
    isAlert: true, alertReason: ["综合预警触发", "压力关键值突破"] 
  },
];

// 预测的常规路线 (Standard Routine)
export const MOCK_PREDICTED_PATH = [
  "宿舍楼B栋", "第二食堂", "高二教学楼", "第一食堂", "宿舍楼B栋"
];

// 典型一日轨迹 (包含缺失异常 + 情绪状态 + 历史访问频率)
export const MOCK_TRAJECTORY: TrajectoryNode[] = [
  { id: "t1", time: "07:15", zone: "宿舍楼B栋", status: "normal", duration: "30min", emotion: "neutral", frequency: 0.95 },
  { id: "t2", time: "07:50", zone: "第二食堂", status: "normal", duration: "20min", emotion: "happy", frequency: 0.85 },
  { id: "t3", time: "08:15", zone: "高二教学楼", status: "normal", duration: "3h 30min", emotion: "stress", frequency: 0.98 },
  // 异常点：应该去食堂或回宿舍，但消失了
  { id: "t4", time: "11:50", zone: "未知区域 (缺失)", status: "missing", duration: "45min", emotion: "neutral", frequency: 0.0 }, 
  // 异常点：路线偏离，去了图书馆而不是休息
  { id: "t5", time: "12:40", zone: "图书馆", status: "deviation", duration: "1h", emotion: "stress", frequency: 0.2 }, 
  { id: "t6", time: "14:00", zone: "高二教学楼", status: "normal", duration: "3h", emotion: "agitation", frequency: 0.98 },
  // 异常点：放学滞留
  { id: "t7", time: "17:10", zone: "操场角落", status: "loitering", duration: "1h 20min", emotion: "depressed", frequency: 0.1 }, 
  { id: "t8", time: "18:40", zone: "第一食堂", status: "normal", duration: "30min", emotion: "neutral", frequency: 0.80 },
  { id: "t9", time: "19:20", zone: "宿舍楼B栋", status: "normal", duration: "至今", emotion: "neutral", frequency: 0.95 },
];