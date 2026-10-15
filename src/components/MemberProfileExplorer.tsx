import React, { useState } from 'react';
import { MemberSettlement } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { 
  User, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  Utensils, 
  CircleDollarSign, 
  ShoppingBag, 
  ClipboardList,
  Phone,
  DoorClosed
} from 'lucide-react';

interface MemberProfileExplorerProps {
  memberSettlements: MemberSettlement[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onToggleSettled: (memberId: string) => void;
  onOpenPrintSlip: (memberSettlement: MemberSettlement) => void;
}

export const MemberProfileExplorer: React.FC<MemberProfileExplorerProps> = ({
  memberSettlements,
  selectedMemberId,
  onSelectMember,
  onToggleSettled,
  onOpenPrintSlip,
}) => {
  const [copied, setCopied] = useState(false);

  const current = memberSettlements.find(ms => ms.member.id === selectedMemberId) || memberSettlements[0];
  if (!current) return null;

  const handleCopySummary = () => {
    const text = `🍽️ Mess Statement: ${current.member.name}\n` +
      `Meals: ${formatNumber(current.totalMeals, 1)} (@ ${formatTk(current.appliedMealRate)}/meal - Bazaar Only)\n` +
      `Meal Cost: ${formatTk(current.mealCost)} + Other Shared Bills: ${formatTk(current.diningSplit)}\n` +
      `Total Cost: ${formatTk(current.totalCost)}\n` +
      `Total Deposited: ${formatTk(current.totalDeposit)}\n` +
      `Standing Balance: ${formatTk(current.balance)} (${current.status})\n` +
      `Settlement Action: ${current.settlementAction} [${current.isSettled ? 'Cleared' : 'Pending'}]`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSurplus = current.balance >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header bar with Selector and status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Individual Member Statement & Profile Explorer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="member-select" className="text-xs font-medium text-slate-500">
              Select Member:
            </label>
            <select
              id="member-select"
              value={current.member.id}
              onChange={(e) => onSelectMember(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {memberSettlements.map((ms) => (
                <option key={ms.member.id} value={ms.member.id}>
                  {ms.member.name} ({ms.status === 'Refund Eligible' ? 'Refund' : 'Due'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Member Profile Meta & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {current.member.phone && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {current.member.phone}
            </span>
          )}
          {current.member.room && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
              <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
              {current.member.room}
            </span>
          )}

          <button
            onClick={() => onToggleSettled(current.member.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              current.isSettled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${current.isSettled ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{current.isSettled ? 'Settled & Cleared' : 'Mark Cleared'}</span>
          </button>

          <button
            onClick={() => onOpenPrintSlip(current)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Slip / Memo</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Copy member statement text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Member Highlight Banner */}
      <div className="py-3 px-4 bg-slate-50/80 rounded-lg mt-4 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{current.member.name}</span>
          <span className="text-slate-400">·</span>
          <span className={`font-semibold ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
            Status: {current.status}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-mono">
            Action: <strong>{current.settlementAction}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-600 font-mono">
          <span>Balance: <strong className={isSurplus ? 'text-emerald-700' : 'text-rose-700'}>{formatTk(current.balance)}</strong></span>
          <span>Total Meals: <strong className="text-slate-900">{formatNumber(current.totalMeals, 1)}</strong></span>
        </div>
      </div>

      {/* 4 Cards Grid matching the CSV Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 🍽️ MEAL CONSUMPTION */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-xs uppercase tracking-wide">
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Meal Consumption</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Meals Eaten</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{formatNumber(current.totalMeals, 1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Meal Rate (Bazaar Only)</span>
              <span className="font-semibold font-mono tabular-nums text-emerald-800">{formatTk(current.appliedMealRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Meal Cost Subtotal</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{formatTk(current.mealCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Other Bills Shared Split</span>
              <span className="font-semibold font-mono tabular-nums text-blue-700">{formatTk(current.diningSplit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Meals Share</span>
              <span className="font-mono tabular-nums text-slate-700">{current.totalMealsShare.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Avg Meals / Day</span>
              <span className="font-mono tabular-nums text-slate-700">{current.avgMealsPerDay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: 💰 FINANCIAL OBLIGATIONS */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-xs uppercase tracking-wide">
            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financial Obligations</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Gross Expense</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{formatTk(current.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Deposited</span>
              <span className="font-semibold font-mono tabular-nums text-emerald-700">{formatTk(current.totalDeposit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Net Standing Balance</span>
              <span className={`font-bold font-mono tabular-nums ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatTk(current.balance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Standing</span>
              <span className={`font-medium ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isSurplus ? 'Surplus / Refund' : 'Deficit / Due'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Deposit Coverage</span>
              <span className="font-mono tabular-nums text-slate-700">{current.depositCoverage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Variance</span>
              <span className="font-mono tabular-nums text-slate-700">{formatTk(current.paymentVariance)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: 🛒 BAZAAR HANDLED */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-xs uppercase tracking-wide">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Bazaar Handled</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bazaar Duty Trips</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{current.bazaarTrips}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bazaar Spend Handled</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{formatTk(current.bazaarSpendHandled)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Deposits Recorded</span>
              <span className="font-mono tabular-nums text-slate-700">{current.depositsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Spend Share</span>
              <span className="font-mono tabular-nums text-slate-700">{current.totalSpendShare.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bazaar Participation</span>
              <span className="font-medium text-slate-800">{current.bazaarParticipation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Duty Compliance</span>
              <span className="font-medium text-emerald-700">Verified Ledger</span>
            </div>
          </div>
        </div>

        {/* Card 4: 📋 SETTLEMENT ACTION */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-xs uppercase tracking-wide">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            <span>Settlement Action</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Settlement Status</span>
              <span className={`font-semibold ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {current.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Action Required</span>
              <span className="font-bold font-mono text-slate-900">{current.settlementAction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Reconciliation Check</span>
              <span className={`font-medium ${current.isSettled ? 'text-emerald-700' : 'text-amber-600'}`}>
                {current.isSettled ? '✔️ Cleared & Closed' : '⏳ Pending Clearance'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Direction</span>
              <span className="font-medium text-slate-700">{current.paymentDirection}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Settlement Target</span>
              <span className="font-semibold font-mono tabular-nums text-slate-900">{formatTk(current.settlementTarget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Verification Method</span>
              <span className="font-medium text-slate-700">Cash / MFS (bKash)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
