import React from 'react';
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  Utensils, 
  UserPlus, 
  Building2, 
  FileText, 
  CalendarDays,
  ShieldCheck 
} from 'lucide-react';

interface QuickEntryMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'expense' | 'deposit' | 'meals' | 'member' | 'dormitory' | 'pdf' | 'clearmonth' | 'admin') => void;
}

export const QuickEntryMenuModal: React.FC<QuickEntryMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'admin' as const,
      title: 'Admin Login & Dashboard',
      desc: 'Manager security portal, audit receipts & mess controls',
      icon: ShieldCheck,
      color: 'bg-slate-900 text-white border-slate-800'
    },
    {
      id: 'pdf' as const,
      title: 'Download PDF (All Sheets)',
      desc: 'Print or export complete multi-sheet audited ledger PDF',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
    },
    {
      id: 'clearmonth' as const,
      title: 'Start New Month / Clear Data',
      desc: 'Archive month, reset meals, bazaar & payments for next period',
      icon: CalendarDays,
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      id: 'expense' as const,
      title: 'Log Bazaar Expense',
      desc: 'Record grocery bazaar or dining/shared utilities spend',
      icon: ShoppingBag,
      color: 'bg-slate-50 text-slate-800 border-slate-200'
    },
    {
      id: 'deposit' as const,
      title: 'Record Member Deposit',
      desc: 'Add cash or bKash/Nagad advance payment to mess fund',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'dormitory' as const,
      title: 'Dormitory Bills & Rent',
      desc: 'Track flat rent, gas, khala, WiFi, and electricity split',
      icon: Building2,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'meals' as const,
      title: 'Daily Meal Tracker',
      desc: 'Log today\'s breakfast, lunch, dinner, or guest meals',
      icon: Utensils,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'member' as const,
      title: 'Add New Member',
      desc: 'Add a new flatmate or boarder to the active mess roster',
      icon: UserPlus,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quick Actions & Menu
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onClose();
                  onSelectAction(act.id);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all hover:shadow-xs hover:scale-[1.01] cursor-pointer ${act.color}`}
              >
                <div className="p-2 rounded-lg bg-white shadow-2xs shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{act.title}</div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">{act.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
