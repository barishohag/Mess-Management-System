import React from 'react';
import { MemberSettlement, MessSummary } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { Scale, Check, Clock, Printer, UserCheck } from 'lucide-react';

interface SettlementTableProps {
  memberSettlements: MemberSettlement[];
  summary: MessSummary;
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onToggleSettled: (id: string) => void;
  onOpenPrintSlip: (memberSettlement: MemberSettlement) => void;
  onMarkAllCleared?: () => void;
}

export const SettlementTable: React.FC<SettlementTableProps> = ({
  memberSettlements,
  summary,
  selectedMemberId,
  onSelectMember,
  onToggleSettled,
  onOpenPrintSlip,
  onMarkAllCleared,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Member Reconciliation & Live Settlement Manager
            </h3>
            <p className="text-xs text-slate-500">
              Audited balance sheet: Deposit - Total Cost = Standing Settlement Balance
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Rule Enforced: Only Mess Bazaar calculates Meal Rate. All other bills are shared split equally.</span>
            </div>
          </div>
        </div>

        {onMarkAllCleared && (
          <button
            onClick={onMarkAllCleared}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 self-start sm:self-auto"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Toggle All Cleared</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Member Name</th>
              <th className="py-3 px-3.5 text-right">Total Meals</th>
              <th className="py-3 px-3.5 text-right" title="Only Mess Bazaar ÷ Total Meals">Meal Rate (Bazaar)</th>
              <th className="py-3 px-3.5 text-right" title="Meals × Meal Rate (Food Bazaar only)">Meal Cost (Bazaar Only) (Tk)</th>
              <th className="py-3 px-3.5 text-right" title="Other bills split equally among active members (Not in meal rate)">Other Bills Shared Split (Tk)</th>
              <th className="py-3 px-3.5 text-right font-bold text-slate-800">Total Cost (Tk)</th>
              <th className="py-3 px-3.5 text-right font-bold text-slate-800">Total Deposit (Tk)</th>
              <th className="py-3 px-3.5 text-right font-bold">Balance (Tk)</th>
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5 text-center">Settlement Action</th>
              <th className="py-3 px-3.5 text-center">Settled / Cleared</th>
              <th className="py-3 px-3.5 text-center">Audit Check</th>
              <th className="py-3 px-3.5 text-center">Slip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {memberSettlements.map((ms) => {
              const isSelected = ms.member.id === selectedMemberId;
              const isSurplus = ms.balance >= 0;

              return (
                <tr
                  key={ms.member.id}
                  onClick={() => onSelectMember(ms.member.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-900 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ms.member.avatarColor }}
                    />
                    <span>{ms.member.name}</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-900 font-medium">
                    {formatNumber(ms.totalMeals, 1)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600">
                    {formatTk(ms.appliedMealRate)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-900">
                    {formatTk(ms.mealCost)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700">
                    {formatTk(ms.diningSplit)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatTk(ms.totalCost)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-700">
                    {formatTk(ms.totalDeposit)}
                  </td>
                  <td className={`py-3 px-3.5 text-right font-mono tabular-nums font-bold text-sm ${
                    isSurplus ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {formatTk(ms.balance)}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span className={`font-semibold ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {ms.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap font-medium font-mono text-slate-800">
                    {ms.settlementAction}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleSettled(ms.member.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        ms.isSettled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ms.isSettled ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>TRUE</span>
                        </>
                      ) : (
                        <span>FALSE</span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {ms.isSettled ? (
                      <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                        ✔️ Cleared
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>⏳ Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenPrintSlip(ms)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Print / View Memo Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-900">
              <td className="py-3 px-3.5 font-bold">Total / Mess Summary</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold">
                {formatNumber(summary.totalMeals, 1)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                {formatTk(summary.activeMealRate)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                {formatTk(summary.totalShoppingExp)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700">
                {formatTk(summary.totalDiningExp)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold">
                {formatTk(summary.totalExpenses)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-700">
                {formatTk(summary.totalDeposits)}
              </td>
              <td className={`py-3 px-3.5 text-right font-mono tabular-nums font-bold text-sm ${
                summary.cashReserveStatus === 'Deficit' ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {formatTk(summary.cashInHand)}
              </td>
              <td className="py-3 px-3.5 text-center font-bold">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  summary.cashReserveStatus === 'Surplus' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : summary.cashReserveStatus === 'Deficit'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-800'
                }`}>
                  {summary.cashReserveStatus === 'Surplus' ? '🟢 Cash Surplus' : summary.cashReserveStatus === 'Deficit' ? '🔴 Cash Deficit' : 'Balanced'}
                </span>
              </td>
              <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                Reserve: {formatTk(summary.cashInHand)}
              </td>
              <td className="py-3 px-3.5 text-center font-mono font-medium text-slate-700">
                Cleared: {summary.clearedCount}/{memberSettlements.length}
              </td>
              <td className="py-3 px-3.5 text-center text-emerald-700 font-bold">
                Ledger Matched
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
