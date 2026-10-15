import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AppTab, 
  Member, 
  BazaarExpense, 
  Deposit, 
  DailyMealRecord, 
  MemberSettlement,
  DormitoryBillItem,
  DormitoryMemberPayment,
  PaymentMethod,
  AdminSession
} from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_EXPENSES, 
  INITIAL_DEPOSITS, 
  generateInitialDailyMeals,
  INITIAL_DORM_BILLS,
  INITIAL_DORM_PAYMENTS
} from './data/initialData';
import { 
  calculateMessSummary, 
  generateWhatsAppReport, 
  exportToCSV,
  calculateDormitorySummary,
  generateDormitoryWhatsAppNotice,
  exportDormitoryCSV
} from './utils/calculator';
import { getAdminSession } from './utils/adminAuth';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MealTrackerView } from './components/MealTrackerView';
import { BazaarView } from './components/BazaarView';
import { DepositsView } from './components/DepositsView';
import { DormitoryBillsView } from './components/DormitoryBillsView';
import { SettlementView } from './components/SettlementView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddDepositModal } from './components/modals/AddDepositModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { WhatsAppReportModal } from './components/modals/WhatsAppReportModal';
import { PrintSettlementSlipModal } from './components/modals/PrintSettlementSlipModal';
import { QuickEntryMenuModal } from './components/modals/QuickEntryMenuModal';
import { RecordDormPaymentModal } from './components/modals/RecordDormPaymentModal';
import { ConnectGitHubModal } from './components/modals/ConnectGitHubModal';
import { DownloadAllSheetsPdfModal } from './components/modals/DownloadAllSheetsPdfModal';
import { ClearMonthDataModal, ClearMonthConfig } from './components/modals/ClearMonthDataModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { RotateCcw, FileText, CalendarDays, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activePeriod, setActivePeriod] = useState<string>(() => {
    return localStorage.getItem('mess_active_period') || 'October - November 2026';
  });

  useEffect(() => {
    localStorage.setItem('mess_active_period', activePeriod);
  }, [activePeriod]);

  // 1. Persistent State with LocalStorage
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mess_members_v2');
    if (saved) {
      try {
        const parsed: Member[] = JSON.parse(saved);
        return parsed.map(m => (m.id === 'm1' || m.name.trim().toUpperCase() === 'RESIDENT 1') ? { ...m, name: 'Resident 1' } : m);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [expenses, setExpenses] = useState<BazaarExpense[]>(() => {
    const saved = localStorage.getItem('mess_expenses_v2');
    if (saved) {
      try {
        const parsed: BazaarExpense[] = JSON.parse(saved);
        return parsed.map(e => (e.shopperId === 'm1' || e.shopperName.trim().toUpperCase() === 'RESIDENT 1') ? { ...e, shopperName: 'Resident 1' } : e);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EXPENSES;
  });

  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem('mess_deposits_v2');
    if (saved) {
      try {
        const parsed: Deposit[] = JSON.parse(saved);
        return parsed.map(d => (d.memberId === 'm1' || d.memberName.trim().toUpperCase() === 'RESIDENT 1') ? { ...d, memberName: 'Resident 1' } : d);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DEPOSITS;
  });

  const [dailyMeals, setDailyMeals] = useState<DailyMealRecord[]>(() => {
    const saved = localStorage.getItem('mess_meals_v2');
    return saved ? JSON.parse(saved) : generateInitialDailyMeals();
  });

  const [settledMemberIds, setSettledMemberIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('mess_settled_ids_v2');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  // Dormitory Bills & Payments
  const [dormBills, setDormBills] = useState<DormitoryBillItem[]>(() => {
    const saved = localStorage.getItem('mess_dorm_bills_v2');
    return saved ? JSON.parse(saved) : INITIAL_DORM_BILLS;
  });

  const [dormPayments, setDormPayments] = useState<DormitoryMemberPayment[]>(() => {
    const saved = localStorage.getItem('mess_dorm_payments_v2');
    if (saved) {
      try {
        const parsed: DormitoryMemberPayment[] = JSON.parse(saved);
        return parsed.map(dp => (dp.memberId === 'm1' || dp.memberName.trim().toLowerCase() === 'resident 1' || dp.memberName.trim().toUpperCase() === 'RESIDENT 1') ? { ...dp, memberName: 'Resident 1' } : dp);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DORM_PAYMENTS;
  });

  // Option: Include Member Meal Settlement in Dormitory Bill (Combined One-Pay)
  const [includeMealAdjustment, setIncludeMealAdjustment] = useState<boolean>(() => {
    const saved = localStorage.getItem('mess_include_meal_adj');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('Connecting to cloud storage…');
  const lastCloudUpdate = useRef<string | null>(null);
  const lastLocalEdit = useRef(0);
  const skipNextCloudWrite = useRef(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mess_members_v2', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('mess_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mess_deposits_v2', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('mess_meals_v2', JSON.stringify(dailyMeals));
  }, [dailyMeals]);

  useEffect(() => {
    localStorage.setItem('mess_settled_ids_v2', JSON.stringify(Array.from(settledMemberIds)));
  }, [settledMemberIds]);

  useEffect(() => {
    localStorage.setItem('mess_dorm_bills_v2', JSON.stringify(dormBills));
  }, [dormBills]);

  useEffect(() => {
    localStorage.setItem('mess_dorm_payments_v2', JSON.stringify(dormPayments));
  }, [dormPayments]);

  useEffect(() => {
    localStorage.setItem('mess_include_meal_adj', JSON.stringify(includeMealAdjustment));
  }, [includeMealAdjustment]);

  // Tab & Selection state
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || 'm1');

  // Admin Session State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSession().then((session) => {
      if (!active) return;
      setAdminSession(session);
      setAuthChecked(true);
    });
    return () => { active = false; };
  }, []);

  const makeLedgerSnapshot = () => ({
    members,
    expenses,
    deposits,
    dailyMeals,
    settledMemberIds: Array.from(settledMemberIds),
    dormBills,
    dormPayments,
    includeMealAdjustment,
    activePeriod
  });

  const applyLedgerSnapshot = (data: any) => {
    if (!data || typeof data !== 'object') return;
    skipNextCloudWrite.current = true;
    if (Array.isArray(data.members)) setMembers(data.members);
    if (Array.isArray(data.expenses)) setExpenses(data.expenses);
    if (Array.isArray(data.deposits)) setDeposits(data.deposits);
    if (Array.isArray(data.dailyMeals)) setDailyMeals(data.dailyMeals);
    if (Array.isArray(data.settledMemberIds)) setSettledMemberIds(new Set(data.settledMemberIds));
    if (Array.isArray(data.dormBills)) setDormBills(data.dormBills);
    if (Array.isArray(data.dormPayments)) setDormPayments(data.dormPayments);
    if (typeof data.includeMealAdjustment === 'boolean') setIncludeMealAdjustment(data.includeMealAdjustment);
    if (typeof data.activePeriod === 'string') setActivePeriod(data.activePeriod);
  };

  useEffect(() => {
    if (!adminSession) {
      setCloudReady(false);
      setCloudStatus('Sign in to connect cloud storage');
      return;
    }

    let active = true;
    setCloudReady(false);
    setCloudStatus('Loading your shared ledger…');

    const connect = async () => {
      try {
        const response = await fetch('/api/state', { credentials: 'same-origin', cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Cloud storage is unavailable.');

        if (result.data) {
          lastCloudUpdate.current = result.updatedAt;
          applyLedgerSnapshot(result.data);
        } else {
          const saveResponse = await fetch('/api/state', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: makeLedgerSnapshot() })
          });
          const saved = await saveResponse.json();
          if (!saveResponse.ok) throw new Error(saved.message || 'Could not initialize cloud storage.');
          lastCloudUpdate.current = saved.updatedAt;
        }

        if (!active) return;
        setCloudReady(true);
        setCloudStatus('Cloud ledger connected');
      } catch (error) {
        if (!active) return;
        setCloudReady(false);
        setCloudStatus(error instanceof Error ? error.message : 'Cloud storage is not connected.');
      }
    };

    void connect();
    return () => { active = false; };
  }, [adminSession]);

  useEffect(() => {
    if (!cloudReady || !adminSession) return;

    const timer = window.setTimeout(async () => {
      if (skipNextCloudWrite.current) {
        skipNextCloudWrite.current = false;
        return;
      }
      lastLocalEdit.current = Date.now();
      setCloudStatus('Saving to cloud…');
      try {
        const response = await fetch('/api/state', {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: makeLedgerSnapshot() })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Cloud save failed.');
        lastCloudUpdate.current = result.updatedAt;
        setCloudStatus('All changes saved to cloud');
      } catch (error) {
        setCloudStatus(error instanceof Error ? error.message : 'Cloud save failed.');
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [cloudReady, adminSession, members, expenses, deposits, dailyMeals, settledMemberIds, dormBills, dormPayments, includeMealAdjustment, activePeriod]);

  useEffect(() => {
    if (!cloudReady || !adminSession) return;
    const timer = window.setInterval(async () => {
      if (Date.now() - lastLocalEdit.current < 2000) return;
      try {
        const response = await fetch('/api/state', { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        if (!result.data || !result.updatedAt || result.updatedAt === lastCloudUpdate.current) return;
        skipNextCloudWrite.current = true;
        lastCloudUpdate.current = result.updatedAt;
        applyLedgerSnapshot(result.data);
        setCloudStatus('Updated from another device');
      } catch {
        setCloudStatus('Waiting for cloud connection…');
      }
    }, 10000);
    return () => window.clearInterval(timer);
  }, [cloudReady, adminSession]);

  // Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppModalText, setWhatsAppModalText] = useState<string>('');
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isClearMonthOpen, setIsClearMonthOpen] = useState(false);
  const [printSlipSettlement, setPrintSlipSettlement] = useState<MemberSettlement | null>(null);
  const [activeDormPaymentModal, setActiveDormPaymentModal] = useState<DormitoryMemberPayment | null>(null);

  const handleRestoreData = (restored: any) => {
    if (restored) {
      if (restored.members) setMembers(restored.members);
      if (restored.expenses) setExpenses(restored.expenses);
      if (restored.deposits) setDeposits(restored.deposits);
      if (restored.dailyMeals) setDailyMeals(restored.dailyMeals);
      if (restored.dormBills) setDormBills(restored.dormBills);
      if (restored.dormPayments) setDormPayments(restored.dormPayments);
    }
  };

  // Recalculate mess summary & settlements dynamically
  const { summary, memberSettlements } = useMemo(() => {
    return calculateMessSummary(members, expenses, deposits, dailyMeals, settledMemberIds);
  }, [members, expenses, deposits, dailyMeals, settledMemberIds]);

  // Recalculate Dormitory summary & payments dynamically with integrated meal settlement
  const { summary: dormSummary, updatedPayments: currentDormPayments } = useMemo(() => {
    return calculateDormitorySummary(dormBills, dormPayments, memberSettlements, includeMealAdjustment);
  }, [dormBills, dormPayments, memberSettlements, includeMealAdjustment]);

  // Actions
  const handleToggleSettled = (memberId: string) => {
    setSettledMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handleMarkAllCleared = () => {
    const allCleared = members.every(m => settledMemberIds.has(m.id));
    if (allCleared) {
      setSettledMemberIds(new Set());
    } else {
      setSettledMemberIds(new Set(members.map(m => m.id)));
    }
  };

  const handleAddExpense = (expenseData: Omit<BazaarExpense, 'id'>) => {
    const newExp: BazaarExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleAuditStatus = (id: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          auditStatus: e.auditStatus === 'Verified' ? 'Pending' : 'Verified'
        };
      }
      return e;
    }));
  };

  const handleAddDeposit = (depositData: Omit<Deposit, 'id'>) => {
    const newDep: Deposit = {
      ...depositData,
      id: `dep-${Date.now()}`
    };
    setDeposits(prev => [newDep, ...prev]);
  };

  const handleDeleteDeposit = (id: string) => {
    setDeposits(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleVerifyDeposit = (id: string) => {
    setDeposits(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, verified: !d.verified };
      }
      return d;
    }));
  };

  const handleUpdateDayMeals = (date: string, memberMeals: DailyMealRecord['members'], notes?: string) => {
    setDailyMeals(prev => {
      const existsIndex = prev.findIndex(r => r.date === date);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = { date, members: memberMeals, notes };
        return copy;
      } else {
        return [...prev, { date, members: memberMeals, notes }];
      }
    });
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `m-${Date.now()}`
    };
    setMembers(prev => [...prev, newMember]);
    setSelectedMemberId(newMember.id);

    // Also add to Dormitory Payments roster
    setDormPayments(prev => [
      ...prev,
      {
        id: `dp-${Date.now()}`,
        memberId: newMember.id,
        memberName: newMember.name,
        assignedShare: dormSummary.perMemberShare,
        paidAmount: 0,
        balanceDue: dormSummary.perMemberShare,
        status: 'Unpaid'
      }
    ]);
  };

  // Dormitory Bill Actions
  const handleUpdateDormBill = (id: string, amount: number) => {
    setDormBills(prev => prev.map(b => b.id === id ? { ...b, amount } : b));
  };

  const handleAddDormBill = (name: string, amount: number) => {
    const newBill: DormitoryBillItem = {
      id: `bill-${Date.now()}`,
      name,
      amount,
      dueDate: '2026-11-10',
      isPaidToVendor: false
    };
    setDormBills(prev => [...prev, newBill]);
  };

  const handleDeleteDormBill = (id: string) => {
    setDormBills(prev => prev.filter(b => b.id !== id));
  };

  const handleQuickToggleDormPaid = (memberId: string) => {
    setDormPayments(prev => prev.map(p => {
      if (p.memberId === memberId) {
        const isCurrentlyPaid = p.status === 'Paid';
        const computed = currentDormPayments.find(item => item.memberId === memberId);
        const targetToPay = computed ? (computed.netCombinedDue ?? computed.assignedShare) : dormSummary.perMemberShare;
        const newPaid = isCurrentlyPaid ? 0 : targetToPay;
        return {
          ...p,
          paidAmount: newPaid,
          balanceDue: isCurrentlyPaid ? targetToPay : 0,
          status: isCurrentlyPaid ? 'Unpaid' : 'Paid',
          paymentDate: isCurrentlyPaid ? undefined : new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  const handleSaveDormPayment = (memberId: string, paidAmount: number, method?: PaymentMethod, trxId?: string) => {
    setDormPayments(prev => prev.map(p => {
      if (p.memberId === memberId) {
        const computed = currentDormPayments.find(item => item.memberId === memberId);
        const targetToPay = computed ? (computed.netCombinedDue ?? computed.assignedShare) : dormSummary.perMemberShare;
        const due = Math.max(0, targetToPay - paidAmount);
        const status = paidAmount >= targetToPay ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';
        return {
          ...p,
          paidAmount,
          balanceDue: due,
          status,
          paymentMethod: method,
          trxId,
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  const handleMarkAllDormPaid = () => {
    setDormPayments(prev => prev.map(p => {
      const computed = currentDormPayments.find(item => item.memberId === p.memberId);
      const targetToPay = computed ? (computed.netCombinedDue ?? computed.assignedShare) : dormSummary.perMemberShare;
      return {
        ...p,
        paidAmount: targetToPay,
        balanceDue: 0,
        status: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0]
      };
    }));
  };

  const handleResetAllDormUnpaid = () => {
    setDormPayments(prev => prev.map(p => ({
      ...p,
      paidAmount: 0,
      balanceDue: dormSummary.perMemberShare,
      status: 'Unpaid'
    })));
  };

  const handleExportDormCSV = () => {
    const csvContent = exportDormitoryCSV(dormSummary, dormBills, currentDormPayments, includeMealAdjustment);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dormitory_monthly_bills_${activePeriod.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDormWhatsApp = () => {
    const text = generateDormitoryWhatsAppNotice(dormSummary, dormBills, currentDormPayments, activePeriod, includeMealAdjustment);
    setWhatsAppModalText(text);
    setIsWhatsAppOpen(true);
  };

  const handleOpenMessWhatsApp = () => {
    const text = generateWhatsAppReport(summary, memberSettlements, activePeriod);
    setWhatsAppModalText(text);
    setIsWhatsAppOpen(true);
  };

  const handleResetToTemplate = () => {
    if (window.confirm('Reset all mess and dormitory bill data back to default audited template? Any custom modifications will be restored.')) {
      setMembers(INITIAL_MEMBERS);
      setExpenses(INITIAL_EXPENSES);
      setDeposits(INITIAL_DEPOSITS);
      setDailyMeals(generateInitialDailyMeals());
      setSettledMemberIds(new Set());
      setDormBills(INITIAL_DORM_BILLS);
      setDormPayments(INITIAL_DORM_PAYMENTS);
      setSelectedMemberId(INITIAL_MEMBERS[0].id);
      setIncludeMealAdjustment(true);
      setActivePeriod('October - November 2026');
      localStorage.clear();
    }
  };

  const handleConfirmClearMonth = (config: ClearMonthConfig) => {
    // 1. Update period
    setActivePeriod(config.newPeriodName);

    // 2. Members roster
    const activeRoster = config.keepMembers ? members : INITIAL_MEMBERS;
    if (!config.keepMembers) {
      setMembers(INITIAL_MEMBERS);
    }

    // 3. Daily meals for new month
    if (config.clearMeals) {
      let yearMonthPrefix = '2026-11';
      const lower = config.newPeriodName.toLowerCase();
      if (lower.includes('nov')) yearMonthPrefix = '2026-11';
      else if (lower.includes('dec')) yearMonthPrefix = '2026-12';
      else if (lower.includes('jan')) yearMonthPrefix = '2027-01';
      else if (lower.includes('feb')) yearMonthPrefix = '2027-02';
      else if (lower.includes('mar')) yearMonthPrefix = '2027-03';
      else if (lower.includes('apr')) yearMonthPrefix = '2027-04';
      else if (lower.includes('may')) yearMonthPrefix = '2027-05';
      else if (lower.includes('jun')) yearMonthPrefix = '2027-06';
      else if (lower.includes('jul')) yearMonthPrefix = '2027-07';
      else if (lower.includes('aug')) yearMonthPrefix = '2027-08';
      else if (lower.includes('sep')) yearMonthPrefix = '2027-09';
      else if (lower.includes('oct')) yearMonthPrefix = '2026-10';

      const freshMeals: DailyMealRecord[] = [];
      for (let day = 1; day <= config.daysInNewMonth; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const date = `${yearMonthPrefix}-${dayStr}`;
        const memberMeals: DailyMealRecord['members'] = {};
        activeRoster.forEach(m => {
          memberMeals[m.id] = { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
        });
        freshMeals.push({
          date,
          members: memberMeals
        });
      }
      setDailyMeals(freshMeals);
    }

    // 4. Bazaar expenses
    if (config.clearExpenses) {
      setExpenses([]);
    }

    // 5. Deposits
    if (config.clearDeposits) {
      if (config.carryForwardBalances) {
        const carryDeposits: Deposit[] = [];
        memberSettlements.forEach((ms, idx) => {
          if (ms.balance > 0.05) {
            const memberName = (ms.member.id === 'm1' || ms.member.name.toUpperCase() === 'RESIDENT 1')
              ? 'Resident 1'
              : ms.member.name;
            carryDeposits.push({
              id: `dep-carry-${idx}-${Date.now()}`,
              memberId: ms.member.id,
              memberName,
              amount: Math.round(ms.balance * 100) / 100,
              date: new Date().toISOString().split('T')[0],
              paymentMethod: 'Cash',
              remarks: `Surplus advance carried forward from ${activePeriod}`,
              verified: true,
            });
          }
        });
        setDeposits(carryDeposits);
      } else {
        setDeposits([]);
      }
    }

    // 6. Reset Dorm payments to unpaid
    if (config.resetDormPayments) {
      setDormPayments(activeRoster.map((m, idx) => ({
        id: `dp-new-${idx}-${Date.now()}`,
        memberId: m.id,
        memberName: (m.id === 'm1' || m.name.toUpperCase() === 'RESIDENT 1') ? 'Resident 1' : m.name,
        assignedShare: dormSummary.perMemberShare,
        paidAmount: 0,
        balanceDue: dormSummary.perMemberShare,
        status: 'Unpaid'
      })));
    }

    // 7. Clear settlement checkmarks
    setSettledMemberIds(new Set());
  };

  const handleExportCSV = () => {
    if (currentTab === 'dormitory') {
      handleExportDormCSV();
    } else {
      const csvContent = exportToCSV(summary, memberSettlements, expenses, activePeriod);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mess_ledger_${activePeriod.replace(/\s+/g, '_').toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Restoring secure admin session…
      </div>
    );
  }

  if (!adminSession) {
    return (
      <AdminLoginModal
        isOpen
        onClose={() => {}}
        onLoginSuccess={(session) => {
          setAdminSession(session);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onQuickAction={() => setIsQuickMenuOpen(true)}
        onOpenWhatsApp={currentTab === 'dormitory' ? handleOpenDormWhatsApp : handleOpenMessWhatsApp}
        onExportCSV={handleExportCSV}
        onOpenPdfReport={() => setIsPdfModalOpen(true)}
        onOpenClearMonth={() => setIsClearMonthOpen(true)}
        onOpenGitHub={() => setIsGitHubModalOpen(true)}
        activePeriod={activePeriod}
        adminSession={adminSession}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main View Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            dormSummary={dormSummary}
            memberSettlements={memberSettlements}
            dormPayments={currentDormPayments}
            dormBills={dormBills}
            expenses={expenses}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onToggleSettled={handleToggleSettled}
            onOpenPrintSlip={(ms) => setPrintSlipSettlement(ms)}
            onOpenPdfReport={() => setIsPdfModalOpen(true)}
            onOpenClearMonth={() => setIsClearMonthOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenAddDeposit={() => setIsAddDepositOpen(true)}
            onOpenWhatsApp={handleOpenMessWhatsApp}
            onTabChange={setCurrentTab}
            includeMealAdjustment={includeMealAdjustment}
          />
        )}

        {currentTab === 'meals' && (
          <MealTrackerView
            members={members}
            dailyMeals={dailyMeals}
            onUpdateDayMeals={handleUpdateDayMeals}
            activeMealRate={summary.activeMealRate}
          />
        )}

        {currentTab === 'bazaar' && (
          <BazaarView
            expenses={expenses}
            members={members}
            totalMeals={summary.totalMeals}
            activeMealRate={summary.activeMealRate}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            onToggleAuditStatus={handleToggleAuditStatus}
          />
        )}

        {currentTab === 'deposits' && (
          <DepositsView
            deposits={deposits}
            members={members}
            totalMessExpenses={summary.totalExpenses}
            onOpenAddDeposit={() => setIsAddDepositOpen(true)}
            onDeleteDeposit={handleDeleteDeposit}
            onToggleVerifyDeposit={handleToggleVerifyDeposit}
          />
        )}

        {currentTab === 'dormitory' && (
          <DormitoryBillsView
            billItems={dormBills}
            payments={currentDormPayments}
            summary={dormSummary}
            memberSettlements={memberSettlements}
            includeMealAdjustment={includeMealAdjustment}
            onToggleMealAdjustment={setIncludeMealAdjustment}
            onUpdateBillItem={handleUpdateDormBill}
            onAddBillItem={handleAddDormBill}
            onDeleteBillItem={handleDeleteDormBill}
            onQuickTogglePaid={handleQuickToggleDormPaid}
            onOpenPaymentModal={(p) => setActiveDormPaymentModal(p)}
            onMarkAllPaid={handleMarkAllDormPaid}
            onResetAllUnpaid={handleResetAllDormUnpaid}
            onOpenWhatsApp={handleOpenDormWhatsApp}
            onExportCSV={handleExportDormCSV}
          />
        )}

        {currentTab === 'settlement' && (
          <SettlementView
            memberSettlements={memberSettlements}
            summary={summary}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onToggleSettled={handleToggleSettled}
            onOpenPrintSlip={(ms) => setPrintSlipSettlement(ms)}
            onOpenPdfReport={() => setIsPdfModalOpen(true)}
            onOpenWhatsApp={handleOpenMessWhatsApp}
            onExportCSV={handleExportCSV}
            onMarkAllCleared={handleMarkAllCleared}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView
            adminSession={adminSession}
            onLoginSuccess={(session) => setAdminSession(session)}
            onLogout={() => setAdminSession(null)}
            members={members}
            expenses={expenses}
            deposits={deposits}
            dailyMeals={dailyMeals}
            dormBills={dormBills}
            dormPayments={currentDormPayments}
            summary={summary}
            dormSummary={dormSummary}
            memberSettlements={memberSettlements}
            activePeriod={activePeriod}
            onUpdateMembers={setMembers}
            onUpdateExpenses={setExpenses}
            onUpdateDeposits={setDeposits}
            onUpdateSettledIds={setSettledMemberIds}
            onUpdateDormPayments={setDormPayments}
            onOpenClearMonth={() => setIsClearMonthOpen(true)}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onResetToTemplate={handleResetToTemplate}
            onRestoreData={handleRestoreData}
            onSwitchTab={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Mess Meal Management System</span>
            <span>·</span>
            <span>Automated Meal Tracking, Bazaar & Dormitory Flat Bill Accounting</span>
            <span>·</span>
            <span>{cloudStatus}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => setCurrentTab('admin')}
              className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                adminSession ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Open Admin Authentication & Management Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{adminSession ? `Admin Hub (${adminSession.userId})` : 'Admin Dashboard'}</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
              title="Download all sheets in one complete audited PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download PDF (All Sheets)</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsClearMonthOpen(true)}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-700 transition-colors font-medium cursor-pointer"
              title="Roll over to new month and clear monthly logs"
            >
              <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
              <span>Start New Month / Clear</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="text-slate-600 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
            >
              + Add Member
            </button>
            <span>·</span>
            <button
              onClick={handleResetToTemplate}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Reset data back to original audited CSV dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Ledger</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        members={members}
        onAddExpense={handleAddExpense}
      />

      <AddDepositModal
        isOpen={isAddDepositOpen}
        onClose={() => setIsAddDepositOpen(false)}
        members={members}
        onAddDeposit={handleAddDeposit}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
      />

      <WhatsAppReportModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        reportText={whatsAppModalText}
      />

      <PrintSettlementSlipModal
        isOpen={!!printSlipSettlement}
        onClose={() => setPrintSlipSettlement(null)}
        settlement={printSlipSettlement}
        monthName={activePeriod}
        dormShare={dormSummary.perMemberShare}
      />

      <DownloadAllSheetsPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        activePeriod={activePeriod}
        summary={summary}
        dormSummary={dormSummary}
        memberSettlements={memberSettlements}
        dailyMeals={dailyMeals}
        expenses={expenses}
        deposits={deposits}
        dormBills={dormBills}
        dormPayments={currentDormPayments}
        includeMealAdjustment={includeMealAdjustment}
        members={members}
      />

      <ClearMonthDataModal
        isOpen={isClearMonthOpen}
        onClose={() => setIsClearMonthOpen(false)}
        currentPeriod={activePeriod}
        members={members}
        expenses={expenses}
        deposits={deposits}
        dailyMeals={dailyMeals}
        dormBills={dormBills}
        dormPayments={currentDormPayments}
        memberSettlements={memberSettlements}
        summary={summary}
        dormSummary={dormSummary}
        onConfirmClearMonth={handleConfirmClearMonth}
        onOpenPdfReport={() => setIsPdfModalOpen(true)}
      />

      <RecordDormPaymentModal
        isOpen={!!activeDormPaymentModal}
        onClose={() => setActiveDormPaymentModal(null)}
        payment={activeDormPaymentModal}
        onSavePayment={handleSaveDormPayment}
      />

      <QuickEntryMenuModal
        isOpen={isQuickMenuOpen}
        onClose={() => setIsQuickMenuOpen(false)}
        onSelectAction={(action) => {
          if (action === 'expense') setIsAddExpenseOpen(true);
          else if (action === 'deposit') setIsAddDepositOpen(true);
          else if (action === 'meals') setCurrentTab('meals');
          else if (action === 'member') setIsAddMemberOpen(true);
          else if (action === 'dormitory') setCurrentTab('dormitory');
          else if (action === 'pdf') setIsPdfModalOpen(true);
          else if (action === 'clearmonth') setIsClearMonthOpen(true);
          else if (action === 'admin') setCurrentTab('admin');
        }}
      />

      <ConnectGitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        fullLedgerData={{
          members,
          expenses,
          deposits,
          dailyMeals,
          dormBills,
          dormPayments: currentDormPayments,
          summary,
          dormSummary
        }}
        onRestoreData={handleRestoreData}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(session) => {
          setAdminSession(session);
          setCurrentTab('admin');
        }}
      />
    </div>
  );
}

