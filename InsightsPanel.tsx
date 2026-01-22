
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AIInsights, RiskLevel, RiskFactor } from '../types';

interface InsightsPanelProps {
  insights: AIInsights | null;
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  if (!insights) {
    return (
      <div className="theme-card p-10 rounded-[2.5rem] border shadow-sm h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-500 bg-opacity-10 rounded-3xl flex items-center justify-center mb-6 text-indigo-500 shadow-inner">
          <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h4 className="text-xl font-bold theme-text">Intelligence Pending</h4>
        <p className="theme-text-muted mt-2 max-w-[240px] font-medium leading-relaxed">
          The Risk Radar requires transaction data to start the diagnostic scan.
        </p>
      </div>
    );
  }

  const scoreColor = insights.riskScore >= 75 ? 'text-emerald-500' : insights.riskScore >= 45 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = insights.riskScore >= 75 ? 'bg-emerald-500' : insights.riskScore >= 45 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-700">
      {/* Risk Score Diagnostic */}
      <div className="theme-card p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-indigo-500 bg-opacity-5 rounded-full blur-3xl animate-pulse"></div>
            <svg className="w-40 h-40 transform -rotate-90 relative z-10">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-100 opacity-10" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={439.8}
                strokeDashoffset={439.8 - (439.8 * insights.riskScore) / 100}
                className={`${scoreColor} transition-all duration-[1.5s] ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className={`text-4xl font-black ${scoreColor} tracking-tighter`}>{insights.riskScore}</span>
              <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] opacity-60">Health Index</span>
            </div>
          </div>
          <h3 className="theme-text text-xl font-black tracking-tight mb-1">Financial Stability Matrix</h3>
          <p className="theme-text-muted text-xs font-bold leading-relaxed opacity-70 italic px-4">
             AI score based on volatility, budget adherence, and savings velocity.
          </p>
        </div>
      </div>

      {/* Risk Vectors */}
      {insights.riskFactors && insights.riskFactors.length > 0 && (
        <div className="theme-card p-8 rounded-[2.5rem] border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            <h4 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Risk Vectors</h4>
          </div>
          <div className="space-y-3">
            {insights.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-500 bg-opacity-5 border border-slate-500 border-opacity-5 transition-all hover:bg-opacity-10">
                <div className={`mt-1 p-1.5 rounded-lg ${factor.impact === 'positive' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {factor.impact === 'positive' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h5 className="text-xs font-black theme-text uppercase tracking-tight">{factor.name}</h5>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${i < factor.weight ? (factor.impact === 'positive' ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold theme-text-muted leading-relaxed opacity-80">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Risk Items */}
      {insights.riskClassifiedSpends && insights.riskClassifiedSpends.length > 0 && (
        <div className="theme-card p-8 rounded-[2.5rem] border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
            <h4 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Flagged Activity</h4>
          </div>
          <div className="space-y-4">
            {insights.riskClassifiedSpends.filter(s => s.level === RiskLevel.HIGH).map((spend, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-rose-500 border-opacity-20 bg-rose-500 bg-opacity-5">
                <div>
                   <h5 className="text-sm font-black text-rose-600 tracking-tight">{spend.item}</h5>
                   <p className="text-[10px] font-bold text-rose-400 italic mt-0.5">{spend.reason}</p>
                </div>
                <span className="text-sm font-black text-rose-600">₹{spend.amount.toLocaleString()}</span>
              </div>
            ))}
            {insights.riskClassifiedSpends.filter(s => s.level === RiskLevel.HIGH).length === 0 && (
              <p className="text-xs font-bold theme-text-muted text-center italic py-4 opacity-50">No high-risk transactions detected.</p>
            )}
          </div>
        </div>
      )}

      {/* Actionable Health Directive */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4 block">AI Health Directive</span>
          <p className="text-lg font-bold leading-relaxed italic">"{insights.healthInsight}"</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
