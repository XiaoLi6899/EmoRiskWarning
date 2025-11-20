import { GoogleGenAI, Type } from "@google/genai";
import { DailyEmotionMetrics, StudentProfile, AIAnalysisResult, TrajectoryNode } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStudentReport = async (
  student: StudentProfile, 
  moodHistory: DailyEmotionMetrics[],
  trajectory: TrajectoryNode[]
): Promise<AIAnalysisResult> => {
  
  // Mock fallback data using KEYWORDS only as requested
  if (!apiKey) {
    return {
      overallEvaluation: "高风险预警状态。主要表现为持续高压与习得性无助，伴随多次轨迹缺失与滞留异常，建议立即启动心理干预。",
      coreCharacteristics: "焦虑-回避型依恋 | 习得性无助 | 低成就动机 | 自我封闭 | 易受暗示 | 敏感多疑",
      mentalHealthAssessment: "高风险预警状态 | 负面情绪主导 | 严重缺乏安全感 | 睡眠障碍风险 | 社交退缩 | 敌意归因",
      developmentPotential: "场独立性认知 | 逻辑思维潜质 | 敏锐观察力 | 深度独处能力 | 艺术感知潜力",
      supportStrategies: "全天候无感守护 | 建立安全基地 | 替代性宣泄 | 避免公开批评 | 增加可控感任务 | 同伴支持介入"
    };
  }

  const prompt = `
    你是一位中国学校的资深心理咨询专家。请根据“一生一档”系统中的监控数据，为这位学生生成一份【极简心理画像标签】。
    
    【学生档案】: ${JSON.stringify(student)}
    【近期情绪数据】: ${JSON.stringify(moodHistory.slice(-5))}
    【时空轨迹】: ${JSON.stringify(trajectory)}

    请严格按照以下五个维度返回JSON数据。
    注意：
    1. "overallEvaluation" 请输出一段简短的总结性整句（50字以内），概括心理、预警及轨迹状况。
    2. 其他四个维度（coreCharacteristics等）请仅输出核心【关键词/短语】，用 " | " 分隔。

    1. **总体评价**: 简短总结。例如：处于高风险预警期，情绪波动剧烈，且存在多次轨迹异常，需重点关注。
    2. **核心特征与行为模式**: 如：安全型依恋 | 手机依赖 | 目标清晰
    3. **心理健康情况评估**: 如：焦虑倾向 | 睡眠良好 | 情绪平稳
    4. **发展潜力评估**: 如：领导力潜质 | 逻辑思维强 | 创新能力
    5. **支持策略与危机预警应对**: 如：定期谈话 | 增加运动 | 关注睡眠

    请返回严格的JSON格式：
    {
      "overallEvaluation": "...",
      "coreCharacteristics": "关键词 | 关键词 | ...",
      "mentalHealthAssessment": "关键词 | 关键词 | ...",
      "developmentPotential": "关键词 | 关键词 | ...",
      "supportStrategies": "关键词 | 关键词 | ..."
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
            overallEvaluation: { type: Type.STRING },
            coreCharacteristics: { type: Type.STRING },
            mentalHealthAssessment: { type: Type.STRING },
            developmentPotential: { type: Type.STRING },
            supportStrategies: { type: Type.STRING }
          },
          required: ["overallEvaluation", "coreCharacteristics", "mentalHealthAssessment", "developmentPotential", "supportStrategies"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      overallEvaluation: result.overallEvaluation || "数据不足",
      coreCharacteristics: result.coreCharacteristics || "数据不足",
      mentalHealthAssessment: result.mentalHealthAssessment || "数据不足",
      developmentPotential: result.developmentPotential || "数据不足",
      supportStrategies: result.supportStrategies || "数据不足"
    };

  } catch (error) {
    console.error("GenAI Error:", error);
    return {
      overallEvaluation: "系统暂时无法连接智能分析服务。",
      coreCharacteristics: "连接超时",
      mentalHealthAssessment: "获取失败",
      developmentPotential: "暂无数据",
      supportStrategies: "请人工评估"
    };
  }
};