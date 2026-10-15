import React, { useState } from 'react';
import { Deposit, Member } from '../types';
import { formatTk } from '../utils/calculator';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search, 
  Wallet, 
  Smartphone,
  Banknote
} from 'lucide-react';

interface DepositsViewProps {
  deposits: Deposit[];
  members: Member[];
  totalMessExpenses: number;
  onOpenAddDeposit: () => void;
  onDeleteDeposit: (id: string) => void;
  onToggleVerifyDeposit: (id: string) => void;
}

export const DepositsView: React.FC<DepositsViewProps> = ({
  deposits,
  members,
  totalMessExpenses,
  onOpenAddDeposit,
  onDeleteDeposit,
  onToggleVerifyDeposit,
}) => {
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = deposits.filter(dep => {
    if (memberFilter !== 'all' && dep.memberId !== memberFilter) return false;
    if (methodFilter !== 'all' && dep.paymentMethod !== methodFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = dep.memberName.toLowerCase().includes(q);
      const matchTrx = (dep.trxId || '').toLowerCase().includes(q);
      const matchRem = (dep.remarks || '').toLowerCase().includes(q);
      if (!matchName && !matchTrx && !matchRem) return false;
    }
    return true;
  });

  const totalDeposited = deposits.filter(d => d.verified).reduce((s, d) => s + d.amount, 0);
  const remainingCash = totalDeposited - totalMessExpenses;

  // Method breakdown
  const cashTotal = deposits.filter(d => d.verified && d.paymentMethod === 'Cash').reduce((s, d) => s + d.amount, 0);
  const mfsTotal = deposits.filter(d => d.verified && (d.paymentMethod === 'bKash' || d.paymentMethod === 'Nagad' || d.paymentMethod === 'Rocket')).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>💳 Member Fund Deposits</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Advance payments received into the mess fund via Cash, bKash, Nagad, Rocket, or Bank.
          </p>
        </div>

        <button
          onClick={onOpenAddDeposit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Member Deposit</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fund Collected</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(totalDeposited)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {deposits.length} total deposit transactions recorded
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">MFS Deposits (bKash/Nagad)</span>
            <Smartphone className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-pink-700">
            {formatTk(mfsTotal)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Direct digital wallet transfers with TrxID
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Mess In-Hand Cash Balance</span>
            <Banknote className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${
            remainingCash >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatTk(remainingCash)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Total Deposits minus {formatTk(totalMessExpenses)} Total Expenses
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 grow">
          <div className="relative min-w-[200px] max-w-xs grow">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member, TrxID, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Member:</span>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Methods</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          Filtered Total: <strong className="text-emerald-700">{formatTk(filtered.reduce((s, d) => s + d.amount, 0))}</strong>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Member Name</th>
                <th className="py-3 px-3.5 text-right font-bold text-slate-800">Deposit Amount (Tk)</th>
                <th className="py-3 px-3.5">Payment Method</th>
                <th className="py-3 px-3.5">TrxID / Reference</th>
                <th className="py-3 px-3.5">Remarks</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No deposit entries recorded for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((dep) => {
                  return (
                    <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-900 font-medium">
                        {dep.date}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-900">
                        {dep.memberName}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-700 text-sm">
                        {formatTk(dep.amount)}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{dep.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {dep.trxId || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={dep.remarks}>
                        {dep.remarks || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleVerifyDeposit(dep.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                            dep.verified
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {dep.verified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-semibold">Verified</span>
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
                          onClick={() => onDeleteDeposit(dep.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Deposit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
