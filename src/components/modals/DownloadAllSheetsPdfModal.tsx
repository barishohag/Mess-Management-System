import React, { useState } from 'react';
import { 
  Member, 
  MemberSettlement, 
  MessSummary, 
  DailyMealRecord, 
  BazaarExpense, 
  Deposit, 
  DormitoryBillItem, 
  DormitoryMemberPayment, 
  DormitorySummary 
} from '../../types';
import { formatTk, formatNumber } from '../../utils/calculator';
import { 
  Printer, 
  X, 
  Download, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  UtensilsCrossed, 
  ShoppingCart, 
  CreditCard,
  Scale
} from 'lucide-react';

interface DownloadAllSheetsPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: string;
  summary: MessSummary;
  dormSummary: DormitorySummary;
  memberSettlements: MemberSettlement[];
  dailyMeals: DailyMealRecord[];
  expenses: BazaarExpense[];
  deposits: Deposit[];
  dormBills: DormitoryBillItem[];
  dormPayments: DormitoryMemberPayment[];
  includeMealAdjustment: boolean;
  members: Member[];
}

export const DownloadAllSheetsPdfModal: React.FC<DownloadAllSheetsPdfModalProps> = ({
  isOpen,
  onClose,
  activePeriod,
  summary,
  dormSummary,
  memberSettlements,
  dailyMeals,
  expenses,
  deposits,
  dormBills,
  dormPayments,
  includeMealAdjustment,
  members,
}) => {
  // Configurable sections
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeSettlement, setIncludeSettlement] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeBazaar, setIncludeBazaar] = useState(true);
  const [includeDeposits, setIncludeDeposits] = useState(true);
  const [includeDormitory, setIncludeDormitory] = useState(true);

  // Signatures
  const [managerSigName, setManagerSigName] = useState('Resident 1');
  const [auditNotes, setAuditNotes] = useState(
    'Audited & Verified under standard mess constitution. All receipts matched with ledger records.'
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAll = (select: boolean) => {
    setIncludeSummary(select);
    setIncludeSettlement(select);
    setIncludeMeals(select);
    setIncludeBazaar(select);
    setIncludeDeposits(select);
    setIncludeDormitory(select);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Dialog Box */}
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Toolbar (Screen Only - Hidden during window.print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold">
                <FileText className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Download PDF — All Sheets Complete Audit Book
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Print or save high-fidelity vector PDF for all sheets: Settlement, Meals, Bazaar, Deposits & Dorm Flat Bills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options & Sheet Selection Bar (no-print) */}
        <div className="p-4 border-b border-slate-200 bg-white no-print space-y-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <span className="font-semibold text-slate-900">Select Sheets to Include:</span>
              <button
                onClick={() => handleSelectAll(true)}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Select All
              </button>
              <span>·</span>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Signatory Auditor:</span>
              <input
                type="text"
                value={managerSigName}
                onChange={(e) => setManagerSigName(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Manager / Auditor Name"
              />
            </div>
          </div>

          {/* Sheet Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeSummary ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>1. Executive Summary</span>
            </label>

            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeSettlement ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeSettlement}
                onChange={(e) => setIncludeSettlement(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>2. Member Settlement Ledger</span>
            </label>

            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeMeals ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeMeals}
                onChange={(e) => setIncludeMeals(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>3. Daily Meal Tracker</span>
            </label>

            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeBazaar ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeBazaar}
                onChange={(e) => setIncludeBazaar(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>4. Bazaar & Expenses</span>
            </label>

            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeDeposits ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeDeposits}
                onChange={(e) => setIncludeDeposits(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>5. Member Deposits</span>
            </label>

            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              includeDormitory ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <input
                type="checkbox"
                checked={includeDormitory}
                onChange={(e) => setIncludeDormitory(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>6. Dormitory Flat Bills</span>
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2 text-amber-800">
            <span className="font-bold">💡 How to save as PDF:</span>
            <span>Click <strong>"Print / Save as PDF"</strong> above. In the print dialog destination, select <strong>"Save as PDF"</strong> to download the document.</span>
          </div>
        </div>

        {/* PRINTABLE REPORT PREVIEW CONTAINER */}
        <div className="grow overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none">
            
            {/* ======================================================== */}
            {/* SHEET 1: EXECUTIVE AUDIT & FINANCIAL SUMMARY */}
            {/* ======================================================== */}
            {includeSummary && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-page print-force-break">
                {/* Official Sheet Header */}
                <div className="border-b-2 border-slate-800 pb-4 text-center">
                  <div className="inline-block px-3 py-1 bg-emerald-600 text-white font-extrabold text-sm rounded mb-1">
                    MESS MEAL MANAGEMENT SYSTEM
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Monthly Audit & Financial Executive Summary
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Automated Meal Tracking, Bazaar Accounting & Dormitory Flat Rent Settlement Report
                  </p>
                  <div className="mt-2.5 flex items-center justify-center gap-4 text-xs font-mono font-medium text-slate-700">
                    <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">
                      <strong>Audit Period:</strong> {activePeriod}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">
                      <strong>Date Generated:</strong> {currentDateFormatted}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded border border-emerald-200 font-semibold">
                      Status: Audited & Verified
                    </span>
                  </div>
                </div>

                {/* Key Financial Indicators Grid */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Section 1: Mess Dining & Meal Accounting Metrics
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Rule: Only Mess Bazaar in Meal Rate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500 font-medium">Mess Bazaar (Food)</div>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {formatTk(summary.totalShoppingExp)}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">Calculates Meal Rate</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500 font-medium">Other Shared Bills</div>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {formatTk(summary.totalDiningExp)}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-700 mt-0.5">Shared Split ({formatTk(summary.activeMembersCount > 0 ? summary.totalDiningExp / summary.activeMembersCount : 0)}/m)</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500 font-medium">Total Meals Consumed</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                        {formatNumber(summary.totalMeals, 1)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Breakfast + Lunch + Dinner + Guest</div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300">
                      <div className="text-emerald-800 font-semibold">Active Meal Rate</div>
                      <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">
                        {formatTk(summary.activeMealRate)}
                      </div>
                      <div className="text-[10px] text-emerald-800 font-semibold">Only Bazaar ÷ Total Meals</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500">Total Member Deposits</div>
                      <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
                        {formatTk(summary.totalDeposits)}
                      </div>
                      <div className="text-[10px] text-slate-400">Total collected into mess fund</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500">Total Mess Expenses</div>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {formatTk(summary.totalExpenses)}
                      </div>
                      <div className="text-[10px] text-slate-400">Shopping + Dining Utilities</div>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      summary.cashReserveStatus === 'Deficit' 
                        ? 'bg-rose-50 border-rose-300' 
                        : 'bg-emerald-50 border-emerald-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-semibold">Mess Cash in Hand</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          summary.cashReserveStatus === 'Deficit'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {summary.cashReserveStatus === 'Deficit' ? 'Deficit Shortfall' : 'Surplus Reserve'}
                        </span>
                      </div>
                      <div className={`text-base font-bold font-mono mt-0.5 ${
                        summary.cashReserveStatus === 'Deficit' ? 'text-rose-700' : 'text-emerald-800'
                      }`}>
                        {formatTk(summary.cashInHand)}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {formatNumber(summary.depositUtilizationRate, 1)}% of deposits spent
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dormitory Flat Section */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Section 2: Dormitory Shared Flat Bills Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="text-teal-800 font-medium">Total Flat Expenses</div>
                      <div className="text-base font-bold text-teal-950 font-mono mt-0.5">
                        {formatTk(dormSummary.totalExpenses)}
                      </div>
                      <div className="text-[10px] text-teal-700">House Rent, Gas, Maid, WiFi, Electricity</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500">Base Share / Member</div>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                        {formatTk(dormSummary.perMemberShare)}
                      </div>
                      <div className="text-[10px] text-slate-400">{dormSummary.totalMembers} Equal Shares</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-500">Total Collected So Far</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                        {formatTk(dormSummary.totalPaid)}
                      </div>
                      <div className="text-[10px] text-slate-400">{dormSummary.paidMembersCount} of {dormSummary.totalMembers} Paid</div>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="text-rose-800 font-medium">Remaining Due to Collect</div>
                      <div className="text-base font-bold text-rose-950 font-mono mt-0.5">
                        {formatTk(dormSummary.totalBalanceDue)}
                      </div>
                      <div className="text-[10px] text-rose-700 font-medium">Outstanding flat dues</div>
                    </div>
                  </div>
                </div>

                {/* Combined One-Pay Overview Banner */}
                {includeMealAdjustment && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>One-Pay Settlement Policy: Active</span>
                    </div>
                    <p className="text-slate-600">
                      Member meal surpluses (positive balances) are directly credited against their dormitory flat share, reducing the cash they need to pay.
                      Total meal refund credits applied: <strong>{formatTk(dormSummary.totalMealRefundsAdjustment)}</strong>.
                      Net combined payable to manager: <strong>{formatTk(dormSummary.totalNetCombinedPayable)}</strong>.
                    </p>
                  </div>
                )}

                {/* Audit & Certificate Signatures */}
                <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1">Auditor Note & Certification:</div>
                    <p className="text-slate-700 italic border-l-2 border-emerald-600 pl-2">
                      "{auditNotes}"
                    </p>
                  </div>
                  <div className="text-right flex flex-col justify-end items-end">
                    <div className="font-mono text-slate-900 font-bold text-sm tracking-tight border-b-2 border-slate-800 pb-1 w-48 text-center">
                      {managerSigName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 w-48 text-center uppercase tracking-wider font-semibold">
                      Chief Mess Manager & Auditor
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SHEET 2: MEMBER SETTLEMENT & ONE-PAY LEDGER */}
            {/* ======================================================== */}
            {includeSettlement && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-page print-force-break">
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded">
                      Sheet 2
                    </span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      Member Reconciliation & Master Settlement Sheet
                    </h2>
                    <p className="text-xs text-slate-600">
                      Period: {activePeriod} | Applied Meal Rate: <strong>{formatTk(summary.activeMealRate)}/meal</strong> (Mess Bazaar Only; all other bills shared split)
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-500">Active Members:</span>{' '}
                    <strong className="text-slate-900">{memberSettlements.length}</strong>
                  </div>
                </div>

                {/* Settlement Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-2 px-1.5 w-6 text-center">#</th>
                        <th className="py-2 px-2">Member Name</th>
                        <th className="py-2 px-1 text-center">Room</th>
                        <th className="py-2 px-1 text-right">Meals</th>
                        <th className="py-2 px-1.5 text-right" title="Food Bazaar only">Meal Cost (Bazaar)</th>
                        <th className="py-2 px-1.5 text-right" title="Other bills split equally">Other Bills (Split)</th>
                        <th className="py-2 px-1.5 text-right">Total Cost</th>
                        <th className="py-2 px-1.5 text-right">Deposit</th>
                        <th className="py-2 px-2 text-right">Meal Balance</th>
                        <th className="py-2 px-1.5 text-right">Dorm Share</th>
                        <th className="py-2 px-2 text-right bg-emerald-50/80">Net One-Pay</th>
                        <th className="py-2 px-2 text-center">Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {memberSettlements.map((ms, idx) => {
                        const dp = dormPayments.find(p => p.memberId === ms.member.id);
                        const dormShare = dp?.assignedShare ?? dormSummary.perMemberShare;
                        const netCombined = includeMealAdjustment
                          ? Math.max(0, dormShare - ms.balance)
                          : dormShare;

                        // Display name adjustment
                        const displayName = (ms.member.id === 'm1' || ms.member.name.toUpperCase() === 'RESIDENT 1')
                          ? 'Resident 1'
                          : ms.member.name;

                        const isSurplus = ms.balance >= 0;

                        return (
                          <tr key={ms.member.id} className="hover:bg-slate-50">
                            <td className="py-2 px-1 text-center text-slate-500 font-normal">{idx + 1}</td>
                            <td className="py-2 px-2 font-sans font-bold text-slate-900 whitespace-nowrap">
                              {displayName}
                            </td>
                            <td className="py-2 px-1 text-center text-slate-500 text-[10px] whitespace-nowrap">
                              {ms.member.room || '101'}
                            </td>
                            <td className="py-2 px-1 text-right text-slate-700">
                              {formatNumber(ms.totalMeals, 1)}
                            </td>
                            <td className="py-2 px-1.5 text-right text-slate-700">
                              {formatTk(ms.mealCost)}
                            </td>
                            <td className="py-2 px-1.5 text-right text-slate-600">
                              {formatTk(ms.diningSplit)}
                            </td>
                            <td className="py-2 px-1.5 text-right font-bold text-slate-900">
                              {formatTk(ms.totalCost)}
                            </td>
                            <td className="py-2 px-1.5 text-right text-blue-700 font-semibold">
                              {formatTk(ms.totalDeposit)}
                            </td>
                            <td className={`py-2 px-2 text-right font-bold ${
                              isSurplus ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {isSurplus ? `+${formatTk(ms.balance)}` : formatTk(ms.balance)}
                            </td>
                            <td className="py-2 px-1.5 text-right text-slate-700">
                              {formatTk(dormShare)}
                            </td>
                            <td className="py-2 px-2 text-right font-black text-slate-900 bg-emerald-50/50">
                              {formatTk(netCombined)}
                            </td>
                            <td className="py-2 px-2 text-center text-[10px] font-sans">
                              {displayName === 'Resident 1' ? (
                                <span className="font-semibold text-slate-800 italic">Resident 1</span>
                              ) : (
                                <span className="border-b border-dotted border-slate-400 inline-block w-16">&nbsp;</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold font-mono text-slate-900">
                        <td colSpan={3} className="py-2 px-2 text-center font-sans font-extrabold uppercase">
                          Totals
                        </td>
                        <td className="py-2 px-1 text-right">{formatNumber(summary.totalMeals, 1)}</td>
                        <td className="py-2 px-1.5 text-right">{formatTk(summary.totalShoppingExp)}</td>
                        <td className="py-2 px-1.5 text-right">{formatTk(summary.totalDiningExp)}</td>
                        <td className="py-2 px-1.5 text-right">{formatTk(summary.totalExpenses)}</td>
                        <td className="py-2 px-1.5 text-right text-blue-800">{formatTk(summary.totalDeposits)}</td>
                        <td className="py-2 px-2 text-right font-black">
                          {formatTk(summary.messCashBalance)}
                        </td>
                        <td className="py-2 px-1.5 text-right">{formatTk(dormSummary.totalExpenses)}</td>
                        <td className="py-2 px-2 text-right font-black text-emerald-900 bg-emerald-100">
                          {formatTk(dormSummary.totalNetCombinedPayable)}
                        </td>
                        <td className="py-2 px-2 text-center font-sans text-[10px]">Audited</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs pt-4 border-t border-slate-200">
                  <div className="text-slate-500">
                    Formula: Total Cost = (Meals × Rate) + Dining Split. Balance = Deposit - Total Cost.
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800">Approved by:</span>{' '}
                    <span className="font-mono font-bold text-slate-900">{managerSigName}</span>
                  </div>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SHEET 3: DAILY MEAL TRACKER LOG */}
            {/* ======================================================== */}
            {includeMeals && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-page print-force-break">
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded">
                      Sheet 3
                    </span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      Daily Meal Register & Consumption Matrix
                    </h2>
                    <p className="text-xs text-slate-600">
                      Period: {activePeriod} | Standard Meals: Breakfast (0.5), Lunch (1.0), Dinner (1.0)
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-500">Days Tracked:</span>{' '}
                    <strong className="text-slate-900">{dailyMeals.length} Days</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-1.5 px-2">Date</th>
                        {members.map(m => {
                          const dName = (m.id === 'm1' || m.name.toUpperCase() === 'RESIDENT 1') ? 'Resident 1' : m.name;
                          return (
                            <th key={m.id} className="py-1.5 px-1 text-center font-sans">
                              {dName.split(' ')[0]}
                            </th>
                          );
                        })}
                        <th className="py-1.5 px-2 text-right bg-slate-200 font-bold">Day Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {dailyMeals.map((dayRec) => {
                        let daySum = 0;
                        return (
                          <tr key={dayRec.date} className="hover:bg-slate-50">
                            <td className="py-1 px-2 font-medium text-slate-800 whitespace-nowrap">
                              {dayRec.date.split('-').slice(1).join('/')}
                            </td>
                            {members.map(m => {
                              const b = dayRec.members?.[m.id];
                              const memberTotal = b 
                                ? (Number(b.breakfast) || 0) + (Number(b.lunch) || 0) + (Number(b.dinner) || 0) + (Number(b.guest) || 0)
                                : 0;
                              daySum += memberTotal;
                              return (
                                <td key={m.id} className={`py-1 px-1 text-center ${
                                  memberTotal === 0 ? 'text-slate-300' : 'text-slate-800 font-medium'
                                }`}>
                                  {memberTotal > 0 ? formatNumber(memberTotal, 1) : '-'}
                                </td>
                              );
                            })}
                            <td className="py-1 px-2 text-right font-bold text-slate-900 bg-slate-50">
                              {formatNumber(daySum, 1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold font-mono text-slate-900">
                        <td className="py-2 px-2 font-sans font-extrabold uppercase">Total</td>
                        {members.map(m => {
                          const ms = memberSettlements.find(s => s.member.id === m.id);
                          return (
                            <td key={m.id} className="py-2 px-1 text-center font-black text-emerald-800">
                              {formatNumber(ms?.totalMeals || 0, 1)}
                            </td>
                          );
                        })}
                        <td className="py-2 px-2 text-right font-black text-emerald-900 bg-emerald-100">
                          {formatNumber(summary.totalMeals, 1)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SHEET 4: BAZAAR & EXPENSES REGISTER */}
            {/* ======================================================== */}
            {includeBazaar && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-page print-force-break">
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded">
                      Sheet 4
                    </span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      Bazaar Grocery & Shared Expense Register
                    </h2>
                    <p className="text-xs text-slate-600">
                      Period: {activePeriod} | Total Entries: {expenses.length} Receipts
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-500">Total Bazaar:</span>{' '}
                    <strong className="text-slate-900">{formatTk(summary.totalExpenses)}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Shopper Name</th>
                        <th className="py-2 px-2">Category</th>
                        <th className="py-2 px-2 text-right" title="Only Mess Bazaar calculates meal rate">Mess Bazaar [Meal Rate] (৳)</th>
                        <th className="py-2 px-2 text-right" title="Other bills split equally, not added to meal rate">Other Bills [Shared Split] (৳)</th>
                        <th className="py-2 px-2 text-right">Total (৳)</th>
                        <th className="py-2 px-2 text-center">Status</th>
                        <th className="py-2 px-2">Purchased Items / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 font-mono text-slate-600 whitespace-nowrap">{exp.date}</td>
                          <td className="py-1.5 px-2 font-semibold text-slate-900 whitespace-nowrap">
                            {(exp.shopperName.toUpperCase() === 'RESIDENT 1' || exp.shopperId === 'm1') ? 'Resident 1' : exp.shopperName}
                          </td>
                          <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap">{exp.category}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-medium text-slate-900">
                            {formatTk(exp.shoppingExp)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                            {exp.diningExp > 0 ? formatTk(exp.diningExp) : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                            {formatTk(exp.shoppingExp + exp.diningExp)}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {exp.auditStatus}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-slate-600 text-xs truncate max-w-xs">{exp.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold font-mono text-slate-900">
                        <td colSpan={3} className="py-2 px-2 font-sans font-extrabold uppercase">Total Expenses</td>
                        <td className="py-2 px-2 text-right text-emerald-900">{formatTk(summary.totalShoppingExp)}</td>
                        <td className="py-2 px-2 text-right text-blue-900">{formatTk(summary.totalDiningExp)}</td>
                        <td className="py-2 px-2 text-right font-black text-slate-900">{formatTk(summary.totalExpenses)}</td>
                        <td colSpan={2} className="py-2 px-2 text-slate-600 text-[10px] font-sans font-medium">
                          Rule: Only Mess Bazaar calculates Meal Rate; Other bills are shared split equally.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SHEET 5: MEMBER MESS DEPOSITS */}
            {/* ======================================================== */}
            {includeDeposits && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-page print-force-break">
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded">
                      Sheet 5
                    </span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      Member Mess Fund Deposit & Advance Register
                    </h2>
                    <p className="text-xs text-slate-600">
                      Period: {activePeriod} | Cash & Mobile Financial Service Deposits
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-500">Total Fund:</span>{' '}
                    <strong className="text-blue-800">{formatTk(summary.totalDeposits)}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Member Name</th>
                        <th className="py-2 px-2">Payment Method</th>
                        <th className="py-2 px-2">Transaction ID / Ref</th>
                        <th className="py-2 px-2 text-center">Status</th>
                        <th className="py-2 px-2 text-right">Amount (৳)</th>
                        <th className="py-2 px-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {deposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 text-slate-600">{dep.date}</td>
                          <td className="py-1.5 px-2 font-sans font-bold text-slate-900">
                            {(dep.memberName.toUpperCase() === 'RESIDENT 1' || dep.memberId === 'm1') ? 'Resident 1' : dep.memberName}
                          </td>
                          <td className="py-1.5 px-2 font-sans text-slate-700">{dep.paymentMethod}</td>
                          <td className="py-1.5 px-2 text-slate-500 text-[10px]">{dep.trxId || 'N/A'}</td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              {dep.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-blue-800">
                            {formatTk(dep.amount)}
                          </td>
                          <td className="py-1.5 px-2 font-sans text-slate-600 text-xs">{dep.remarks || 'Advance deposit'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold font-mono text-slate-900">
                        <td colSpan={5} className="py-2 px-2 font-sans font-extrabold uppercase">Total Verified Deposits</td>
                        <td className="py-2 px-2 text-right text-blue-900 font-black">{formatTk(summary.totalDeposits)}</td>
                        <td className="py-2 px-2 text-slate-500 text-[10px] font-sans">Credited against meal costs</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* SHEET 6: DORMITORY FLAT BILLS & MEMBER REGISTER */}
            {/* ======================================================== */}
            {includeDormitory && (
              <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:break-after-avoid">
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded">
                      Sheet 6
                    </span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      Dormitory Monthly Flat Bills & Collection Register
                    </h2>
                    <p className="text-xs text-slate-600">
                      Period: {activePeriod} | Base Rent Share: {formatTk(dormSummary.perMemberShare)} / member
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-500">Total Flat Cost:</span>{' '}
                    <strong className="text-teal-900">{formatTk(dormSummary.totalExpenses)}</strong>
                  </div>
                </div>

                {/* Sub-table A: Flat Bills Breakdown */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Flat Monthly Shared Bills Breakdown
                  </h4>
                  <table className="w-full text-left border-collapse text-[11px] mb-2">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-semibold">
                        <th className="py-1.5 px-2">Expense Item</th>
                        <th className="py-1.5 px-2">Due Date</th>
                        <th className="py-1.5 px-2">Vendor Notes</th>
                        <th className="py-1.5 px-2 text-right">Amount (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {dormBills.map(b => (
                        <tr key={b.id}>
                          <td className="py-1.5 px-2 font-sans font-bold text-slate-900">{b.name}</td>
                          <td className="py-1.5 px-2 text-slate-600">{b.dueDate || '5th of month'}</td>
                          <td className="py-1.5 px-2 font-sans text-slate-500 text-xs">{b.vendorNotes || '-'}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-slate-900">{formatTk(b.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-700 bg-slate-100 font-bold font-mono">
                        <td colSpan={3} className="py-1.5 px-2 font-sans uppercase">Total Flat Expenses</td>
                        <td className="py-1.5 px-2 text-right font-black text-teal-950">{formatTk(dormSummary.totalExpenses)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Sub-table B: Member Collection Register */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Member Flat Share & Collection Register
                  </h4>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-2 px-1 text-center">#</th>
                        <th className="py-2 px-2">Member Name</th>
                        <th className="py-2 px-2 text-right">Base Share</th>
                        {includeMealAdjustment && (
                          <th className="py-2 px-2 text-right">Meal Credit/Due</th>
                        )}
                        <th className="py-2 px-2 text-right bg-emerald-50">Net Payable</th>
                        <th className="py-2 px-2 text-right">Paid Amount</th>
                        <th className="py-2 px-2 text-right">Balance Due</th>
                        <th className="py-2 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {dormPayments.map((p, idx) => {
                        const displayName = (p.memberName.toUpperCase() === 'RESIDENT 1' || p.memberId === 'm1')
                          ? 'Resident 1'
                          : p.memberName;
                        const netPayable = p.netCombinedDue ?? p.assignedShare;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-1.5 px-1 text-center text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-900">{displayName}</td>
                            <td className="py-1.5 px-2 text-right text-slate-700">{formatTk(p.assignedShare)}</td>
                            {includeMealAdjustment && (
                              <td className="py-1.5 px-2 text-right text-xs">
                                {p.mealBalance && p.mealBalance > 0 ? (
                                  <span className="text-emerald-700 font-semibold">-{formatTk(p.mealBalance)} (Credit)</span>
                                ) : p.mealBalance && p.mealBalance < 0 ? (
                                  <span className="text-rose-700 font-semibold">+{formatTk(Math.abs(p.mealBalance))} (Due)</span>
                                ) : (
                                  <span className="text-slate-400">৳0.00</span>
                                )}
                              </td>
                            )}
                            <td className="py-1.5 px-2 text-right font-black text-slate-900 bg-emerald-50/50">
                              {formatTk(netPayable)}
                            </td>
                            <td className="py-1.5 px-2 text-right text-emerald-700 font-bold">
                              {formatTk(p.paidAmount)}
                            </td>
                            <td className={`py-1.5 px-2 text-right font-bold ${
                              p.balanceDue > 0 ? 'text-rose-700' : 'text-slate-400'
                            }`}>
                              {formatTk(p.balanceDue)}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                p.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'Partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold font-mono text-slate-900">
                        <td colSpan={2} className="py-2 px-2 font-sans font-extrabold uppercase">Totals</td>
                        <td className="py-2 px-2 text-right">{formatTk(dormSummary.totalExpenses)}</td>
                        {includeMealAdjustment && (
                          <td className="py-2 px-2 text-right text-xs text-slate-700">
                            {formatTk(dormSummary.totalMealRefundsAdjustment)}
                          </td>
                        )}
                        <td className="py-2 px-2 text-right font-black text-emerald-900 bg-emerald-100">
                          {formatTk(dormSummary.totalNetCombinedPayable)}
                        </td>
                        <td className="py-2 px-2 text-right text-emerald-800 font-black">
                          {formatTk(dormSummary.totalPaid)}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-800 font-black">
                          {formatTk(dormSummary.totalBalanceDue)}
                        </td>
                        <td className="py-2 px-2 text-center font-sans text-[10px]">
                          {dormSummary.paidMembersCount}/{dormSummary.totalMembers} Paid
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Final Auditor Sign-Off Footer on Last Sheet */}
                <div className="mt-8 pt-6 border-t border-slate-300 flex items-end justify-between text-xs">
                  <div>
                    <div className="text-slate-500 font-medium">Record Verification:</div>
                    <div className="text-slate-700 font-mono text-[11px] mt-0.5">
                      System Generated Master Ledger · Mess Meal Management System
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-slate-900 font-bold text-sm border-b-2 border-slate-800 pb-1 w-48 text-center">
                      {managerSigName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 w-48 text-center uppercase tracking-wider font-semibold">
                      Audited & Signed by
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
