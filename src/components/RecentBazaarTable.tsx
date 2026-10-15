import React from 'react';
import { BazaarExpense } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { ShoppingCart, CheckCircle2, Clock, Plus } from 'lucide-react';

interface RecentBazaarTableProps {
  expenses: BazaarExpense[];
  totalMeals: number;
  activeMealRate: number;
  onOpenAddExpense: () => void;
}

export const RecentBazaarTable: React.FC<RecentBazaarTableProps> = ({
  expenses,
  totalMeals,
  activeMealRate,
  onOpenAddExpense,
}) => {
  const totalShopping = expenses.reduce((sum, e) => sum + e.shoppingExp, 0);
  const totalDining = expenses.reduce((sum, e) => sum + e.diningExp, 0);
  const totalOverall = totalShopping + totalDining;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Recent Bazaar Activity & Expenses Ledger (October - November 2026)
          </h3>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Date</th>
              <th className="py-3 px-3.5">Shopper (BazarKari)</th>
              <th className="py-3 px-3.5">Expense Category</th>
              <th className="py-3 px-3.5 text-right" title="Only Mess Bazaar counts into Meal Rate">Mess Bazaar [Meal Rate] (Tk)</th>
              <th className="py-3 px-3.5 text-right" title="Other bills split equally, not in meal rate">Other Bills [Shared Split] (Tk)</th>
              <th className="py-3 px-3.5 text-right font-bold text-slate-800">Total Expense (Tk)</th>
              <th className="py-3 px-3.5 text-right">Daily Meals</th>
              <th className="py-3 px-3.5 text-right" title="Total Mess Bazaar ÷ Total Meals">Meal Rate [Bazaar Only] (Tk)</th>
              <th className="py-3 px-3.5">Remarks / Purpose</th>
              <th className="py-3 px-3.5">Ledger Tab</th>
              <th className="py-3 px-3.5 text-center">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {expenses.map((exp) => {
              const totalExp = exp.shoppingExp + exp.diningExp;
              const formattedDate = exp.date.includes('-') && exp.date.length === 10
                ? new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : exp.date;

              return (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-900 font-medium">
                    {formattedDate}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-800">
                    {exp.shopperName}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="text-slate-700">{exp.category}</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-900">
                    {formatTk(exp.shoppingExp)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700">
                    {formatTk(exp.diningExp)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatTk(totalExp)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600">
                    {formatNumber(totalMeals, 1)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600">
                    {formatTk(activeMealRate)}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={exp.remarks}>
                    {exp.remarks}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {exp.ledgerTab}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {exp.auditStatus === 'Verified' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-900">
              <td className="py-3 px-3.5">Month Bazaar Total</td>
              <td className="py-3 px-3.5 text-slate-600">Active Ledger</td>
              <td className="py-3 px-3.5 text-slate-600">{expenses.length} Shopping Trips</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatTk(totalShopping)}</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700">{formatTk(totalDining)}</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">{formatTk(totalOverall)}</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatNumber(totalMeals, 1)}</td>
              <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatTk(activeMealRate)}</td>
              <td className="py-3 px-3.5 text-slate-600">Fully Audited & Reconciled</td>
              <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">General Ledger</td>
              <td className="py-3 px-3.5 text-center text-emerald-700 font-bold whitespace-nowrap">
                ✔️ Reconciled
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
