
import React, { useState } from 'react';
import { Transaction } from '../types.ts';

interface TransactionTableProps {
  transactions: Transaction[];
  flaggedDescriptions?: string[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, flaggedDescriptions = [] }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const closeModal = () => setSelectedTransaction(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-1">
        <thead>
          <tr className="border-b border-slate-500 border-opacity-10">
            <th className="pb-4 text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] px-3">Date</th>
            <th className="pb-4 text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] px-3">Transaction</th>
            <th className="pb-4 text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] px-3 text-right">Magnitude</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => {
            const isFlagged = flaggedDescriptions.some(desc => 
              t.description.toLowerCase().includes(desc.toLowerCase()) || 
              desc.toLowerCase().includes(t.description.toLowerCase())
            );

            return (
              <tr 
                key={t.id} 
                onClick={() => setSelectedTransaction(t)}
                className={`group cursor-pointer hover:bg-slate-500 hover:bg-opacity-5 transition-all animate-row ${isFlagged ? 'bg-rose-500 bg-opacity-[0.03]' : ''}`}
                style={{ animationDelay: `${Math.min(index * 0.03, 1.5)}s` }}
              >
                <td className="py-5 text-[11px] theme-text-muted px-3 font-bold opacity-60 rounded-l-2xl">
                  {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </td>
                <td className="py-5 text-sm theme-text px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight">{t.description}</span>
                    {isFlagged && (
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="High Risk Pattern Detected"></span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${t.type === 'credit' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {t.type}
                  </span>
                </td>
                <td className={`py-5 text-sm font-black text-right px-3 rounded-r-2xl ${t.type === 'credit' ? 'text-emerald-500' : 'theme-text'}`}>
                  {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900 bg-opacity-40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="theme-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white border-opacity-10 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className={`p-8 ${selectedTransaction.type === 'credit' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Transaction Audit</span>
                  <h3 className="text-2xl font-black tracking-tight mt-1">{selectedTransaction.description}</h3>
                </div>
                <button onClick={closeModal} className="hover:rotate-90 transition-transform p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="theme-text-muted text-[10px] font-black uppercase tracking-wider mb-1">Magnitude</p>
                  <p className={`text-2xl font-black ${selectedTransaction.type === 'credit' ? 'text-emerald-500' : 'theme-text'}`}>
                    {selectedTransaction.type === 'debit' ? '-' : '+'}₹{selectedTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="theme-text-muted text-[10px] font-black uppercase tracking-wider mb-1">Entry Date</p>
                  <p className="text-xl font-bold theme-text">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-500 border-opacity-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedTransaction.type === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'} bg-opacity-10`}>
                    <svg className={`w-6 h-6 ${selectedTransaction.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedTransaction.type === 'credit' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="theme-text-muted text-[10px] font-black uppercase tracking-wider">Classification</p>
                    <p className="text-sm font-black theme-text uppercase tracking-widest">{selectedTransaction.type === 'credit' ? 'Income Inflow' : 'Operating Outflow'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-500 bg-opacity-5 rounded-2xl p-4">
                <p className="theme-text-muted text-[10px] font-black uppercase tracking-wider mb-2">Internal Metadata</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold theme-text opacity-60">
                  <div className="flex flex-col">
                    <span>Audit ID</span>
                    <span className="font-mono">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>Account Ref</span>
                    <span className="font-mono">****-****-0912</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 pt-0">
              <button 
                onClick={closeModal}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
