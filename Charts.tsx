
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, AIInsights, AppTheme } from '../types';

interface ChartsProps {
  transactions: Transaction[];
  insights: AIInsights | null;
  theme: AppTheme;
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const net = income - expense;

    return (
      <div className="theme-card p-5 rounded-[1.5rem] shadow-2xl border animate-in fade-in zoom-in duration-200 min-w-[200px]">
        <p className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-4">{label}</p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                <span className="text-xs font-bold theme-text opacity-80">{entry.name}</span>
              </div>
              <span className={`text-xs font-black ${entry.dataKey === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                ₹{entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          
          <div className="pt-3 mt-3 border-t border-slate-500 border-opacity-10 flex items-center justify-between gap-4">
            <span className="text-[10px] font-black theme-text-muted uppercase tracking-wider">Net Position</span>
            <span className={`text-xs font-black ${net >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
              {net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="theme-card p-4 rounded-2xl shadow-2xl border min-w-[150px]">
        <p className="text-[10px] font-black theme-text-muted uppercase tracking-[0.15em] mb-1">{data.category}</p>
        <p className="text-lg font-black theme-text">₹{data.amount.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const Charts: React.FC<ChartsProps> = ({ transactions, insights, theme }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const chartData = useMemo(() => {
    const monthlyMap: Record<string, { month: string, income: number, expense: number }> = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: `${monthName} ${year}`, income: 0, expense: 0 };
      }
      if (t.type === 'credit') monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    });
    return Object.entries(monthlyMap)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([_, value]) => value);
  }, [transactions]);

  const tickColor = theme === 'white' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'white' ? '#f1f5f9' : '#2e2e2e';

  const CommonElements = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
      <XAxis 
        dataKey="month" 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }} 
        dy={15}
      />
      <YAxis 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
        tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
      />
      <Tooltip 
        content={<CustomTooltip />}
        cursor={chartType === 'bar' ? { fill: theme === 'white' ? '#f8fafc' : '#333', radius: 12 } : { stroke: '#6366f1', strokeWidth: 1 }}
      />
      <Legend 
        verticalAlign="top" 
        align="right" 
        iconType="circle" 
        wrapperStyle={{ 
          paddingBottom: '30px', 
          fontSize: '10px', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em',
          color: tickColor
        }}
      />
    </>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="theme-text text-2xl font-black tracking-tight">
            {chartType === 'pie' ? 'Expense Segmentation' : 'Flow Velocity'}
          </h3>
          <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            {chartType === 'pie' ? 'AI-Categorized Distribution' : '6-Month Comparative Matrix'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-500 bg-opacity-10 rounded-xl">
            {(['bar', 'line', 'pie'] as const).map((type) => (
              <button 
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${chartType === type ? 'bg-white text-indigo-600 shadow-sm' : 'theme-text-muted hover:theme-text'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            insights?.categorizedExpenses && insights.categorizedExpenses.length > 0 ? (
              <PieChart>
                <Pie
                  data={insights.categorizedExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="category"
                  stroke="none"
                >
                  {insights.categorizedExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold theme-text opacity-70">{value}</span>}
                />
              </PieChart>
            ) : (
              <div className="h-full flex flex-col items-center justify-center theme-text-muted opacity-30">
                 <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                 <p className="text-sm font-bold uppercase tracking-widest italic">AI Categorization Pending</p>
              </div>
            )
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
              <CommonElements />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CommonElements />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
