import React, { useState } from 'react';
import { Member, BazaarExpense, ExpenseCategory } from '../../types';
import { X, ShoppingBag } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddExpense: (expense: Omit<BazaarExpense, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddExpense,
}) => {
  const [date, setDate] = useState<string>('2026-10-15');
  const [shopperId, setShopperId] = useState<string>(members[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('Mess Bazaar');
  const [shoppingExp, setShoppingExp] = useState<string>('');
  const [diningExp, setDiningExp] = useState<string>('0');
  const [remarks, setRemarks] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    // If selecting pure bill, automatically transfer shoppingExp to diningExp so user never accidentally inflates meal rate
    if (newCat === 'Utilities / Plumbing' || newCat === 'Internet / WiFi' || newCat === 'Cook / Maid Bill' || newCat === 'Dining / Feast') {
      if (parseFloat(shoppingExp) > 0 && (parseFloat(diningExp) === 0 || !diningExp)) {
        setDiningExp(shoppingExp);
        setShoppingExp('0');
      }
    } else if (newCat === 'Mess Bazaar') {
      if (parseFloat(diningExp) > 0 && (parseFloat(shoppingExp) === 0 || !shoppingExp)) {
        setShoppingExp(diningExp);
        setDiningExp('0');
      }
    }
  };

  const isPureBill = category === 'Utilities / Plumbing' || category === 'Internet / WiFi' || category === 'Cook / Maid Bill';
  const isPureBazaar = category === 'Mess Bazaar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shopper = members.find(m => m.id === shopperId);
    if (!shopper) return;

    // Enforce calculation rule: if pure bill, force shoppingExp to 0 so it never touches meal rate
    const finalShopping = isPureBill ? 0 : (parseFloat(shoppingExp) || 0);
    const finalDining = isPureBazaar ? 0 : (parseFloat(diningExp) || 0);

    onAddExpense({
      date,
      shopperId: shopper.id,
      shopperName: shopper.name,
      category,
      shoppingExp: finalShopping,
      diningExp: finalDining,
      remarks: remarks || `${category} purchase by ${shopper.name}`,
      ledgerTab: 'Bazaar Tab',
      auditStatus: 'Verified',
      receiptNo: receiptNo || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Log Mess Bazaar / Expense Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule Banner */}
        <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Accounting Rule Enforced:</span>
          </div>
          <p className="mt-0.5 text-[11px] text-emerald-800 leading-relaxed">
            • <strong>Mess Bazaar</strong> (food groceries, meat, fish, vegetables, rice, oil): Only this calculates the <strong>Meal Rate</strong>.<br/>
            • <strong>Other Bills</strong> (utilities, plumbing, gas, maid, wifi, repairs): Shared split equally among active members, <strong>never added to meal rate</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shopper / Spender (BazarKari)
              </label>
              <select
                value={shopperId}
                onChange={(e) => setShopperId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Category & Rule Destination
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="Mess Bazaar">🛒 Mess Bazaar (Food & Groceries) ➔ Calculates Meal Rate</option>
              <option value="Bazaar + Repair">🛒 Mess Bazaar + Minor Repair (Split)</option>
              <option value="Utilities / Plumbing">🔧 Utilities / Plumbing ➔ Other Bill (Shared Split)</option>
              <option value="Weekly Bazaar & Gas">🛒 Weekly Bazaar + Gas Cylinder (Split)</option>
              <option value="Emergency Grocery">🛒 Emergency Grocery ➔ Mess Bazaar (Meal Rate)</option>
              <option value="Month-End + Cutter Bill">🛒 Month-End Grocery + Cutter / Maid (Split)</option>
              <option value="Dining / Feast">🍽️ Special Dining / Feast ➔ Shared Split</option>
              <option value="Cook / Maid Bill">👩‍🍳 Cook / Maid Bill ➔ Other Bill (Shared Split)</option>
              <option value="Internet / WiFi">📶 Internet / WiFi ➔ Other Bill (Shared Split)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={isPureBill ? 'opacity-50' : ''}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mess Bazaar Amount (Tk)
                <span className="block text-[10px] font-semibold text-emerald-700">Calculates Meal Rate</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required={!isPureBill}
                disabled={isPureBill}
                value={shoppingExp}
                onChange={(e) => setShoppingExp(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono disabled:bg-slate-100"
              />
            </div>

            <div className={isPureBazaar ? 'opacity-50' : ''}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Other Bills / Shared Exp (Tk)
                <span className="block text-[10px] font-semibold text-blue-700">Split Equally (NOT in meal rate)</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                disabled={isPureBazaar}
                value={diningExp}
                onChange={(e) => setDiningExp(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Purpose / Items Bought
            </label>
            <input
              type="text"
              placeholder="e.g. Chicken (4kg), eggs, rice, potatoes, onions"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
