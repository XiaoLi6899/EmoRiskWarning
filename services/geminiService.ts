import { GoogleGenAI, Type } from "@google/genai";
import { DailyEmotionMetrics, StudentProfile, AIAnalysisResult, TrajectoryNode } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStudentReport = async (
  student: StudentProfile, 
  moodHistory: DailyEmotionMetrics[],
  trajectory: TrajectoryNode[]
): Promise<AIAnalysisResult> => {
  
  // Mock fallback data
  if (!apiKey) {
    return {
      rootCauseAnalysis: "模拟分析：学生在午餐时段的轨迹缺失（Missing）结合近期高频的压力（Stress）预警，推测可能存在人际回避行为。攻击性指标较低，主要表现为内化焦虑。",
      primaryFactor: "academic",
      trajectoryInsight: "11:50午餐时间轨迹缺失，且未回宿舍午休，可能在躲避人群或独自复习。",
      suggestedIntervention: ["关注午休时段去向", "开展考前减压辅导", "与家长确认近期家庭氛围"],
      questionnaireType: "MSSMHS (中学生心理健康量表) + 学业压力专项评估"
    };
  }

  const prompt = `
    你是一位中国学校的资深心理咨询专家。请根据“一生一档”系统中的监控数据，为这位学生生成一份深层次原因分析报告。
    
    【学生档案】: ${JSON.stringify(student)}
    【近期情绪预警数据】: ${JSON.stringify(moodHistory.slice(-5))}
    (注：metrics包含 stress/压力, aggression/攻击, negative/负面, instability/波动。分数越高越严重。)
    【典型一日时空轨迹】: ${JSON.stringify(trajectory)}
    (注：请重点关注 status 为 'missing' (消失/缺失) 或 'loitering' (滞留) 的异常点。)

    请分析以下内容：
    1. 结合情绪指标突增的时间点和轨迹异常（如午餐时间消失），推测深层次原因（是学业压力大导致躲起来复习？还是人际关系导致躲避？还是家庭原因？）。
    2. 给出具体的干预建议。
    
    请返回严格的JSON格式：
    {
      "rootCauseAnalysis": "一段详细的深层原因推测 (中文)",
      "primaryFactor": "academic" | "family" | "social" | "unknown",
      "trajectoryInsight": "对轨迹异常行为的解读",
      "suggestedIntervention": ["建议1", "建议2", "建议3"],
      "questionnaireType": "推荐使用的心理问卷名称"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCauseAnalysis: { type: Type.STRING },
            primaryFactor: { type: Type.STRING, enum: ["academic", "family", "social", "unknown"] },
            trajectoryInsight: { type: Type.STRING },
            suggestedIntervention: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionnaireType: { type: Type.STRING }
          },
          required: ["rootCauseAnalysis", "primaryFactor", "trajectoryInsight", "suggestedIntervention", "questionnaireType"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      rootCauseAnalysis: result.rootCauseAnalysis || "无法生成深度分析。",
      primaryFactor: result.primaryFactor || "unknown",
      trajectoryInsight: result.trajectoryInsight || "轨迹数据分析中...",
      suggestedIntervention: Array.isArray(result.suggestedIntervention) ? result.suggestedIntervention : [],
      questionnaireType: result.questionnaireType || "通用心理健康筛查"
    };

  } catch (error) {
    console.error("GenAI Error:", error);
    return {
      rootCauseAnalysis: "暂时无法连接AI分析服务，请参考原始数据指标。",
      primaryFactor: "unknown",
      trajectoryInsight: "系统繁忙",
      suggestedIntervention: [],
      questionnaireType: "待定"
    };
  }
};