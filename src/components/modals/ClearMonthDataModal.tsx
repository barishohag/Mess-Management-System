import React, { useState } from 'react';
import { 
  Member, 
  BazaarExpense, 
  Deposit, 
  DailyMealRecord, 
  DormitoryBillItem, 
  DormitoryMemberPayment, 
  MemberSettlement, 
  MessSummary, 
  DormitorySummary 
} from '../../types';
import { 
  Calendar, 
  RotateCcw, 
  X, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  UtensilsCrossed, 
  ShoppingCart, 
  CreditCard, 
  Building2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export interface ClearMonthConfig {
  newPeriodName: string;
  daysInNewMonth: number;
  clearMeals: boolean;
  clearExpenses: boolean;
  clearDeposits: boolean;
  resetDormPayments: boolean;
  keepDormBills: boolean;
  keepMembers: boolean;
  carryForwardBalances: boolean;
}

interface ClearMonthDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriod: string;
  members: Member[];
  expenses: BazaarExpense[];
  deposits: Deposit[];
  dailyMeals: DailyMealRecord[];
  dormBills: DormitoryBillItem[];
  dormPayments: DormitoryMemberPayment[];
  memberSettlements: MemberSettlement[];
  summary: MessSummary;
  dormSummary: DormitorySummary;
  onConfirmClearMonth: (config: ClearMonthConfig) => void;
  onOpenPdfReport: () => void;
}

export const ClearMonthDataModal: React.FC<ClearMonthDataModalProps> = ({
  isOpen,
  onClose,
  currentPeriod,
  members,
  expenses,
  deposits,
  dailyMeals,
  dormBills,
  dormPayments,
  memberSettlements,
  summary,
  dormSummary,
  onConfirmClearMonth,
  onOpenPdfReport,
}) => {
  // Suggest next month
  const suggestNextPeriod = (current: string) => {
    if (current.includes('October')) return 'November 2026';
    if (current.includes('November')) return 'December 2026';
    if (current.includes('December')) return 'January 2027';
    if (current.includes('January')) return 'February 2027';
    if (current.includes('February')) return 'March 2027';
    if (current.includes('March')) return 'April 2027';
    if (current.includes('April')) return 'May 2027';
    if (current.includes('May')) return 'June 2027';
    if (current.includes('June')) return 'July 2027';
    if (current.includes('July')) return 'August 2027';
    if (current.includes('August')) return 'September 2027';
    if (current.includes('September')) return 'October 2027';
    return 'Next Month 2026';
  };

  const [newPeriodName, setNewPeriodName] = useState(() => suggestNextPeriod(currentPeriod));
  const [daysInNewMonth, setDaysInNewMonth] = useState<number>(30);

  // Checkboxes
  const [clearMeals, setClearMeals] = useState(true);
  const [clearExpenses, setClearExpenses] = useState(true);
  const [clearDeposits, setClearDeposits] = useState(true);
  const [resetDormPayments, setResetDormPayments] = useState(true);
  const [keepDormBills, setKeepDormBills] = useState(true);
  const [keepMembers, setKeepMembers] = useState(true);
  const [carryForwardBalances, setCarryForwardBalances] = useState(false);

  // Confirmation safeguard
  const [confirmedSafe, setConfirmedSafe] = useState(false);
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);

  if (!isOpen) return null;

  // Handle JSON backup download
  const handleDownloadBackup = () => {
    const backupData = {
      period: currentPeriod,
      exportedAt: new Date().toISOString(),
      app: 'Mess Meal Management System',
      members,
      expenses,
      deposits,
      dailyMeals,
      dormBills,
      dormPayments,
      settlements: memberSettlements,
      summary,
      dormSummary,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `mess_backup_${currentPeriod.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setHasDownloadedBackup(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) return;

    onConfirmClearMonth({
      newPeriodName: newPeriodName.trim(),
      daysInNewMonth,
      clearMeals,
      clearExpenses,
      clearDeposits,
      resetDormPayments,
      keepDormBills,
      keepMembers,
      carryForwardBalances,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Monthly Rollover & Clear Data
              </h3>
              <p className="text-xs text-slate-500">
                Close current month ({currentPeriod}) & initialize fresh monthly ledger.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* STEP 1: Backup Recommendation Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Step 1: Save Backup Before Clearing</span>
              </div>
              {hasDownloadedBackup && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Backup Saved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              We strongly advise downloading a full JSON or PDF backup of <strong>{currentPeriod}</strong> so you can always review or restore past accounting records.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPdfReport();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Download All Sheets PDF</span>
              </button>
            </div>
          </div>

          {/* STEP 2: Configure New Month Period */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step 2: New Month Period Details
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Accounting Period Name
              </label>
              <input
                type="text"
                required
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
                placeholder="e.g. November 2026 or Nov - Dec 2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              />
              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-500">Suggestions:</span>
                {['November 2026', 'December 2026', 'January 2027', 'Next Month'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNewPeriodName(name)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Days in New Month Calendar
              </label>
              <div className="flex items-center gap-2">
                {[28, 29, 30, 31].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDaysInNewMonth(days)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      daysInNewMonth === days
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Granular Clearing Options */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Step 3: Select What to Clear vs Keep
            </div>

            {/* Clear Meals */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={clearMeals}
                onChange={(e) => setClearMeals(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Clear Daily Meals Log</span>
                <p className="text-slate-500 text-[11px]">
                  Resets meal tracker for all members to 0 for {daysInNewMonth} fresh days in the new month.
                </p>
              </div>
            </label>

            {/* Clear Expenses */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExpenses}
                onChange={(e) => setClearExpenses(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Clear Bazaar & Grocery Receipts</span>
                <p className="text-slate-500 text-[11px]">
                  Removes current month's {expenses.length} bazaar receipts to start fresh expense tracking.
                </p>
              </div>
            </label>

            {/* Clear Deposits */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={clearDeposits}
                onChange={(e) => setClearDeposits(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Clear Member Deposits Ledger</span>
                <p className="text-slate-500 text-[11px]">
                  Resets advance mess fund deposits to ৳0 so members can deposit for the new month.
                </p>
              </div>
            </label>

            {/* Reset Dorm Payments */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={resetDormPayments}
                onChange={(e) => setResetDormPayments(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Reset Dormitory Member Payment Status</span>
                <p className="text-slate-500 text-[11px]">
                  Sets all roommate rent statuses to "Unpaid" with ৳0 paid for the new month flat rent collection.
                </p>
              </div>
            </label>

            {/* Retain Active Members */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer">
              <input
                type="checkbox"
                checked={keepMembers}
                onChange={(e) => setKeepMembers(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-emerald-950">Retain All Active Members (Recommended)</span>
                <p className="text-emerald-700 text-[11px]">
                  Keeps the {members.length} roommates (Resident 1, Residents, etc.) so you don't have to re-enter names and rooms.
                </p>
              </div>
            </label>

            {/* Keep Dorm Bills Structure */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-50 cursor-pointer">
              <input
                type="checkbox"
                checked={keepDormBills}
                onChange={(e) => setKeepDormBills(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-teal-950">Keep Flat Expense Items Structure</span>
                <p className="text-teal-700 text-[11px]">
                  Preserves standard flat items (House Rent, Gas, WiFi, Khala Bill, Electricity) with current amounts.
                </p>
              </div>
            </label>

            {/* Carry Forward Balances */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer">
              <input
                type="checkbox"
                checked={carryForwardBalances}
                onChange={(e) => setCarryForwardBalances(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-indigo-950">Carry Forward Previous Month Balances</span>
                <p className="text-indigo-700 text-[11px]">
                  Automatically adds members' surplus refunds as opening deposits, and carries forward unpaid dues into the new month.
                </p>
              </div>
            </label>
          </div>

          {/* Safeguard Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={confirmedSafe}
                onChange={(e) => setConfirmedSafe(e.target.checked)}
                className="rounded text-rose-600 focus:ring-0"
              />
              <span>I understand this will archive current month data and start {newPeriodName}.</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!confirmedSafe}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                confirmedSafe
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Data & Start {newPeriodName}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
