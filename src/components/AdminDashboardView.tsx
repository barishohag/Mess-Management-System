import React, { useState } from 'react';
import { 
  Member, 
  BazaarExpense, 
  Deposit, 
  DailyMealRecord, 
  DormitoryBillItem, 
  DormitoryMemberPayment,
  MessSummary,
  MemberSettlement,
  DormitorySummary,
  AdminSession,
  AdminCredentials,
  AdminAuditLog
} from '../types';
import { 
  loginAdmin, 
  logoutAdmin, 
  getAdminCredentials, 
  saveAdminCredentials, 
  getAdminLogs, 
  logAdminAction, 
  DEFAULT_ADMIN_CREDENTIALS 
} from '../utils/adminAuth';
import { formatTk, formatNumber } from '../utils/calculator';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  LogOut, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  FileText, 
  Download, 
  Upload, 
  RotateCcw, 
  Sliders, 
  UserPlus, 
  Check, 
  Building2, 
  BadgeCheck, 
  History, 
  Save, 
  ExternalLink,
  FileArchive
} from 'lucide-react';

interface AdminDashboardViewProps {
  adminSession: AdminSession | null;
  onLoginSuccess: (session: AdminSession) => void;
  onLogout: () => void;
  members: Member[];
  expenses: BazaarExpense[];
  deposits: Deposit[];
  dailyMeals: DailyMealRecord[];
  dormBills: DormitoryBillItem[];
  dormPayments: DormitoryMemberPayment[];
  summary: MessSummary;
  dormSummary: DormitorySummary;
  memberSettlements: MemberSettlement[];
  activePeriod: string;
  onUpdateMembers: (members: Member[]) => void;
  onUpdateExpenses: (expenses: BazaarExpense[]) => void;
  onUpdateDeposits: (deposits: Deposit[]) => void;
  onUpdateSettledIds: (ids: Set<string>) => void;
  onUpdateDormPayments: (payments: DormitoryMemberPayment[]) => void;
  onOpenClearMonth: () => void;
  onOpenAddMember: () => void;
  onResetToTemplate: () => void;
  onRestoreData: (restored: any) => void;
  onSwitchTab: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminSession,
  onLoginSuccess,
  onLogout,
  members,
  expenses,
  deposits,
  dailyMeals,
  dormBills,
  dormPayments,
  summary,
  dormSummary,
  memberSettlements,
  activePeriod,
  onUpdateMembers,
  onUpdateExpenses,
  onUpdateDeposits,
  onUpdateSettledIds,
  onUpdateDormPayments,
  onOpenClearMonth,
  onOpenAddMember,
  onResetToTemplate,
  onRestoreData,
  onSwitchTab,
}) => {
  // Login Form States (when logged out)
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Sub-Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'roster' | 'audit' | 'security' | 'backup'>('roster');

  // Change Credentials Form States
  const [currentCreds, setCurrentCreds] = useState<AdminCredentials>(() => getAdminCredentials());
  const [newUserId, setNewUserId] = useState(currentCreds.userId);
  const [newDisplayName, setNewDisplayName] = useState(currentCreds.displayName);
  const [newPassword, setNewPassword] = useState(currentCreds.passwordHash);
  const [credsSuccessMsg, setCredsSuccessMsg] = useState('');

  // Editable Member State in Admin Roster
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Quick Action Alerts / Feedback
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showTemporaryNotice = (message: string, type: 'success' | 'info' = 'success') => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUserId.trim()) {
      setLoginError('Please enter your Admin User ID');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your Admin Password');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const res = loginAdmin(loginUserId, loginPassword);
      setIsLoggingIn(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session);
        setLoginUserId('');
        setLoginPassword('');
      } else {
        setLoginError(res.message || 'Invalid User ID or Password.');
      }
    }, 200);
  };

  const handleQuickFill = () => {
    const creds = getAdminCredentials();
    setLoginUserId(creds.userId);
    setLoginPassword(creds.passwordHash);
    setLoginError('');
  };

  // 2. Handle Change Admin Credentials
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    if (!newPassword.trim()) return;

    const updated: AdminCredentials = {
      ...currentCreds,
      userId: newUserId.trim(),
      displayName: newDisplayName.trim() || 'Mess Manager',
      passwordHash: newPassword.trim(),
      updatedAt: new Date().toISOString()
    };

    saveAdminCredentials(updated);
    setCurrentCreds(updated);
    setCredsSuccessMsg('Admin credentials updated successfully! Use these new details on your next login.');
    setTimeout(() => setCredsSuccessMsg(''), 4000);
  };

  const handleResetCredsToDefault = () => {
    if (window.confirm('Reset admin credentials to the configured environment values?')) {
      saveAdminCredentials(DEFAULT_ADMIN_CREDENTIALS);
      setCurrentCreds(DEFAULT_ADMIN_CREDENTIALS);
      setNewUserId(DEFAULT_ADMIN_CREDENTIALS.userId);
      setNewDisplayName(DEFAULT_ADMIN_CREDENTIALS.displayName);
      setNewPassword(DEFAULT_ADMIN_CREDENTIALS.passwordHash);
      showTemporaryNotice('Admin credentials reset to the configured environment values.');
    }
  };

  // 3. Member Roster Management
  const handleToggleMemberActive = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const nextState = !m.isActive;
        logAdminAction('Toggle Member Status', `${m.name} is now ${nextState ? 'Active' : 'Inactive'}`);
        return { ...m, isActive: nextState };
      }
      return m;
    });
    onUpdateMembers(updated);
    showTemporaryNotice('Member active status updated');
  };

  const handleStartEditMember = (m: Member) => {
    setEditingMemberId(m.id);
    setEditRoom(m.room || '');
    setEditPhone(m.phone || '');
  };

  const handleSaveMemberEdit = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          room: editRoom.trim() || undefined,
          phone: editPhone.trim() || undefined
        };
      }
      return m;
    });
    onUpdateMembers(updated);
    setEditingMemberId(null);
    logAdminAction('Update Member Info', `Updated contact & room for member ID ${memberId}`);
    showTemporaryNotice('Member details saved');
  };

  // 4. Financial Audit & Bulk Actions
  const handleVerifyAllExpenses = () => {
    const updated = expenses.map(e => ({ ...e, auditStatus: 'Verified' as const }));
    onUpdateExpenses(updated);
    logAdminAction('Audit Bazaar Expenses', `Verified all ${expenses.length} bazaar expenses`);
    showTemporaryNotice(`Verified all ${expenses.length} bazaar expense receipts!`);
  };

  const handleVerifyAllDeposits = () => {
    const updated = deposits.map(d => ({ ...d, verified: true }));
    onUpdateDeposits(updated);
    logAdminAction('Audit Member Deposits', `Verified all ${deposits.length} deposits`);
    showTemporaryNotice(`Verified all ${deposits.length} member deposits!`);
  };

  const handleSettleAllMembers = () => {
    const allIds = new Set(members.map(m => m.id));
    onUpdateSettledIds(allIds);
    logAdminAction('Settle Member Accounts', `Marked all ${members.length} members as settled`);
    showTemporaryNotice('All member meal accounts marked as cleared/settled.');
  };

  const handleResetAllSettlements = () => {
    onUpdateSettledIds(new Set());
    logAdminAction('Reset Settlements', 'Reset all member settlements to pending');
    showTemporaryNotice('All member settlements reset to pending.');
  };

  const handleMarkAllDormBillsPaid = () => {
    const updated = dormPayments.map(p => ({
      ...p,
      paidAmount: p.assignedShare,
      balanceDue: 0,
      status: 'Paid' as const,
      paymentDate: new Date().toISOString().split('T')[0]
    }));
    onUpdateDormPayments(updated);
    logAdminAction('Audit Dormitory Bills', 'Marked all member dormitory bills as paid');
    showTemporaryNotice('All dormitory bills marked as fully paid.');
  };

  // 5. Full System JSON Backup & Restore
  const handleDownloadFullBackup = () => {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      activePeriod,
      members,
      expenses,
      deposits,
      dailyMeals,
      dormBills,
      dormPayments,
      adminCredentials: {
        userId: currentCreds.userId,
        role: currentCreds.role,
        displayName: currentCreds.displayName
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download', 
      `mess_complete_admin_backup_${activePeriod.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAdminAction('Export System Backup', `Downloaded complete system JSON backup for ${activePeriod}`);
    showTemporaryNotice('System JSON backup generated and downloaded successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.expenses && parsed.deposits) {
          if (window.confirm(`Restore data from backup file (${parsed.activePeriod || 'Backup'})? Current unsaved entries will be overwritten.`)) {
            onRestoreData(parsed);
            logAdminAction('Restore System Backup', `Restored database from ${file.name}`);
            showTemporaryNotice('System successfully restored from JSON backup!');
          }
        } else {
          alert('Invalid backup file format. Expected mess members, expenses, and deposits schema.');
        }
      } catch (err) {
        alert('Could not parse JSON file. Please ensure it is a valid mess database backup.');
      }
    };
  };

  // -------------------------------------------------------------
  // VIEW A: If NOT Logged In — Render Admin Authentication Screen
  // -------------------------------------------------------------
  if (!adminSession) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Mess Management</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Admin Authentication Portal</span>
          </div>
          <button
            onClick={() => onSwitchTab('dashboard')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            ← Return to Member View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Login Dashboard</h1>
                <p className="text-xs text-slate-500">Sign in with User ID and Password to manage mess operations</p>
              </div>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="grow">
                  <div className="font-semibold">Authentication Failed</div>
                  <div>{loginError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4.5">
              {/* User ID Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin User ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginUserId}
                    onChange={(e) => setLoginUserId(e.target.value)}
                    placeholder="Enter User ID (e.g. admin)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Fill Default Password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Default Credentials Callout Bar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Pre-Configured Credentials</div>
                  <div className="text-slate-500 mt-0.5">
                    User: <strong className="text-slate-800 font-mono">{currentCreds.userId || 'Not configured'}</strong> · Pass: <strong className="text-slate-800 font-mono">{currentCreds.passwordHash ? 'Configured' : 'Not configured'}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  1-Click Fill
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Log In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Privilege & Overview Preview */}
          <div className="lg:col-span-5 space-y-4">
            {/* Privileges Checklist */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4">
                <BadgeCheck className="w-4 h-4" />
                <span>Admin & Manager Privileges</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Full Roster Control:</strong> Add new members, toggle active/inactive status, assign room numbers and phones.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Financial Audits:</strong> Bulk verify all bazaar receipts and member deposit transactions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Complete System Backup:</strong> Export and restore full JSON dumps of all mess and dormitory accounting records.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Period Reset & New Month:</strong> Archive current accounts and launch next month's fresh ledger with 1-click.</span>
                </li>
              </ul>
            </div>

            {/* Quick Mess Snapshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-xs space-y-2.5">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                Current Mess State Preview
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Active Month Period:</span>
                <span className="font-mono font-semibold text-slate-900">{activePeriod}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Total Registered Members:</span>
                <span className="font-mono font-semibold text-slate-900">{members.length} members ({members.filter(m => m.isActive).length} active)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Mess Cash in Hand:</span>
                <span className={`font-mono font-bold ${summary.cashReserveStatus === 'Deficit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatTk(summary.cashInHand)} ({summary.cashReserveStatus})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Active Meal Rate:</span>
                <span className="font-mono font-bold text-emerald-700">৳{summary.activeMealRate.toFixed(2)}/meal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: If LOGGED IN — Full Admin Management Hub
  // -------------------------------------------------------------
  const pendingBazaarCount = expenses.filter(e => e.auditStatus === 'Pending').length;
  const pendingDepositsCount = deposits.filter(d => !d.verified).length;
  const unsettledMembersCount = memberSettlements.filter(ms => !ms.isSettled).length;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
        </div>
      )}

      {/* Top Welcome Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight">{adminSession.displayName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {adminSession.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as User ID: <code className="text-emerald-300 font-mono font-bold">{adminSession.userId}</code> · Active Period: <span className="text-white font-medium">{activePeriod}</span>
            </p>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSwitchTab('dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Member View</span>
          </button>
          <button
            onClick={handleDownloadFullBackup}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => {
              logoutAdmin();
              onLogout();
            }}
            className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Members */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Roster & Rooms</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {members.filter(m => m.isActive).length} <span className="text-xs font-sans font-normal text-slate-500">/ {members.length} Total</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active meal-eating members</div>
        </div>

        {/* Card 2: Cash in Hand */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Mess Cash in Hand</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              summary.cashReserveStatus === 'Deficit' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {summary.cashReserveStatus}
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono ${
            summary.cashReserveStatus === 'Deficit' ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {formatTk(summary.cashInHand)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total Deposits minus Outflow</div>
        </div>

        {/* Card 3: Pending Audits */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending Receipts</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {pendingBazaarCount + pendingDepositsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {pendingBazaarCount} bazaar + {pendingDepositsCount} deposits unverified
          </div>
        </div>

        {/* Card 4: Active Rate */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Meal Rate</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Food Only</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            ৳{summary.activeMealRate.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Based on {formatNumber(summary.totalMeals)} total meals
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'roster', label: 'Member Roster & Rooms', icon: Users },
          { id: 'audit', label: 'Financial Audits & Bulk Actions', icon: CheckCircle2 },
          { id: 'security', label: 'Admin Security & Credentials', icon: Lock },
          { id: 'backup', label: 'Backup, Restore & New Month', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* SUB-TAB 1: Member Roster & Room Manager */}
      {/* ----------------------------------------------------------- */}
      {activeAdminTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Member Directory & Room Allocation</h2>
              <p className="text-xs text-slate-500">Manage member details, active meal status, room numbers and contact details</p>
            </div>
            <button
              onClick={onOpenAddMember}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">Active Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((m) => {
                  const isEditing = editingMemberId === m.id;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                            style={{ backgroundColor: m.avatarColor }}
                          >
                            {m.name.substring(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div>{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {m.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRoom}
                            onChange={(e) => setEditRoom(e.target.value)}
                            placeholder="Room No"
                            className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                          />
                        ) : (
                          <span className="font-medium text-slate-800">{m.room || 'Unassigned'}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Phone No"
                            className="w-32 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                          />
                        ) : (
                          <span>{m.phone || '—'}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleMemberActive(m.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            m.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                          <span>{m.isActive ? 'Active Member' : 'Inactive / Away'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {m.joinedDate || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveMemberEdit(m.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMemberId(null)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditMember(m)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                          >
                            Edit Room/Phone
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* SUB-TAB 2: Financial Audits & Bulk Operations */}
      {/* ----------------------------------------------------------- */}
      {activeAdminTab === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Bazaar & Deposit Audits */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center gap-2.5 mb-3 text-slate-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Bazaar Receipts & Deposits Audit</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Verify and approve shopping receipts and member deposit slips for official mess audit records.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Bazaar Shopping Receipts</div>
                    <div className="text-[11px] text-slate-500">
                      {pendingBazaarCount === 0 ? 'All receipts verified' : `${pendingBazaarCount} receipts awaiting verification`}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyAllExpenses}
                    disabled={pendingBazaarCount === 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Verify All Receipts
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Member Deposits</div>
                    <div className="text-[11px] text-slate-500">
                      {pendingDepositsCount === 0 ? 'All deposits verified' : `${pendingDepositsCount} deposits unverified`}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyAllDeposits}
                    disabled={pendingDepositsCount === 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Verify All Deposits
                  </button>
                </div>
              </div>
            </div>

            {/* Box 2: Settlement & Dues Bulk Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center gap-2.5 mb-3 text-slate-900 font-bold text-sm">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Settlements & Dormitory Bills Bulk Actions</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Batch-manage member clearance and flat dormitory bill payment status at month-end.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Member Meal Settlement Clearance</div>
                    <div className="text-[11px] text-slate-500">
                      {unsettledMembersCount === 0 ? 'All accounts marked cleared' : `${unsettledMembersCount} members pending`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSettleAllMembers}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Mark All Cleared
                    </button>
                    <button
                      onClick={handleResetAllSettlements}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Dormitory Bills Collection</div>
                    <div className="text-[11px] text-slate-500">
                      {dormSummary.paidMembersCount} of {dormSummary.totalMembers} members collected
                    </div>
                  </div>
                  <button
                    onClick={handleMarkAllDormBillsPaid}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mark All Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* SUB-TAB 3: Admin Security & Credentials Settings */}
      {/* ----------------------------------------------------------- */}
      {activeAdminTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Change Credentials Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex items-center gap-2.5 mb-4 text-slate-900 font-bold text-base">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>Update Admin User ID & Password</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Change the credentials required to log into this Admin Dashboard.
            </p>

            {credsSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{credsSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Manager Display Name
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Mess Manager"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Admin User ID (Login Username)
                </label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g. admin or manager"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Admin Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save New Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCredsToDefault}
                  className="text-xs text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
                >
                  Reset to Environment Values
                </button>
              </div>
            </form>
          </div>

          {/* Right: Security & Audit Activity Logs */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4 text-slate-900 font-bold text-base">
              <History className="w-5 h-5 text-slate-700" />
              <span>Admin Activity & Session Audit Log</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Live audit trail of logins, credential updates, and system data changes.
            </p>

            <div className="grow overflow-y-auto max-h-72 divide-y divide-slate-100 text-xs pr-1">
              {getAdminLogs().map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{log.action}</div>
                    <div className="text-[11px] text-slate-500">{log.details}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-medium">by {log.performedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* SUB-TAB 4: Data Backup, Restore & Month Clear */}
      {/* ----------------------------------------------------------- */}
      {activeAdminTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: JSON System Backup */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Export Database Backup</h3>
              <p className="text-xs text-slate-500 mb-4">
                Download a complete JSON database snapshot of all member records, daily meals, bazaar receipts, deposits, and flat bills.
              </p>
            </div>
            <button
              onClick={handleDownloadFullBackup}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Full JSON Backup</span>
            </button>
          </div>

          {/* Card 2: Restore JSON Backup */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Restore from Backup</h3>
              <p className="text-xs text-slate-500 mb-4">
                Upload a previously saved JSON database backup to restore all mess accounting records instantly.
              </p>
            </div>
            <label className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs text-center">
              <Upload className="w-4 h-4" />
              <span>Select Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Card 3: Download Complete Project ZIP (For Vercel/Local) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <FileArchive className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Project ZIP (Full Code)</h3>
              <p className="text-xs text-slate-500 mb-4">
                Download the complete codebase archive (.zip) with all Vite, React, TypeScript, and vercel.json files ready for upload or deployment.
              </p>
            </div>
            <a
              href="/mess-manager-project.zip"
              download="mess-manager-project.zip"
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs text-center"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download Project ZIP</span>
            </a>
          </div>

          {/* Card 4: Start New Month / Period Reset */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">New Month & Period Reset</h3>
              <p className="text-xs text-slate-500 mb-4">
                Launch a fresh month ledger, preserve active members, and clear old transactions with audit protection.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={onOpenClearMonth}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Start New Month & Clear Data</span>
              </button>
              <button
                onClick={onResetToTemplate}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
              >
                Reset to Default Demo Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
