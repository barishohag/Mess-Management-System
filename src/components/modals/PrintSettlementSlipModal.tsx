import React from 'react';
import { MemberSettlement } from '../../types';
import { formatTk, formatNumber } from '../../utils/calculator';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface PrintSettlementSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: MemberSettlement | null;
  monthName: string;
  dormShare?: number;
}

export const PrintSettlementSlipModal: React.FC<PrintSettlementSlipModalProps> = ({
  isOpen,
  onClose,
  settlement,
  monthName,
  dormShare = 0,
}) => {
  const defaultMemberSignature = settlement
    ? ((settlement.member.name.toUpperCase() === 'RESIDENT 1' || settlement.member.id === 'm1')
        ? 'Resident 1'
        : settlement.member.name)
    : '';

  const [memberSigName, setMemberSigName] = React.useState(defaultMemberSignature);
  const [managerSigName, setManagerSigName] = React.useState('Audited & Approved');

  React.useEffect(() => {
    if (settlement) {
      setMemberSigName(
        (settlement.member.name.toUpperCase() === 'RESIDENT 1' || settlement.member.id === 'm1')
          ? 'Resident 1'
          : settlement.member.name
      );
    }
  }, [settlement]);

  if (!isOpen || !settlement) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSurplus = settlement.balance >= 0;
  const netOnePay = Math.max(0, dormShare - settlement.balance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Official Settlement Memo / Slip
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div className="mt-4 p-6 bg-slate-50/50 rounded-xl border border-slate-200 print:border print:p-8 print:m-0">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-800">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              Mess & Dormitory Combined Voucher
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated Meal Tracking, Bazaar Accounting & Dormitory Rent Settlement
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-200/80 text-slate-800 font-mono text-xs font-semibold">
              <span>Period: {monthName}</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Member Name:</span>
              <strong className="text-base text-slate-900">
                {settlement.member.name.toUpperCase() === 'RESIDENT 1' ? 'Resident 1' : settlement.member.name}
              </strong>
              <div className="text-slate-600 font-mono mt-0.5">
                {settlement.member.room || 'Resident Member'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Settlement Status:</span>
              <strong className={`text-sm ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {settlement.status}
              </strong>
              <div className="text-slate-600 font-mono mt-0.5">
                {settlement.isSettled ? '✔️ Fully Cleared' : '⏳ Pending Clearance'}
              </div>
            </div>
          </div>

          {/* Cost Computation Breakdown */}
          <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Meal Cost Breakdown (Mess Bazaar Only)
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Only Bazaar in Rate
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Meals Consumed:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatNumber(settlement.totalMeals, 1)} meals
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Active Meal Rate (Bazaar Only):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatTk(settlement.appliedMealRate)} / meal
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Meal Cost Subtotal (Bazaar Only):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatTk(settlement.mealCost)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Other Shared Bills Split (Shared Equally):</span>
              <span className="font-mono tabular-nums text-blue-700 font-semibold">
                {formatTk(settlement.diningSplit)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 font-bold text-slate-900 bg-slate-100/60 px-2 rounded">
              <span>Total Member Cost (Bazaar + Other Bills):</span>
              <span className="font-mono tabular-nums text-sm">
                {formatTk(settlement.totalCost)}
              </span>
            </div>
          </div>

          {/* Financial Reconciliation */}
          <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Meal Advance & Balance
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Advance Deposited:</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">
                {formatTk(settlement.totalDeposit)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Net Meal Standing:</span>
              <span className={`font-mono tabular-nums font-bold ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isSurplus ? `+${formatTk(settlement.balance)} (Refund Credit)` : `-${formatTk(Math.abs(settlement.balance))} (Meal Due)`}
              </span>
            </div>
          </div>

          {/* COMBINED ONE-PAY DORMITORY INTEGRATION */}
          <div className="py-4 border-b border-slate-200 space-y-2 text-xs bg-slate-100/80 -mx-6 px-6 sm:-mx-8 sm:px-8">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              Combined One-Pay Dormitory Settlement
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">Dormitory Flat Bill (Rent, Khala, Utilities):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatTk(dormShare)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">
                {isSurplus ? 'Meal Refund Deducted as Credit:' : 'Meal Dues Added to Bill:'}
              </span>
              <span className={`font-mono tabular-nums font-bold ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isSurplus ? `-${formatTk(settlement.balance)}` : `+${formatTk(Math.abs(settlement.balance))}`}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg font-bold text-sm bg-emerald-700 text-white shadow-xs">
              <span>Final Net Amount To Pay / Clear:</span>
              <span className="font-mono tabular-nums text-base">
                {formatTk(netOnePay)}
              </span>
            </div>
          </div>

          {/* Bazaar Handled note & Accounting Rule Policy */}
          <div className="py-2.5 px-3 my-2 bg-slate-100 rounded-lg text-[11px] text-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
            <span>Bazaar Handled: <strong>{settlement.bazaarTrips}</strong> trips ({formatTk(settlement.bazaarSpendHandled)})</span>
            <span className="font-semibold text-emerald-800">
              📌 Rule: Meal rate is calculated exclusively from Mess Bazaar. Other bills are shared split.
            </span>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-2 border-t border-slate-300 text-xs text-center">
            <div>
              <div className="border-t border-slate-400 pt-1.5 text-slate-600 font-medium">
                Member Signature
              </div>
              <input
                type="text"
                value={memberSigName}
                onChange={(e) => setMemberSigName(e.target.value)}
                placeholder="Member Signature"
                title="Click to edit member signature"
                className="text-[11px] text-slate-700 font-mono text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden w-full transition-colors print:border-none"
              />
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 text-slate-600 font-medium">
                Mess Manager Signature
              </div>
              <input
                type="text"
                value={managerSigName}
                onChange={(e) => setManagerSigName(e.target.value)}
                placeholder="Manager Signature"
                title="Click to edit manager signature"
                className="text-[11px] text-slate-700 font-mono text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden w-full transition-colors print:border-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
