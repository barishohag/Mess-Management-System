import React from 'react';
import { AppTab, AdminSession } from '../types';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  CreditCard, 
  Scale, 
  Plus, 
  Share2, 
  Download, 
  Building2, 
  FileText,
  CalendarDays,
  ShieldCheck,
  Lock,
  FileArchive
} from 'lucide-react';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onQuickAction: () => void;
  onOpenWhatsApp: () => void;
  onExportCSV: () => void;
  onOpenPdfReport: () => void;
  onOpenClearMonth: () => void;
  onOpenGitHub: () => void;
  activePeriod: string;
  adminSession: AdminSession | null;
  onOpenAdminLogin: () => void;
}

// GitHub SVG Icon
const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onQuickAction,
  onOpenWhatsApp,
  onExportCSV,
  onOpenPdfReport,
  onOpenClearMonth,
  onOpenGitHub,
  activePeriod,
  adminSession,
  onOpenAdminLogin,
}) => {
  const navItems: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals', label: 'Meal Tracker', icon: UtensilsCrossed },
    { id: 'bazaar', label: 'Bazaar & Expenses', icon: ShoppingCart },
    { id: 'deposits', label: 'Deposits', icon: CreditCard },
    { id: 'dormitory', label: 'Dormitory Bills', icon: Building2 },
    { id: 'settlement', label: 'Member Settlement', icon: Scale },
    { id: 'admin', label: 'Admin Hub', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark & Period with quick Month Clear trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ৳
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Mess Meal Management System
              </span>
              <button
                onClick={onOpenClearMonth}
                title="Click to Start New Month or Clear Ledger"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-700 font-mono tracking-tight transition-colors group cursor-pointer text-left"
              >
                <span>{activePeriod}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-rose-600 font-sans font-semibold border-b border-dotted border-slate-300 group-hover:border-rose-400">
                  (New Month?)
                </span>
              </button>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAdminTab = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                    isActive
                      ? isAdminTab
                        ? 'text-slate-900 bg-slate-100 font-bold shadow-xs'
                        : 'text-emerald-700 bg-emerald-50/80 font-semibold shadow-xs'
                      : isAdminTab && adminSession
                        ? 'text-emerald-700 hover:bg-emerald-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? (isAdminTab ? 'text-slate-900' : 'text-emerald-600') 
                      : (isAdminTab ? 'text-emerald-600' : 'text-slate-400')
                  }`} />
                  <span>{item.label}</span>
                  {isAdminTab && adminSession && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions including PDF download, Monthly Clear, WhatsApp, CSV, GitHub, Admin Login */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Admin Login / Session Quick Trigger */}
            {adminSession ? (
              <button
                onClick={() => onTabChange('admin')}
                title={`Logged in as ${adminSession.displayName} (${adminSession.userId}). Click to open Admin Hub.`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] hidden sm:inline">{adminSession.userId}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                title="Admin Login — Sign in with User ID & Password"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Download PDF All Sheets Button */}
            <button
              onClick={onOpenPdfReport}
              title="Download PDF — All Sheets Complete Audit Book"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              aria-label="Download PDF All Sheets"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline text-xs font-semibold">PDF</span>
            </button>

            {/* Download Project ZIP */}
            <a
              href="/mess-manager-project.zip"
              download="mess-manager-project.zip"
              title="Download Project ZIP — Complete source code for Vercel/Local deployment"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              aria-label="Download Project ZIP"
            >
              <FileArchive className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline text-xs font-semibold">ZIP</span>
            </a>

            {/* Clear Month / Start New Month Button */}
            <button
              onClick={onOpenClearMonth}
              title="End of Month? Start New Month & Clear Data"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              aria-label="Start New Month"
            >
              <CalendarDays className="w-4 h-4 text-rose-500" />
              <span className="hidden xl:inline text-xs font-semibold">New Month</span>
            </button>

            {/* GitHub */}
            <button
              onClick={onOpenGitHub}
              title="Connect GitHub / Export Code"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              aria-label="Connect GitHub"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="text-xs font-semibold">GitHub</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={onOpenWhatsApp}
              title="Share WhatsApp Summary"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="WhatsApp Summary"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* CSV */}
            <button
              onClick={onExportCSV}
              title="Export CSV Ledger"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onQuickAction}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Entry</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
