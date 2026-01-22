
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsights, RiskLevel, BudgetGoal } from "../types.ts";

export const generateFinancialInsights = async (transactions: Transaction[], budgetGoal?: BudgetGoal): Promise<AIInsights> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const recentTransactions = transactions.slice(-100);
  
  const serializedData = recentTransactions.map(t => ({
    d: t.date,
    a: t.amount,
    t: t.type,
    desc: t.description.substring(0, 30)
  }));

  const totalSpent = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetContext = budgetGoal 
    ? `The user has set a total monthly budget limit of ₹${budgetGoal.totalMonthlyLimit}. They have already spent ₹${totalSpent}.`
    : "No specific budget limit set.";

  const prompt = `
    Analyze this user's bank transaction data (Currency: INR). 
    ${budgetContext}
    
    TASKS:
    1. CALCULATE A NUMERICAL RISK SCORE (0 to 100):
       - 100: Flawless (High savings, consistent income, no budget breaches).
       - 0: Dangerous (Severe overspending, negative cash flow, high volatility).
    2. IDENTIFY 3-5 SPECIFIC RISK FACTORS:
       - Factors that contributed positively (e.g., "Stable Income Stream") or negatively (e.g., "Subscription Proliferation").
    3. Categorize spendings and identify "High Risk" individual behaviors.
    4. Provide a high-level "Health Directive" for the user.

    Data: ${JSON.stringify(serializedData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthInsight: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            riskScore: { type: Type.NUMBER },
            riskFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ['positive', 'negative'] },
                  weight: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["name", "impact", "weight", "description"]
              }
            },
            reasoning: { type: Type.STRING },
            categorizedExpenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER }
                },
                required: ["category", "amount"]
              }
            },
            riskClassifiedSpends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  level: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  reason: { type: Type.STRING }
                },
                required: ["item", "amount", "level", "reason"]
              }
            }
          },
          required: ["summary", "risks", "healthInsight", "riskLevel", "riskScore", "riskFactors", "reasoning", "categorizedExpenses", "riskClassifiedSpends"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as AIInsights;
  } catch (error: any) {
    console.error("Gemini Analysis error:", error);
    return {
      summary: "Analysis cycle interrupted.",
      risks: ["System connectivity disruption."],
      healthInsight: "Recalibrating diagnostic sensors.",
      riskLevel: RiskLevel.MEDIUM,
      riskScore: 50,
      riskFactors: [
        { name: "Connectivity Issue", impact: "negative", weight: 3, description: "AI engine failed to connect to live data streams." }
      ],
      reasoning: "Analysis cycle interrupted by network timeout.",
      categorizedExpenses: [],
      riskClassifiedSpends: []
    };
  }
};
