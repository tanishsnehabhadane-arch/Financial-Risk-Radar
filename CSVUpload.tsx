
import React, { useRef, useState } from 'react';
import { Transaction, TransactionType, AIInsights, BudgetGoal } from '../types.ts';
import { generateFinancialInsights } from '../services/gemini.ts';

interface CSVUploadProps {
  onDataParsed: (data: Transaction[]) => void;
  onSetInsights: (insights: AIInsights) => void;
  setLoading: (val: boolean) => void;
  budgetGoal?: BudgetGoal;
}

const SAMPLE_CSV_CONTENT = `date,amount,type,description
2024-01-01,5200.00,credit,Monthly Contract Retainer
2024-01-02,2100.00,debit,Office Rent
2024-01-05,145.20,debit,AWS Cloud Services
2024-01-10,450.00,debit,Business Insurance
2024-01-15,85.00,debit,Software Subscription
2024-02-01,5200.00,credit,Monthly Contract Retainer
2024-02-03,2100.00,debit,Office Rent
2024-02-12,1200.00,debit,Emergency Laptop Repair
2024-02-15,300.00,debit,Marketing Ads
2024-02-20,150.00,credit,Referral Bonus
2024-03-01,3200.00,credit,Partial Project Payment
2024-03-02,2100.00,debit,Office Rent
2024-03-05,600.00,debit,Tax Consultant
2024-03-10,400.00,debit,Equipment Upgrade
2024-03-15,120.00,debit,Client Lunch`;

const CSVUpload: React.FC<CSVUploadProps> = ({ onDataParsed, onSetInsights, setLoading, budgetGoal }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSampleHelper, setShowSampleHelper] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = async (text: string) => {
    setIsProcessing(true);
    setLoading(true);
    setError(null);
    
    try {
      const rows = text.split('\n').filter(r => r.trim()).slice(1);

      const parsedTransactions: Transaction[] = rows
        .map((row) => {
          const columns = row.split(',').map(c => c.trim());
          if (columns.length < 4) return null;

          const amount = parseFloat(columns[1]);
          if (isNaN(amount)) return null;

          return {
            id: Math.random().toString(36).substr(2, 9),
            date: columns[0],
            amount: amount,
            type: columns[2].toLowerCase() as TransactionType,
            description: columns[3],
            userId: 'current-user',
          };
        })
        .filter((t): t is Transaction => t !== null);

      if (parsedTransactions.length === 0) {
        throw new Error("No valid transactions found in CSV.");
      }

      onDataParsed(parsedTransactions);

      const insights = await generateFinancialInsights(parsedTransactions, budgetGoal);
      onSetInsights(insights);
    } catch (err: any) {
      console.error("Processing failed", err);
      setError(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
      setLoading(false);
      setShowSampleHelper(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {error && <div className="text-rose-500 text-xs font-bold">{error}</div>}
        <button 
          onClick={() => setShowSampleHelper(!showSampleHelper)}
          className="text-slate-500 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider"
        >
          Need a sample?
        </button>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl"
        >
          {isProcessing ? "Analyzing..." : "Upload Statements"}
        </button>
      </div>

      {showSampleHelper && (
        <div className="absolute top-full right-0 mt-4 w-64 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-50">
          <button 
            onClick={() => processText(SAMPLE_CSV_CONTENT)}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Inject Sample Data
          </button>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
