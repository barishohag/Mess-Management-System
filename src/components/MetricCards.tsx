import React from 'react';
import { MessSummary, DormitorySummary } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { TrendingUp, Receipt, Building2, ShieldCheck } from 'lucide-react';

interface MetricCardsProps {
  summary: MessSummary;
  dormSummary?: DormitorySummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary, dormSummary }) => {
  const collectionPercent = dormSummary && dormSummary.totalExpenses > 0
    ? Math.round((dormSummary.totalPaid / dormSummary.totalExpenses) * 100)
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. ACTIVE MEAL RATE */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Active Meal Rate
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Bazaar Only
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {formatTk(summary.activeMealRate)}
          <span className="text-xs font-medium text-slate-400 font-sans ml-1">/meal</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-slate-600" title="Total Mess Bazaar ÷ Total Meals. Other bills NOT added to meal rate.">
            Total Bazaar ÷ Meals
          </span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
            {formatNumber(summary.totalMeals, 0)} meals
          </span>
        </div>
      </div>

      {/* 2. TOTAL MESS EXPENSES */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2.5">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Mess Expenses Breakdown
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {formatTk(summary.totalExpenses)}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="truncate text-emerald-700 font-medium" title="Mess Bazaar food costs used to calculate Meal Rate">
            {formatTk(summary.totalShoppingExp)} Bazaar
          </span>
          <span className="text-slate-400">+</span>
          <span className="truncate text-blue-700 font-medium" title="Other shared bills split equally among active members">
            {formatTk(summary.totalDiningExp)} Shared Bills
          </span>
        </div>
      </div>

      {/* 3. DORMITORY FLAT BILLS */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2.5">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Dormitory Flat Bills
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {dormSummary ? formatTk(dormSummary.totalExpenses) : formatNumber(summary.totalMeals, 1)}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-slate-600">Per Resident Share</span>
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-mono">
            {dormSummary ? formatTk(dormSummary.perMemberShare) : `${summary.activeMembersCount} Members`}
          </span>
        </div>
      </div>

      {/* 4. MESS CASH IN HAND & LIQUIDITY RESERVE */}
      <div className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
        summary.cashReserveStatus === 'Deficit' 
          ? 'border-rose-300 ring-1 ring-rose-200' 
          : 'border-slate-200/90 hover:border-slate-300'
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Mess Cash in Hand
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              summary.cashReserveStatus === 'Surplus'
                ? 'bg-emerald-100 text-emerald-800'
                : summary.cashReserveStatus === 'Deficit'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              {summary.cashReserveStatus === 'Surplus' ? 'Surplus Reserve' : summary.cashReserveStatus === 'Deficit' ? 'Deficit Shortfall' : 'Balanced'}
            </span>
          </div>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            summary.cashReserveStatus === 'Deficit'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
          summary.cashInHand < 0 ? 'text-rose-600' : 'text-slate-900'
        }`}>
          {formatTk(summary.cashInHand)}
          <span className="text-xs font-medium text-slate-400 font-sans ml-1">
            in fund
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="text-slate-600 truncate" title="Total Deposits collected from members">
            Dep: <span className="font-semibold text-slate-900 font-mono">{formatTk(summary.totalDeposits)}</span>
          </span>
          <span className="text-slate-400">-</span>
          <span className="text-slate-600 truncate" title="Total Mess Outflow (Bazaar + Bills)">
            Spent: <span className="font-semibold text-slate-900 font-mono">{formatTk(summary.totalExpenses)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
