
import React, { useState, useEffect } from 'react';
import { BudgetGoal, AIInsights } from '../types.ts';

interface BudgetGoalsProps {
  currentGoal: BudgetGoal;
  totalSpent: number;
  onUpdateGoal: (goal: BudgetGoal) => void;
  insights: AIInsights | null;
}

const BudgetGoals: React.FC<BudgetGoalsProps> = ({ currentGoal, totalSpent, onUpdateGoal, insights }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(currentGoal.totalMonthlyLimit.toString());
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

  // Sync internal state with current goal when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const limits: Record<string, string> = {};
      Object.entries(currentGoal.categoryLimits || {}).forEach(([cat, val]) => {
        limits[cat] = val.toString();
      });
      setCategoryLimits(limits);
      setNewLimit(currentGoal.totalMonthlyLimit.toString());
    }
  }, [isEditing, currentGoal]);

  const progress = Math.min((totalSpent / currentGoal.totalMonthlyLimit) * 100, 100);
  const isOver = totalSpent > currentGoal.totalMonthlyLimit;

  const handleSave = () => {
    const limit = parseFloat(newLimit);
    if (!isNaN(limit) && limit > 0) {
      const parsedCategoryLimits: Record<string, number> = {};
      Object.entries(categoryLimits).forEach(([cat, val]) => {
        const numVal = parseFloat(val);
        if (!isNaN(numVal) && numVal > 0) {
          parsedCategoryLimits[cat] = numVal;
        }
      });

      onUpdateGoal({ 
        totalMonthlyLimit: limit, 
        categoryLimits: parsedCategoryLimits 
      });
      setIsEditing(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategoryLimits(prev => ({
        ...prev,
        [newCategoryName.trim()]: '0'
      }));
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategoryLimits(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const detectedCategories = insights?.categorizedExpenses?.map(c => c.category) || [];
  const allEditableCategories = Array.from(new Set([...detectedCategories, ...Object.keys(categoryLimits)]));

  return (
    <div className="theme-card p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-lg group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isOver ? 'bg-rose-500 bg-opacity-10 text-rose-500' : 'bg-indigo-500 bg-opacity-10 text-indigo-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <div>
            <h3 className="theme-text text-xl font-black tracking-tight">Financial Thresholds</h3>
            <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Strategic Monthly Budget</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-3 theme-card text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:bg-opacity-10 rounded-2xl transition-all"
        >
          {isEditing ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[60vh] overflow-y-auto px-1">
          <div>
            <label className="theme-text-muted text-[10px] font-black uppercase tracking-wider block mb-3 px-1">Maximum Monthly Outflow (₹)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black theme-text-muted opacity-50">₹</span>
              <input 
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                autoFocus
                className="w-full theme-card border-2 rounded-3xl pl-12 pr-6 py-5 text-2xl font-black theme-text focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="theme-text-muted text-[10px] font-black uppercase tracking-wider block px-1">Category Specific Thresholds</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allEditableCategories.map(cat => (
                <div key={cat} className="p-4 rounded-2xl border-2 theme-card flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black theme-text uppercase truncate pr-6">{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-rose-400 hover:text-rose-600 transition-colors absolute top-4 right-4"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black theme-text opacity-40">₹</span>
                    <input 
                      type="number"
                      value={categoryLimits[cat] || ''}
                      onChange={(e) => setCategoryLimits(prev => ({ ...prev, [cat]: e.target.value }))}
                      className="w-full bg-slate-500 bg-opacity-5 rounded-xl pl-7 pr-3 py-2 text-sm font-black theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Limit"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 p-2 bg-slate-500 bg-opacity-5 rounded-2xl">
              <input 
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-transparent border-none px-4 py-2 text-xs font-bold theme-text focus:ring-0 outline-none"
                placeholder="New Category Name..."
              />
              <button 
                onClick={handleAddCategory}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Deploy New Thresholds
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.15em]">Real-time Outflow</p>
              <h4 className={`text-4xl font-black tracking-tighter ${isOver ? 'text-rose-500' : 'theme-text'}`}>
                ₹{totalSpent.toLocaleString()}
              </h4>
            </div>
            <div className="text-right space-y-1">
              <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.15em]">Assigned Cap</p>
              <p className="text-2xl font-black theme-text-muted opacity-60">₹{currentGoal.totalMonthlyLimit.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative h-5 bg-slate-500 bg-opacity-10 rounded-full overflow-hidden border border-slate-100 p-1">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isOver ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Category Breakdown */}
          {Object.keys(currentGoal.categoryLimits || {}).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-500 border-opacity-10">
              {Object.entries(currentGoal.categoryLimits).map(([cat, limit]) => {
                const spent = insights?.categorizedExpenses?.find(c => c.category === cat)?.amount || 0;
                const catProgress = Math.min((spent / limit) * 100, 100);
                const isCatOver = spent > limit;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black theme-text-muted uppercase tracking-wider truncate max-w-[120px]">{cat}</span>
                      <span className={`text-[10px] font-black ${isCatOver ? 'text-rose-500' : 'theme-text-muted'}`}>
                        ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-500 bg-opacity-5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${isCatOver ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${catProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest ${isOver ? 'text-rose-500' : 'text-indigo-600'}`}>
                {progress.toFixed(1)}% Consumed
              </span>
              <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
              <span className="theme-text-muted text-[10px] font-black uppercase tracking-widest opacity-50">Live Metering</span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isOver ? 'bg-rose-500 bg-opacity-10 text-rose-500' : 'bg-emerald-500 bg-opacity-10 text-emerald-500'}`}>
              {isOver ? 'Deficit Detected' : `₹${(currentGoal.totalMonthlyLimit - totalSpent).toLocaleString()} Available`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetGoals;
