import React, { useState, useMemo } from 'react';
import { 
  MemberSettlement, 
  MessSummary, 
  BazaarExpense, 
  DormitorySummary, 
  DormitoryMemberPayment, 
  DormitoryBillItem,
  AppTab 
} from '../types';
import { MetricCards } from './MetricCards';
import { AuditBanner } from './AuditBanner';
import { MessCashDisparityWidget } from './MessCashDisparityWidget';
import { formatTk, formatNumber } from '../utils/calculator';
import { 
  TrendingUp, 
  Receipt, 
  Users, 
  Building2, 
  ShoppingCart, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Share2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CreditCard,
  UtensilsCrossed,
  ShieldCheck,
  Check,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  summary: MessSummary;
  dormSummary: DormitorySummary;
  memberSettlements: MemberSettlement[];
  dormPayments: DormitoryMemberPayment[];
  dormBills: DormitoryBillItem[];
  expenses: BazaarExpense[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onToggleSettled: (id: string) => void;
  onOpenPrintSlip: (memberSettlement: MemberSettlement) => void;
  onOpenPdfReport: () => void;
  onOpenClearMonth: () => void;
  onOpenAddExpense: () => void;
  onOpenAddDeposit: () => void;
  onOpenWhatsApp: () => void;
  onTabChange: (tab: AppTab) => void;
  includeMealAdjustment: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  dormSummary,
  memberSettlements,
  dormPayments,
  dormBills,
  expenses,
  selectedMemberId,
  onSelectMember,
  onToggleSettled,
  onOpenPrintSlip,
  onOpenPdfReport,
  onOpenClearMonth,
  onOpenAddExpense,
  onOpenAddDeposit,
  onOpenWhatsApp,
  onTabChange,
  includeMealAdjustment,
}) => {
  const [memberFilter, setMemberFilter] = useState<'all' | 'due' | 'refund' | 'cleared'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Shopper rotation count
  const shopperCounts = useMemo(() => {
    const counts: Record<string, { count: number; spend: number; name: string }> = {};
    expenses.forEach((exp) => {
      if (!counts[exp.shopperName]) {
        counts[exp.shopperName] = { count: 0, spend: 0, name: exp.shopperName };
      }
      counts[exp.shopperName].count += 1;
      counts[exp.shopperName].spend += exp.shoppingExp;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [expenses]);

  // Combine settlement with dorm payment data for unified one-pay status
  const unifiedMembers = useMemo(() => {
    return memberSettlements.map((ms) => {
      const dp = dormPayments.find((p) => p.memberId === ms.member.id);
      const dormAssigned = dp?.assignedShare ?? dormSummary.perMemberShare;
      const dormPaid = dp?.paidAmount ?? 0;
      
      // Net combined calculation
      const mealBalance = ms.balance; // >0 is refund credit, <0 is due
      const netCombinedDue = includeMealAdjustment
        ? Math.max(0, dormAssigned - mealBalance)
        : dormAssigned;
      const netRemainingToPay = Math.max(0, netCombinedDue - dormPaid);

      return {
        ...ms,
        dormAssigned,
        dormPaid,
        dormStatus: dp?.status ?? 'Unpaid',
        netCombinedDue,
        netRemainingToPay,
      };
    });
  }, [memberSettlements, dormPayments, dormSummary, includeMealAdjustment]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return unifiedMembers.filter((m) => {
      const matchesSearch = m.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.member.room && m.member.room.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (memberFilter === 'cleared') return m.isSettled;
      if (memberFilter === 'due') return !m.isSettled && m.balance < 0;
      if (memberFilter === 'refund') return !m.isSettled && m.balance >= 0;
      return true;
    });
  }, [unifiedMembers, searchQuery, memberFilter]);

  // Recent 4 expenses
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 4);
  }, [expenses]);

  // Expense breakdown percentages
  const expenseBreakdown = useMemo(() => {
    const houseRent = dormBills.find(b => b.name.toLowerCase().includes('rent'))?.amount || 0;
    const bazaar = summary.totalShoppingExp;
    const utilitiesAndGas = (dormBills.find(b => b.name.toLowerCase().includes('gas'))?.amount || 0) +
      (dormBills.find(b => b.name.toLowerCase().includes('wifi') || b.name.toLowerCase().includes('internet'))?.amount || 0) +
      (dormBills.find(b => b.name.toLowerCase().includes('electricity'))?.amount || 0);
    const sharedDiningAndMaid = summary.totalDiningExp +
      (dormBills.find(b => b.name.toLowerCase().includes('khala') || b.name.toLowerCase().includes('cook'))?.amount || 0);

    const total = houseRent + bazaar + utilitiesAndGas + sharedDiningAndMaid;
    return {
      total,
      rent: { amount: houseRent, pct: total ? Math.round((houseRent / total) * 100) : 0 },
      bazaar: { amount: bazaar, pct: total ? Math.round((bazaar / total) * 100) : 0 },
      utilities: { amount: utilitiesAndGas, pct: total ? Math.round((utilitiesAndGas / total) * 100) : 0 },
      shared: { amount: sharedDiningAndMaid, pct: total ? Math.round((sharedDiningAndMaid / total) * 100) : 0 },
    };
  }, [dormBills, summary]);

  const toggleRowExpand = (id: string) => {
    setExpandedMemberId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Clean KPI Deck */}
      <MetricCards summary={summary} dormSummary={dormSummary} />

      {/* 2. Executive Status & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="grow">
          <AuditBanner summary={summary} onViewSettlement={() => onTabChange('settlement')} />
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 flex-wrap">
          {/* Download PDF All Sheets */}
          <button
            onClick={onOpenPdfReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF (All Sheets)</span>
          </button>

          {/* Start New Month / Clear */}
          <button
            onClick={onOpenClearMonth}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Start New Month</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Log Bazaar</span>
          </button>

          <button
            onClick={onOpenAddDeposit}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Deposit</span>
          </button>

          <button
            onClick={() => onTabChange('meals')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            <span>Log Meals</span>
          </button>

          <button
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Memo</span>
          </button>
        </div>
      </div>

      {/* 2.5 Mess Cash Reserve & Deposit vs Expense Disparity Reconciliation */}
      <MessCashDisparityWidget
        summary={summary}
        memberSettlements={memberSettlements}
        onOpenAddDeposit={onOpenAddDeposit}
        onOpenAddExpense={onOpenAddExpense}
        onViewSettlement={() => onTabChange('settlement')}
      />

      {/* 3. Balanced 2-Column Clean Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Primary: 7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Member Settlement & Balances Ledger */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
            {/* Header with Title and Filter controls */}
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Resident Accounts & Combined Net Settlement</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live balance combining mess meal balance with dormitory flat share.
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Accounting Rule: Only Mess Bazaar calculates Meal Rate. All other bills are shared split.</span>
                  </div>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search resident..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setMemberFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    memberFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All Residents ({unifiedMembers.length})
                </button>
                <button
                  onClick={() => setMemberFilter('due')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    memberFilter === 'due'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Due Payment ({unifiedMembers.filter(m => !m.isSettled && m.balance < 0).length})
                </button>
                <button
                  onClick={() => setMemberFilter('refund')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    memberFilter === 'refund'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Refund Credit ({unifiedMembers.filter(m => !m.isSettled && m.balance >= 0).length})
                </button>
                <button
                  onClick={() => setMemberFilter('cleared')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    memberFilter === 'cleared'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cleared ({unifiedMembers.filter(m => m.isSettled).length})
                </button>
              </div>
            </div>

            {/* Clean Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Resident</th>
                    <th className="py-2.5 px-3">Meals</th>
                    <th className="py-2.5 px-3">Meal Balance</th>
                    <th className="py-2.5 px-3">Flat Share</th>
                    <th className="py-2.5 px-3 font-bold text-slate-900">Net To Pay</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No residents match current search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const isExpanded = expandedMemberId === m.member.id;
                      const isRefund = m.balance >= 0;

                      return (
                        <React.Fragment key={m.member.id}>
                          <tr className={`hover:bg-slate-50/80 transition-colors ${
                            selectedMemberId === m.member.id ? 'bg-emerald-50/30' : ''
                          }`}>
                            {/* Resident name & avatar */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                                  style={{ backgroundColor: m.member.avatarColor }}
                                >
                                  {m.member.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                                    <span>{m.member.name}</span>
                                    {m.isSettled && (
                                      <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                        Cleared
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {m.member.room || 'Resident'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Total meals */}
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                              <span className="font-semibold text-slate-900">
                                {formatNumber(m.totalMeals, 1)}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">meals</span>
                            </td>

                            {/* Meal Balance */}
                            <td className="py-3 px-3 font-mono tabular-nums">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                                isRefund 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              }`}>
                                {isRefund ? `+${formatTk(m.balance)}` : formatTk(m.balance)}
                              </span>
                            </td>

                            {/* Dorm flat share */}
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                              {formatTk(m.dormAssigned)}
                            </td>

                            {/* Net combined to pay */}
                            <td className="py-3 px-3 font-mono tabular-nums">
                              {m.isSettled ? (
                                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>৳0.00</span>
                                </span>
                              ) : (
                                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {formatTk(m.netRemainingToPay)}
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => onToggleSettled(m.member.id)}
                                  title={m.isSettled ? 'Mark pending' : 'Mark cleared'}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    m.isSettled
                                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    onSelectMember(m.member.id);
                                    onOpenPrintSlip(m);
                                  }}
                                  title="Print Voucher Memo"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => toggleRowExpand(m.member.id)}
                                  title="Toggle details"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded inline drill-down drawer */}
                          {isExpanded && (
                            <tr className="bg-slate-50/70 border-y border-slate-200/60">
                              <td colSpan={6} className="py-3 px-5">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                                    <span className="text-[11px] text-slate-400 font-medium block">
                                      Mess Deposit Paid
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                                      {formatTk(m.totalDeposit)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Total deposited into mess
                                    </span>
                                  </div>

                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                                    <span className="text-[11px] text-slate-400 font-medium block">
                                      Total Mess Cost
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                                      {formatTk(m.totalCost)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                      {formatTk(m.mealCost)} bazaar meal + {formatTk(m.diningSplit)} other bills split
                                    </span>
                                  </div>

                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                                    <span className="text-[11px] text-slate-400 font-medium block">
                                      Bazaar Shopping Handled
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                                      {formatTk(m.bazaarSpendHandled)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {m.bazaarTrips} market trip(s)
                                    </span>
                                  </div>

                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                                    <span className="text-[11px] text-slate-400 font-medium block">
                                      Combined Due Calculation
                                    </span>
                                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                                      {formatTk(m.netRemainingToPay)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Flat ({formatTk(m.dormAssigned)}) - Refund ({formatTk(m.balance)})
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Card Footer with Quick Link to Hub */}
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">
                {summary.clearedCount} of {summary.activeMembersCount} accounts marked cleared
              </span>
              <button
                onClick={() => onTabChange('settlement')}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <span>Open Full Master Settlement Sheet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monthly Expenditure Allocation Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Household & Mess Monthly Expense Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combined flat budget: {formatTk(expenseBreakdown.total)} across 4 primary cost categories.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                {formatTk(expenseBreakdown.total)}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex my-3">
              <div 
                style={{ width: `${expenseBreakdown.rent.pct}%` }} 
                className="bg-indigo-600 transition-all" 
                title={`House Rent: ${expenseBreakdown.rent.pct}%`}
              />
              <div 
                style={{ width: `${expenseBreakdown.bazaar.pct}%` }} 
                className="bg-emerald-500 transition-all" 
                title={`Mess Bazaar: ${expenseBreakdown.bazaar.pct}%`}
              />
              <div 
                style={{ width: `${expenseBreakdown.shared.pct}%` }} 
                className="bg-amber-500 transition-all" 
                title={`Maid & Dining: ${expenseBreakdown.shared.pct}%`}
              />
              <div 
                style={{ width: `${expenseBreakdown.utilities.pct}%` }} 
                className="bg-cyan-500 transition-all" 
                title={`Utilities & Gas: ${expenseBreakdown.utilities.pct}%`}
              />
            </div>

            {/* Category breakdown pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[11px] block">House Rent ({expenseBreakdown.rent.pct}%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatTk(expenseBreakdown.rent.amount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Mess Bazaar ({expenseBreakdown.bazaar.pct}%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatTk(expenseBreakdown.bazaar.amount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Maid & Dining ({expenseBreakdown.shared.pct}%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatTk(expenseBreakdown.shared.amount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mt-1 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Gas & Utilities ({expenseBreakdown.utilities.pct}%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatTk(expenseBreakdown.utilities.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Secondary: 5 cols on lg, 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Dormitory Flat Bill Collection Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Dormitory Bill Collection</span>
              </h3>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {dormSummary.paidMembersCount}/{dormSummary.totalMembers} Paid
              </span>
            </div>

            {/* Progress Gauge */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">Collected Funds</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatTk(dormSummary.totalPaid)} / {formatTk(dormSummary.totalExpenses)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${dormSummary.totalExpenses > 0 ? (dormSummary.totalPaid / dormSummary.totalExpenses) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Mini roster of fixed bills */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              {dormBills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate">{bill.name}</span>
                  <span className="font-mono font-semibold text-slate-800">{formatTk(bill.amount)}</span>
                </div>
              ))}
              {dormBills.length > 4 && (
                <div className="text-[11px] text-slate-400 italic">
                  +{dormBills.length - 4} more bill items
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onTabChange('dormitory')}
                className="w-full py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage Dormitory Bills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Bazaar Activity (Clean Mini Ledger) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Recent Bazaar Activity</span>
              </h3>
              <button
                onClick={onOpenAddExpense}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                + Add Trip
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 truncate">
                        {exp.shopperName}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium truncate max-w-[100px]">
                        {exp.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{exp.date}</span>
                      {exp.remarks && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{exp.remarks}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900">
                      {formatTk(exp.shoppingExp)}
                    </div>
                    {exp.diningExp > 0 && (
                      <div className="text-[10px] text-blue-600 font-mono">
                        +{formatTk(exp.diningExp)} dining
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => onTabChange('bazaar')}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Bazaar Ledger ({expenses.length} trips)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Shopper Rotation Duty Leaderboard */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Bazaar Duty Rotation</span>
              </h3>
              <span className="text-[11px] text-slate-400">Monthly Trips</span>
            </div>

            <div className="space-y-2 mt-2">
              {shopperCounts.slice(0, 5).map((shopper, idx) => (
                <div key={shopper.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold font-mono text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 truncate">
                      {shopper.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                      {shopper.count} {shopper.count === 1 ? 'trip' : 'trips'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTk(shopper.spend)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
