import React from 'react';
import { MessSummary, MemberSettlement } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart, 
  Receipt, 
  Users,
  Plus
} from 'lucide-react';

interface MessCashDisparityWidgetProps {
  summary: MessSummary;
  memberSettlements: MemberSettlement[];
  onOpenAddDeposit: () => void;
  onOpenAddExpense: () => void;
  onViewSettlement: () => void;
}

export const MessCashDisparityWidget: React.FC<MessCashDisparityWidgetProps> = ({
  summary,
  memberSettlements,
  onOpenAddDeposit,
  onOpenAddExpense,
  onViewSettlement,
}) => {
  const isDeficit = summary.cashReserveStatus === 'Deficit';
  const isSurplus = summary.cashReserveStatus === 'Surplus';

  // Member deposit vs cost breakdown
  const surplusMembersCount = memberSettlements.filter(m => m.balance > 0.05).length;
  const dueMembersCount = memberSettlements.filter(m => m.balance < -0.05).length;
  const balancedMembersCount = memberSettlements.length - surplusMembersCount - dueMembersCount;

  // Proportional percentages against total deposits (cap max for bar)
  const depositBase = Math.max(1, summary.totalDeposits);
  const bazaarPctOfDeposit = Math.min(100, Math.round((summary.totalShoppingExp / depositBase) * 100));
  const billsPctOfDeposit = Math.min(100 - bazaarPctOfDeposit, Math.round((summary.totalDiningExp / depositBase) * 100));
  const remainingPctOfDeposit = isDeficit ? 0 : Math.max(0, 100 - bazaarPctOfDeposit - billsPctOfDeposit);

  return (
    <div className={`rounded-xl border p-5 shadow-xs transition-all ${
      isDeficit 
        ? 'bg-rose-50/40 border-rose-200' 
        : 'bg-white border-slate-200/90'
    }`}>
      {/* 1. Header with dynamic alert status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isDeficit 
              ? 'bg-rose-100 text-rose-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Mess Cash Fund & Deposit Discrepancy Reconciliation
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isDeficit 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : isSurplus
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {isDeficit ? '🔴 Cash Deficit Alert' : isSurplus ? '🟢 Surplus Reserve Active' : '⚪ Exact Break-Even'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks the financial gap between collected member deposits and actual expenditures (Mess Bazaar & Shared Bills).
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddDeposit}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Deposit</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Log Bazaar</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive 3-way Reconciliation Cards (Deposit Inflow vs Expenses Outflow vs Net Cash in Hand) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Box A: Deposit Inflow */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              1. Total Deposits Inflow
            </span>
            <span className="text-emerald-700 font-medium text-[11px] flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              Member Choice
            </span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(summary.totalDeposits)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pooled fund collected from {summary.activeMembersCount} residents for monthly food & bills.
          </p>
        </div>

        {/* Box B: Cash Outflow Breakdown */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              2. Total Mess Outflow
            </span>
            <span className="text-rose-700 font-medium text-[11px] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Spent from Fund
            </span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(summary.totalExpenses)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60">
            <span className="truncate text-emerald-700 font-medium" title="Mess Bazaar grocery costs">
              🛒 {formatTk(summary.totalShoppingExp)} Food
            </span>
            <span className="text-slate-300">|</span>
            <span className="truncate text-blue-700 font-medium" title="Other shared bills split equally">
              ⚡ {formatTk(summary.totalDiningExp)} Bills
            </span>
          </div>
        </div>

        {/* Box C: Net Mess Cash in Hand & Disparity */}
        <div className={`border rounded-lg p-3.5 ${
          isDeficit 
            ? 'bg-rose-100/60 border-rose-300' 
            : 'bg-emerald-50/60 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-semibold uppercase tracking-wider text-[10px] ${
              isDeficit ? 'text-rose-800' : 'text-emerald-800'
            }`}>
              3. Cash in Hand (Reserve)
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              isDeficit ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
            }`}>
              {isDeficit ? 'Shortfall' : 'Surplus'}
            </span>
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${
            isDeficit ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {formatTk(summary.cashInHand)}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {isDeficit 
              ? `Expenses outpaced deposits by ${formatTk(summary.netCashDisparity)}. Needs deposit top-up!` 
              : `Available physical cash buffer to spend on next grocery bazaar.`
            }
          </p>
        </div>
      </div>

      {/* 3. Deposit Fund Allocation Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Deposit Utilization Rate: <span className="font-mono font-bold text-slate-900">{formatNumber(summary.depositUtilizationRate, 1)}%</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            {isDeficit 
              ? `Deficit: ${formatTk(summary.netCashDisparity)} over total deposit` 
              : `Surplus: ${formatTk(summary.cashInHand)} remaining in mess fund`
            }
          </span>
        </div>

        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          {/* Bazaar Spend */}
          <div 
            style={{ width: `${bazaarPctOfDeposit}%` }} 
            className="bg-emerald-600 transition-all" 
            title={`Mess Bazaar Food: ${bazaarPctOfDeposit}% of deposits`}
          />
          {/* Other Shared Bills */}
          <div 
            style={{ width: `${billsPctOfDeposit}%` }} 
            className="bg-blue-500 transition-all" 
            title={`Other Shared Bills: ${billsPctOfDeposit}% of deposits`}
          />
          {/* Remaining Cash Reserve */}
          {remainingPctOfDeposit > 0 && (
            <div 
              style={{ width: `${remainingPctOfDeposit}%` }} 
              className="bg-emerald-200 transition-all" 
              title={`Remaining Cash in Hand: ${remainingPctOfDeposit}%`}
            />
          )}
          {/* Deficit Overflow Strip */}
          {isDeficit && (
            <div 
              style={{ width: '100%' }} 
              className="bg-rose-500 animate-pulse" 
              title="Cash fund completely depleted!"
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Mess Bazaar Food ({formatNumber(summary.bazaarExpenseShare, 1)}% of expenses)</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Shared Bills ({formatNumber(summary.sharedBillsShare, 1)}% of expenses)</span>
          </span>
          {!isDeficit && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border border-emerald-400" />
              <span>Available Cash in Hand ({formatTk(summary.cashInHand)})</span>
            </span>
          )}
          {isDeficit && (
            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Overspent Deficit ({formatTk(summary.netCashDisparity)})</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Member Disparity Micro-Audit Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Member Standings:</span>
          </span>
          <span className="text-emerald-700 font-medium">
            🟢 {surplusMembersCount} In Credit (Surplus)
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-rose-700 font-medium">
            🔴 {dueMembersCount} In Due (Deficit)
          </span>
          {balancedMembersCount > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">
                ⚪ {balancedMembersCount} Balanced
              </span>
            </>
          )}
        </div>

        <button
          onClick={onViewSettlement}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>View Individual Member Breakdown →</span>
        </button>
      </div>
    </div>
  );
};
