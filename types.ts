
export type TransactionType = 'credit' | 'debit';
export type AppTheme = 'white' | 'dark-grey' | 'dark-blue';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  userId: string;
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface RiskFactor {
  name: string;
  impact: 'positive' | 'negative';
  weight: number; // 1-5
  description: string;
}

export interface RiskClassifiedSpend {
  item: string;
  amount: number;
  level: RiskLevel;
  reason: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CategorizedExpense {
  category: string;
  amount: number;
  [key: string]: string | number | undefined;
}

export interface BudgetGoal {
  totalMonthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface AIInsights {
  summary: string;
  risks: string[];
  healthInsight: string;
  riskLevel: RiskLevel;
  riskScore: number; // Score out of 100
  riskFactors?: RiskFactor[];
  reasoning: string;
  sources?: GroundingSource[];
  categorizedExpenses?: CategorizedExpense[];
  riskClassifiedSpends?: RiskClassifiedSpend[];
}

export interface User {
  id: string;
  email: string;
}

export interface AppState {
  user: User | null;
  transactions: Transaction[];
  insights: AIInsights | null;
  isLoading: boolean;
  budgetGoal: BudgetGoal;
  theme: AppTheme;
}
