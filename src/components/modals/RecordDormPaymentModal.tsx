import React, { useState, useEffect } from 'react';
import { DormitoryMemberPayment, PaymentMethod } from '../../types';
import { formatTk } from '../../utils/calculator';
import { X, CreditCard, Sparkles, Check } from 'lucide-react';

interface RecordDormPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: DormitoryMemberPayment | null;
  onSavePayment: (memberId: string, paidAmount: number, method?: PaymentMethod, trxId?: string) => void;
}

export const RecordDormPaymentModal: React.FC<RecordDormPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSavePayment,
}) => {
  const targetNet = payment ? (payment.netCombinedDue ?? payment.assignedShare) : 0;
  const [amount, setAmount] = useState<string>(
    payment && payment.paidAmount > 0 ? payment.paidAmount.toString() : targetNet.toString()
  );
  const [method, setMethod] = useState<PaymentMethod>(payment?.paymentMethod || 'bKash');
  const [trxId, setTrxId] = useState<string>(payment?.trxId || '');

  useEffect(() => {
    if (payment) {
      const net = payment.netCombinedDue ?? payment.assignedShare;
      setAmount(payment.paidAmount > 0 ? payment.paidAmount.toString() : net.toString());
      setMethod(payment.paymentMethod || 'bKash');
      setTrxId(payment.trxId || '');
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = parseFloat(amount) || 0;
    onSavePayment(payment.memberId, paid, method, trxId || undefined);
    onClose();
  };

  const handleSetAmount = (val: number) => {
    setAmount(val.toString());
  };

  const mealBal = payment.mealBalance || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Record Combined Bill Payment
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Member Card & Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Member:</span>
              <strong className="text-sm font-bold text-slate-900">{payment.memberName}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Base Flat Rent & Utilities:</span>
              <span className="font-mono tabular-nums font-semibold">{formatTk(payment.assignedShare)}</span>
            </div>

            {Math.abs(mealBal) > 0.05 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">
                  {mealBal > 0 ? 'Meal Settlement Credit (Refund):' : 'Meal Settlement Deficit (Due):'}
                </span>
                <span className={`font-mono tabular-nums font-bold ${mealBal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {mealBal > 0 ? `-${formatTk(mealBal)}` : `+${formatTk(Math.abs(mealBal))}`}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
              <span className="flex items-center gap-1 text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Net One-Pay Payable:</span>
              </span>
              <span className="font-mono tabular-nums text-sm font-extrabold text-emerald-800">
                {formatTk(targetNet)}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetAmount(targetNet)}
              className="grow py-1.5 px-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Net One-Pay ({formatTk(targetNet)})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetAmount(payment.assignedShare)}
              className="py-1.5 px-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Rent Only ({formatTk(payment.assignedShare)})
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (Tk)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                TrxID / Reference
              </label>
              <input
                type="text"
                placeholder="BK10294..."
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
