
import React, { useState, useEffect } from 'react';
import { User, Transaction, AIInsights, AppState, BudgetGoal, AppTheme } from './types.ts';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';

const STORAGE_KEY_USER = 'fin_risk_radar_user';
const STORAGE_KEY_DATA = 'fin_risk_radar_transactions';
const STORAGE_KEY_BUDGET = 'fin_risk_radar_budget';
const STORAGE_KEY_THEME = 'fin_risk_radar_theme';

const DEFAULT_BUDGET: BudgetGoal = { totalMonthlyLimit: 50000, categoryLimits: {} };

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    transactions: [],
    insights: null,
    isLoading: true,
    budgetGoal: DEFAULT_BUDGET,
    theme: 'white',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const storedData = localStorage.getItem(STORAGE_KEY_DATA);
    const storedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
    const storedTheme = (localStorage.getItem(STORAGE_KEY_THEME) as AppTheme) || 'white';

    document.documentElement.setAttribute('data-theme', storedTheme);

    setState(prev => ({
      ...prev,
      user: storedUser ? JSON.parse(storedUser) : null,
      transactions: storedData ? JSON.parse(storedData) : [],
      budgetGoal: storedBudget ? JSON.parse(storedBudget) : DEFAULT_BUDGET,
      theme: storedTheme,
      isLoading: false,
    }));
  }, []);

  const handleAuth = (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_BUDGET);
    setState(prev => ({
      ...prev,
      user: null,
      transactions: [],
      insights: null,
      isLoading: false,
      budgetGoal: DEFAULT_BUDGET,
    }));
  };

  const updateTransactions = (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(transactions));
    setState(prev => ({ ...prev, transactions }));
  };

  const setInsights = (insights: AIInsights) => {
    setState(prev => ({ ...prev, insights }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setTheme = (theme: AppTheme) => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    setState(prev => ({ ...prev, theme }));
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Initializing Secure Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!state.user ? (
        <Auth onAuth={handleAuth} />
      ) : (
        <Dashboard 
          user={state.user} 
          transactions={state.transactions}
          insights={state.insights}
          theme={state.theme}
          onLogout={handleLogout}
          onUpdateData={updateTransactions}
          onSetInsights={setInsights}
          setLoading={setLoading}
          setTheme={setTheme}
        />
      )}
    </div>
  );
};

export default App;
