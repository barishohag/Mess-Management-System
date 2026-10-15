import React, { useState } from 'react';
import { BazaarExpense, Member, ExpenseCategory } from '../types';
import { formatTk, formatNumber } from '../utils/calculator';
import { 
  ShoppingCart, 
  Plus, 
  Filter, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface BazaarViewProps {
  expenses: BazaarExpense[];
  members: Member[];
  totalMeals: number;
  activeMealRate: number;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onToggleAuditStatus: (id: string) => void;
}

export const BazaarView: React.FC<BazaarViewProps> = ({
  expenses,
  members,
  totalMeals,
  activeMealRate,
  onOpenAddExpense,
  onDeleteExpense,
  onToggleAuditStatus,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [shopperFilter, setShopperFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Duty counts
  const dutyCounts: Record<string, { name: string; trips: number; spend: number }> = {};
  members.forEach(m => {
    dutyCounts[m.id] = { name: m.name, trips: 0, spend: 0 };
  });

  expenses.forEach(exp => {
    if (dutyCounts[exp.shopperId]) {
      dutyCounts[exp.shopperId].trips += 1;
      dutyCounts[exp.shopperId].spend += (exp.shoppingExp + exp.diningExp);
    }
  });

  // Filtered expenses
  const filtered = expenses.filter(exp => {
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
    if (shopperFilter !== 'all' && exp.shopperId !== shopperFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = exp.shopperName.toLowerCase().includes(q);
      const matchCat = exp.category.toLowerCase().includes(q);
      const matchRem = exp.remarks.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchRem) return false;
    }
    return true;
  });

  const totalShopping = filtered.reduce((s, e) => s + e.shoppingExp, 0);
  const totalDining = filtered.reduce((s, e) => s + e.diningExp, 0);
  const totalCombined = totalShopping + totalDining;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>🛒 Bazaar & Expenses Ledger</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong className="text-emerald-700">Accounting Rule:</strong> Only <strong>Mess Bazaar</strong> expenses calculate the Meal Rate. All other bills (utilities, gas, repairs, cutter, maid) are <strong>shared split equally</strong> and not added to meal rate.
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Bazaar / Expense</span>
        </button>
      </div>

      {/* Shopper Duty Rotation Tracker Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Bazaar Duty Rotation Tracker</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {expenses.length} Total Bazaar Trips Recorded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {members.map(member => {
            const duty = dutyCounts[member.id] || { name: member.name, trips: 0, spend: 0 };
            const isZero = duty.trips === 0;

            return (
              <div
                key={member.id}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  isZero
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate">
                  {member.name}
                </div>
                <div className="mt-1 text-base font-extrabold font-mono text-slate-800">
                  {duty.trips} <span className="text-[11px] font-normal text-slate-500">trips</span>
                </div>
                <div className="text-[11px] font-mono tabular-nums text-slate-600 mt-0.5">
                  {formatTk(duty.spend)}
                </div>
                {isZero && (
                  <div className="mt-1 text-[10px] text-amber-700 font-semibold">
                    Duty Next!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 grow">
          <div className="relative min-w-[200px] max-w-xs grow">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shopper, remarks, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="Mess Bazaar">Mess Bazaar</option>
              <option value="Bazaar + Repair">Bazaar + Repair</option>
              <option value="Utilities / Plumbing">Utilities / Plumbing</option>
              <option value="Weekly Bazaar & Gas">Weekly Bazaar & Gas</option>
              <option value="Emergency Grocery">Emergency Grocery</option>
              <option value="Month-End + Cutter Bill">Month-End + Cutter Bill</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Shopper:</span>
            <select
              value={shopperFilter}
              onChange={(e) => setShopperFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Shoppers</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          Showing <strong>{filtered.length}</strong> entries
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Shopper (BazarKari)</th>
                <th className="py-3 px-3.5">Expense Category</th>
                <th className="py-3 px-3.5 text-right" title="Only Mess Bazaar goes into Meal Rate calculation">Mess Bazaar [Meal Rate] (Tk)</th>
                <th className="py-3 px-3.5 text-right" title="Other bills split equally among active members">Other Bills [Shared Split] (Tk)</th>
                <th className="py-3 px-3.5 text-right font-bold text-slate-800">Total Expense (Tk)</th>
                <th className="py-3 px-3.5 text-right">Daily Meals</th>
                <th className="py-3 px-3.5 text-right" title="Calculated only as Total Mess Bazaar ÷ Total Meals">Meal Rate [Bazaar Only] (Tk)</th>
                <th className="py-3 px-3.5">Remarks / Purpose</th>
                <th className="py-3 px-3.5">Ledger Tab</th>
                <th className="py-3 px-3.5 text-center">Audit Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    No bazaar expenses match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => {
                  const totalExp = exp.shoppingExp + exp.diningExp;
                  const formattedDate = exp.date.includes('-') && exp.date.length === 10
                    ? new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : exp.date;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-900 font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {exp.shopperName}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                        {exp.category}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-900 font-medium">
                        {formatTk(exp.shoppingExp)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700 font-medium">
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
                        <button
                          onClick={() => onToggleAuditStatus(exp.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                            exp.auditStatus === 'Verified'
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {exp.auditStatus === 'Verified' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Expense Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-900">
                <td className="py-3 px-3.5">Month Bazaar Total</td>
                <td className="py-3 px-3.5 text-slate-600">{members.length} Active Members</td>
                <td className="py-3 px-3.5 text-slate-600">{filtered.length} Shopping Trips</td>
                <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatTk(totalShopping)}</td>
                <td className="py-3 px-3.5 text-right font-mono tabular-nums text-blue-700">{formatTk(totalDining)}</td>
                <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">{formatTk(totalCombined)}</td>
                <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatNumber(totalMeals, 1)}</td>
                <td className="py-3 px-3.5 text-right font-mono tabular-nums">{formatTk(activeMealRate)}</td>
                <td className="py-3 px-3.5 text-slate-600">Fully Audited & Reconciled</td>
                <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">General Ledger</td>
                <td className="py-3 px-3.5 text-center text-emerald-700 font-bold whitespace-nowrap">
                  ✔️ Reconciled
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
