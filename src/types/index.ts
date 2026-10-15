export interface Member {
  id: string;
  name: string;
  phone?: string;
  room?: string;
  avatarColor: string;
  isActive: boolean;
  joinedDate: string;
}

export interface MealBreakdown {
  breakfast: number; // e.g. 0.5 or 0
  lunch: number;     // e.g. 1.0 or 0
  dinner: number;    // e.g. 1.0 or 0
  guest: number;     // e.g. 1.0, 2.0
}

export interface DailyMealRecord {
  date: string; // YYYY-MM-DD
  members: Record<string, MealBreakdown>;
  notes?: string;
}

export type ExpenseCategory =
  | 'Mess Bazaar'
  | 'Bazaar + Repair'
  | 'Utilities / Plumbing'
  | 'Emergency Grocery'
  | 'Weekly Bazaar & Gas'
  | 'Month-End + Cutter Bill'
  | 'Dining / Feast'
  | 'Cook / Maid Bill'
  | 'Internet / WiFi';

export interface BazaarExpense {
  id: string;
  date: string; // Formatted e.g. "2026-10-02" or display "2-Oct"
  shopperId: string;
  shopperName: string;
  category: ExpenseCategory;
  shoppingExp: number; // Pure Mess Bazaar (Food & Groceries) — ONLY this calculates active meal rate
  diningExp: number;   // Other Shared Bills (Plumbing, Gas, WiFi, Maid, Repairs, Cutter, Dining) — Shared split equally, NOT added to meal rate
  remarks: string;
  ledgerTab: string;   // e.g. "Bazaar Tab (Row 5)"
  auditStatus: 'Verified' | 'Pending';
  receiptNo?: string;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';

export interface Deposit {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  trxId?: string;
  remarks?: string;
  verified: boolean;
}

export interface MemberSettlement {
  member: Member;
  totalMeals: number;
  appliedMealRate: number; // = totalShoppingExp / totalMeals (Mess Bazaar only)
  mealCost: number;        // = totalMeals * appliedMealRate
  diningSplit: number;     // = Other bills shared split per active member
  totalCost: number;       // = mealCost + diningSplit
  totalDeposit: number;    // Total deposited into mess fund
  balance: number;         // totalDeposit - totalCost (>0 = refund, <0 = due)
  status: 'Refund Eligible' | 'Due Payment' | 'Balanced';
  settlementAction: string; // "Refund: ৳X.XX" or "Pay Due: ৳X.XX"
  isSettled: boolean;
  settledAt?: string;
  auditCheck: 'Pending' | 'Verified' | 'Cleared';
  
  // Profile explorer detailed metrics
  totalMealsShare: number;   // % of total mess meals
  avgMealsPerDay: number;
  bazaarTrips: number;
  bazaarSpendHandled: number;
  depositsCount: number;
  totalSpendShare: number;   // % of mess money handled in bazaar
  bazaarParticipation: 'Active Shopper' | 'Occasional Shopper' | 'Non-Shopper';
  paymentDirection: 'Refund to Member' | 'Collect from Member' | 'Fully Reconciled';
  settlementTarget: number;
  depositCoverage: number;   // totalDeposit / totalCost * 100
  paymentVariance: number;
}

export interface MessSummary {
  totalShoppingExp: number;
  totalDiningExp: number;
  totalExpenses: number;
  totalMeals: number;
  activeMealRate: number;
  totalDeposits: number;
  messCashBalance: number; // totalDeposits - totalExpenses (Cash remaining in mess fund)
  cashInHand: number;      // Physical/bank cash available in mess fund
  cashReserveStatus: 'Surplus' | 'Deficit' | 'Balanced';
  depositUtilizationRate: number; // % of collected deposits spent
  bazaarExpenseShare: number;     // % of expenses spent on food/groceries
  sharedBillsShare: number;       // % of expenses spent on shared bills
  netCashDisparity: number;       // Variance between deposits and total expenses
  depositSurplusOrDeficit: number; // Signed cash in hand amount
  activeMembersCount: number;
  reconciliationVariance: number; // Should be 0 when perfectly balanced
  auditStatusText: string;
  clearedCount: number;
}

// 🏠 Dormitory Monthly Bill Tracker Types
export interface DormitoryBillItem {
  id: string;
  name: string;        // e.g. 'House Rent', 'Gas Bill', 'Khala Bill', 'WiFi Bill', 'Electricity Bill', 'Miscellaneous / Buffer'
  amount: number;
  dueDate?: string;
  isPaidToVendor?: boolean;
  vendorNotes?: string;
}

export interface DormitoryMemberPayment {
  id: string;
  memberId: string;
  memberName: string;
  assignedShare: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  trxId?: string;
  notes?: string;

  // Integrated Meal Settlement Adjustment
  mealBalance?: number;        // Positive = Refund/Credit, Negative = Due/Deficit
  mealStatus?: string;         // 'Refund Eligible' | 'Due Payment' | 'Balanced'
  netCombinedDue?: number;     // assignedShare - mealBalance (adjusted total to pay)
  netRemainingToPay?: number;  // netCombinedDue - paidAmount
}

export interface DormitorySummary {
  totalExpenses: number;
  totalMembers: number;
  perMemberShare: number;
  totalPaid: number;
  totalBalanceDue: number;
  paidMembersCount: number;
  status: 'Pending' | 'Partially Paid' | 'Fully Collected';

  // Integrated Combined Metrics
  totalMealRefundsAdjustment: number;
  totalNetCombinedPayable: number;
  totalNetRemainingDue: number;
}

export type AppTab = 'dashboard' | 'meals' | 'bazaar' | 'deposits' | 'dormitory' | 'settlement' | 'admin';

export interface AdminCredentials {
  userId: string;
  passwordHash: string; // Plaintext or hashed password representation
  displayName: string;
  email?: string;
  role: 'Super Admin' | 'Mess Manager' | 'Auditor';
  updatedAt: string;
}

export interface AdminSession {
  isLoggedIn: boolean;
  userId: string;
  displayName: string;
  role: string;
  loginTime: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy: string;
}
