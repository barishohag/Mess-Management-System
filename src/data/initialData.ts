import { Member, BazaarExpense, Deposit, DailyMealRecord } from '../types';

// Start with an empty ledger so public source does not disclose household records.
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_EXPENSES: BazaarExpense[] = [];
export const INITIAL_DEPOSITS: Deposit[] = [];
export function generateInitialDailyMeals(): DailyMealRecord[] { return []; }
export const INITIAL_DORM_BILLS: import('../types').DormitoryBillItem[] = [];
export const INITIAL_DORM_PAYMENTS: import('../types').DormitoryMemberPayment[] = [];