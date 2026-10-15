import React, { useState } from 'react';
import { DormitoryBillItem, DormitoryMemberPayment, DormitorySummary, MemberSettlement } from '../types';
import { formatTk } from '../utils/calculator';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit2, 
  Share2, 
  Download, 
  Check, 
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DormitoryBillsViewProps {
  billItems: DormitoryBillItem[];
  payments: DormitoryMemberPayment[];
  summary: DormitorySummary;
  memberSettlements?: MemberSettlement[];
  includeMealAdjustment: boolean;
  onToggleMealAdjustment: (val: boolean) => void;
  onUpdateBillItem: (id: string, amount: number, name?: string) => void;
  onAddBillItem: (name: string, amount: number) => void;
  onDeleteBillItem: (id: string) => void;
  onQuickTogglePaid: (memberId: string) => void;
  onOpenPaymentModal: (payment: DormitoryMemberPayment) => void;
  onMarkAllPaid: () => void;
  onResetAllUnpaid: () => void;
  onOpenWhatsApp: () => void;
  onExportCSV: () => void;
}

export const DormitoryBillsView: React.FC<DormitoryBillsViewProps> = ({
  billItems,
  payments,
  summary,
  includeMealAdjustment,
  onToggleMealAdjustment,
  onUpdateBillItem,
  onAddBillItem,
  onDeleteBillItem,
  onQuickTogglePaid,
  onOpenPaymentModal,
  onMarkAllPaid,
  onResetAllUnpaid,
  onOpenWhatsApp,
  onExportCSV,
}) => {
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');

  const handleStartEdit = (bill: DormitoryBillItem) => {
    setEditingBillId(bill.id);
    setEditAmount(bill.amount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const amt = parseFloat(editAmount) || 0;
    onUpdateBillItem(id, amt);
    setEditingBillId(null);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillName.trim()) return;
    const amt = parseFloat(newBillAmount) || 0;
    onAddBillItem(newBillName.trim(), amt);
    setNewBillName('');
    setNewBillAmount('');
    setIsAddingBill(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Dormitory Monthly Bill Tracker
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monthly Shared Expense Split & Combined Payment Settlement ({summary.totalMembers} Members)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            title="Generate WhatsApp group payment notice"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Notice</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            title="Export CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={summary.paidMembersCount === summary.totalMembers ? onResetAllUnpaid : onMarkAllPaid}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>{summary.paidMembersCount === summary.totalMembers ? 'Reset All to Unpaid' : 'Mark All Paid'}</span>
          </button>
        </div>
      </div>

      {/* 🌟 ONE-PAY SETTLEMENT INTEGRATION BANNER */}
      <div className={`p-4 rounded-xl border transition-all ${
        includeMealAdjustment
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${includeMealAdjustment ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">
                  One-Pay Unified Settlement: Meal Settlement Included in Dormitory Bill
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  includeMealAdjustment ? 'bg-emerald-200/80 text-emerald-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {includeMealAdjustment ? 'Active' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Automatically offsets member meal balances (refunds count as rent discounts, meal dues are added) so each resident pays their entire monthly mess and dorm obligations in one clean transaction.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs select-none">
            <input
              type="checkbox"
              checked={includeMealAdjustment}
              onChange={(e) => onToggleMealAdjustment(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-slate-900">
              {includeMealAdjustment ? 'Enabled (One-Pay Mode)' : 'Enable One-Pay'}
            </span>
          </label>
        </div>
      </div>

      {/* KPI Cards Strip matching the prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Flat Expenses</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(summary.totalExpenses)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Rent + Cook + Utilities
          </div>
        </div>

        {/* Base Rent Share */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Base Share / Member</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(summary.perMemberShare)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Equal split among {summary.totalMembers} members
          </div>
        </div>

        {/* Net Combined Obligation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {includeMealAdjustment ? 'Net To Collect (One-Pay)' : 'Total Rent To Collect'}
            </span>
            <Banknote className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-800">
            {formatTk(includeMealAdjustment ? summary.totalNetCombinedPayable : summary.totalExpenses)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {includeMealAdjustment 
              ? `Adjusted with ৳${Math.abs(summary.totalMealRefundsAdjustment).toLocaleString()} meal balances`
              : 'Flat expenses only'}
          </div>
        </div>

        {/* Collection Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Collection Status</span>
            {summary.status === 'Fully Collected' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatTk(summary.totalPaid)} <span className="text-xs font-normal text-slate-500">collected</span>
          </div>
          <div className="text-xs font-semibold mt-2 flex items-center justify-between">
            <span className={summary.status === 'Fully Collected' ? 'text-emerald-700' : 'text-amber-700'}>
              {summary.status} ({summary.paidMembersCount}/{summary.totalMembers} Paid)
            </span>
            <span className="text-slate-500 font-mono">
              Due: {formatTk(summary.totalBalanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Expenses List vs Member Payments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Expense Items List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Monthly Shared Expense Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">
                Fixed dormitory utility and flat rent obligations
              </p>
            </div>
            <button
              onClick={() => setIsAddingBill(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* New Item Form */}
          {isAddingBill && (
            <form onSubmit={handleCreateBill} className="p-3 bg-emerald-50/40 border-b border-emerald-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Water/Waste)"
                required
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                className="grow text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Amount (Tk)"
                required
                min="0"
                value={newBillAmount}
                onChange={(e) => setNewBillAmount(e.target.value)}
                className="w-24 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBill(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {billItems.map((bill) => {
              const isEditing = editingBillId === bill.id;

              return (
                <div key={bill.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="grow">
                    <div className="text-xs font-semibold text-slate-900">{bill.name}</div>
                    {bill.vendorNotes && (
                      <div className="text-[11px] text-slate-500">{bill.vendorNotes}</div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 text-xs px-2 py-1 border border-slate-300 rounded font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(bill.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums font-bold text-xs text-slate-900">
                        {formatTk(bill.amount)}
                      </span>
                      <button
                        onClick={() => handleStartEdit(bill)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit amount"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-100 border-t-2 border-slate-300 flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Total Monthly Expenses</span>
            <span className="font-mono tabular-nums text-sm font-extrabold text-emerald-800">
              {formatTk(summary.totalExpenses)}
            </span>
          </div>
        </div>

        {/* Right Column: Member Payments Table with Meal Settlement Adjustment (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Member Payment & Settlement Roster
              </h3>
              <p className="text-[11px] text-slate-500">
                {includeMealAdjustment
                  ? 'Showing Net Combined Amount (Rent - Meal Refund or + Meal Due)'
                  : `Base flat share: ${formatTk(summary.perMemberShare)} per member`}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600">
              {summary.paidMembersCount} / {summary.totalMembers} Cleared
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Member Name</th>
                  <th className="py-3 px-3 text-right">Rent Share</th>
                  {includeMealAdjustment && (
                    <th className="py-3 px-3 text-right">Meal Adjustment</th>
                  )}
                  <th className="py-3 px-3 text-right font-bold text-slate-900">
                    {includeMealAdjustment ? 'Net To Pay' : 'Assigned Due'}
                  </th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-800">Balance Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">One-Pay Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {payments.map((p, idx) => {
                  const isPaid = p.status === 'Paid';
                  const isPartial = p.status === 'Partial';
                  const mealBal = p.mealBalance || 0;
                  const targetToPay = p.netCombinedDue ?? p.assignedShare;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900">
                        {p.memberName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatTk(p.assignedShare)}
                      </td>

                      {/* Meal Settlement Adjustment column */}
                      {includeMealAdjustment && (
                        <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                          {mealBal > 0.05 ? (
                            <span className="text-emerald-700 font-medium" title="Meal refund deducted as rent credit">
                              -{formatTk(mealBal)}
                            </span>
                          ) : mealBal < -0.05 ? (
                            <span className="text-rose-700 font-medium" title="Meal dues added to bill">
                              +{formatTk(Math.abs(mealBal))}
                            </span>
                          ) : (
                            <span className="text-slate-400">৳0.00</span>
                          )}
                        </td>
                      )}

                      {/* Net Combined Obligation to Pay */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 text-xs">
                        {formatTk(targetToPay)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                        {formatTk(p.paidAmount)}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                        p.balanceDue > 0 ? 'text-rose-700' : 'text-slate-400'
                      }`}>
                        {formatTk(p.balanceDue)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-semibold text-xs ${
                          isPaid
                            ? 'text-emerald-700'
                            : isPartial
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}>
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid</span>
                            </>
                          ) : isPartial ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Partial</span>
                            </>
                          ) : (
                            <span>Unpaid</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onQuickTogglePaid(p.memberId)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs'
                            }`}
                            title={isPaid ? 'Clear Payment' : `Pay Net Amount (${formatTk(targetToPay)})`}
                          >
                            {isPaid ? 'Clear' : 'Pay Full'}
                          </button>
                          <button
                            onClick={() => onOpenPaymentModal(p)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Record partial / custom payment with TrxID"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={2} className="py-3 px-3 font-bold">
                    Total
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                    {formatTk(summary.totalExpenses)}
                  </td>
                  {includeMealAdjustment && (
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatTk(summary.totalMealRefundsAdjustment)}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatTk(includeMealAdjustment ? summary.totalNetCombinedPayable : summary.totalExpenses)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    {formatTk(summary.totalPaid)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-rose-700">
                    {formatTk(summary.totalBalanceDue)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    <span className={summary.status === 'Fully Collected' ? 'text-emerald-700' : 'text-amber-700'}>
                      {summary.status}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
