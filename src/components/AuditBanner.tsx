import React from 'react';
import { MessSummary } from '../types';
import { formatTk } from '../utils/calculator';
import { CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

interface AuditBannerProps {
  summary: MessSummary;
  onViewSettlement?: () => void;
}

export const AuditBanner: React.FC<AuditBannerProps> = ({ summary, onViewSettlement }) => {
  const isBalanced = summary.reconciliationVariance < 0.05;

  return (
    <div className={`border rounded-xl px-4 py-3 sm:px-5 sm:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs sm:text-sm transition-all ${
      isBalanced
        ? 'bg-gradient-to-r from-emerald-50/70 to-teal-50/40 border-emerald-200/90 text-emerald-950'
        : 'bg-gradient-to-r from-amber-50/70 to-orange-50/40 border-amber-200 text-amber-950'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isBalanced ? 'bg-emerald-100/80 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isBalanced ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
          <span className="font-bold tracking-tight text-slate-900">
            AUDIT & CASH CHECK:
          </span>
          <span className="text-slate-700">
            Deposits <strong className="font-mono tabular-nums text-slate-900 font-semibold">{formatTk(summary.totalDeposits)}</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-700">
            Spent <strong className="font-mono tabular-nums text-slate-900 font-semibold">{formatTk(summary.totalExpenses)}</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-700">
            Cash in Hand <strong className={`font-mono tabular-nums font-bold ${
              summary.cashReserveStatus === 'Deficit' ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {formatTk(summary.cashInHand)}
            </strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-700">
            Variance <strong className="font-mono tabular-nums text-emerald-700 font-bold">{formatTk(summary.reconciliationVariance)}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto shrink-0 text-xs">
        <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full ${
          summary.cashReserveStatus === 'Deficit'
            ? 'bg-rose-100 text-rose-800'
            : isBalanced 
              ? 'bg-emerald-100/90 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            summary.cashReserveStatus === 'Deficit'
              ? 'bg-rose-600'
              : isBalanced ? 'bg-emerald-600' : 'bg-amber-600'
          }`} />
          {summary.cashReserveStatus === 'Deficit'
            ? 'Fund Deficit Alert'
            : isBalanced ? 'Surplus Reserve Reconciled' : 'Variance Detected'}
        </span>

        {onViewSettlement && (
          <button
            onClick={onViewSettlement}
            className="hidden sm:inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <span>Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
