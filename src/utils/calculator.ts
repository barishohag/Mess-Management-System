import {
  Member,
  BazaarExpense,
  Deposit,
  DailyMealRecord,
  MemberSettlement,
  MessSummary,
  DormitoryBillItem,
  DormitoryMemberPayment,
  DormitorySummary
} from '../types';

export function formatTk(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '৳0.00';
  return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(num: number, decimals: number = 1): string {
  if (isNaN(num) || !isFinite(num)) return '0.0';
  return num.toFixed(decimals);
}

export function calculateMessSummary(
  members: Member[],
  expenses: BazaarExpense[],
  deposits: Deposit[],
  dailyMeals: DailyMealRecord[],
  settledMemberIds: Set<string>
): { summary: MessSummary; memberSettlements: MemberSettlement[] } {
  const activeMembers = members.filter(m => m.isActive);
  const activeCount = activeMembers.length || 1;

  // 1. Calculate Expenses
  // RULE ENFORCED: Only Mess Bazaar calculates Meal Rate.
  // Other all bills (utilities, plumbing, gas, maid, wifi, repairs, dining feast) are shared split equally.
  let totalShoppingExp = 0; // Pure Mess Bazaar (Food & Groceries) -> used for meal rate
  let totalDiningExp = 0;   // Other bills & shared utilities -> split equally among active members

  for (const exp of expenses) {
    const isPureBillCategory = 
      exp.category === 'Utilities / Plumbing' ||
      exp.category === 'Internet / WiFi' ||
      exp.category === 'Cook / Maid Bill' ||
      exp.category === 'Dining / Feast';

    if (isPureBillCategory) {
      // All amounts in utility/bill/feast categories are strictly other bills (shared split)
      totalDiningExp += (Number(exp.shoppingExp) || 0) + (Number(exp.diningExp) || 0);
    } else {
      totalShoppingExp += Number(exp.shoppingExp) || 0;
      totalDiningExp += Number(exp.diningExp) || 0;
    }
  }
  const totalExpenses = totalShoppingExp + totalDiningExp;

  // 2. Calculate Total Meals consumed per member
  const memberMealsMap: Record<string, number> = {};
  for (const m of members) {
    memberMealsMap[m.id] = 0;
  }

  let totalMeals = 0;
  for (const record of dailyMeals) {
    for (const [memberId, breakdown] of Object.entries(record.members || {})) {
      const sum = (Number(breakdown.breakfast) || 0) +
                  (Number(breakdown.lunch) || 0) +
                  (Number(breakdown.dinner) || 0) +
                  (Number(breakdown.guest) || 0);
      memberMealsMap[memberId] = (memberMealsMap[memberId] || 0) + sum;
      totalMeals += sum;
    }
  }

  // 3. Active Meal Rate: ONLY Mess Bazaar / Total Meals (Other bills NEVER added to meal rate)
  const activeMealRate = totalMeals > 0 ? totalShoppingExp / totalMeals : 0;

  // 4. Other Bills Shared Split per active member (Divided equally, not in meal rate)
  const diningSplitPerMember = activeCount > 0 ? totalDiningExp / activeCount : 0;

  // 5. Total Deposits per member
  const memberDepositsMap: Record<string, { total: number; count: number }> = {};
  for (const m of members) {
    memberDepositsMap[m.id] = { total: 0, count: 0 };
  }

  let totalDeposits = 0;
  for (const dep of deposits) {
    if (dep.verified) {
      const amt = Number(dep.amount) || 0;
      totalDeposits += amt;
      if (!memberDepositsMap[dep.memberId]) {
        memberDepositsMap[dep.memberId] = { total: 0, count: 0 };
      }
      memberDepositsMap[dep.memberId].total += amt;
      memberDepositsMap[dep.memberId].count += 1;
    }
  }

  // 6. Bazaar Handled per member
  const memberBazaarMap: Record<string, { trips: number; spend: number }> = {};
  for (const m of members) {
    memberBazaarMap[m.id] = { trips: 0, spend: 0 };
  }

  for (const exp of expenses) {
    if (!memberBazaarMap[exp.shopperId]) {
      memberBazaarMap[exp.shopperId] = { trips: 0, spend: 0 };
    }
    memberBazaarMap[exp.shopperId].trips += 1;
    memberBazaarMap[exp.shopperId].spend += (Number(exp.shoppingExp) || 0) + (Number(exp.diningExp) || 0);
  }

  const daysCount = Math.max(1, dailyMeals.length);

  // 7. Compute each member's settlement record
  const memberSettlements: MemberSettlement[] = members.map((member) => {
    const memberTotalMeals = memberMealsMap[member.id] || 0;
    const mealCost = memberTotalMeals * activeMealRate;
    const diningSplit = member.isActive ? diningSplitPerMember : 0;
    const totalCost = mealCost + diningSplit;
    const depositInfo = memberDepositsMap[member.id] || { total: 0, count: 0 };
    const totalDeposit = depositInfo.total;
    const balance = totalDeposit - totalCost;

    let status: 'Refund Eligible' | 'Due Payment' | 'Balanced';
    let settlementAction = '';
    let paymentDirection: 'Refund to Member' | 'Collect from Member' | 'Fully Reconciled';

    if (balance > 0.05) {
      status = 'Refund Eligible';
      settlementAction = `Refund: ${formatTk(balance)}`;
      paymentDirection = 'Refund to Member';
    } else if (balance < -0.05) {
      status = 'Due Payment';
      settlementAction = `Pay Due: ${formatTk(Math.abs(balance))}`;
      paymentDirection = 'Collect from Member';
    } else {
      status = 'Balanced';
      settlementAction = 'Fully Balanced';
      paymentDirection = 'Fully Reconciled';
    }

    const isSettled = settledMemberIds.has(member.id);
    const auditCheck = isSettled ? 'Cleared' : (depositInfo.count > 0 ? 'Verified' : 'Pending');

    const totalMealsShare = totalMeals > 0 ? (memberTotalMeals / totalMeals) * 100 : 0;
    const avgMealsPerDay = memberTotalMeals / daysCount;
    const bazaarInfo = memberBazaarMap[member.id] || { trips: 0, spend: 0 };
    const totalSpendShare = totalExpenses > 0 ? (bazaarInfo.spend / totalExpenses) * 100 : 0;

    let bazaarParticipation: 'Active Shopper' | 'Occasional Shopper' | 'Non-Shopper';
    if (bazaarInfo.trips >= 2) bazaarParticipation = 'Active Shopper';
    else if (bazaarInfo.trips === 1) bazaarParticipation = 'Occasional Shopper';
    else bazaarParticipation = 'Non-Shopper';

    const depositCoverage = totalCost > 0 ? (totalDeposit / totalCost) * 100 : (totalDeposit > 0 ? 100 : 0);

    return {
      member,
      totalMeals: memberTotalMeals,
      appliedMealRate: activeMealRate,
      mealCost,
      diningSplit,
      totalCost,
      totalDeposit,
      balance,
      status,
      settlementAction,
      isSettled,
      auditCheck,
      totalMealsShare,
      avgMealsPerDay,
      bazaarTrips: bazaarInfo.trips,
      bazaarSpendHandled: bazaarInfo.spend,
      depositsCount: depositInfo.count,
      totalSpendShare,
      bazaarParticipation,
      paymentDirection,
      settlementTarget: Math.abs(balance),
      depositCoverage,
      paymentVariance: balance
    };
  });

  // 8. Mess Cash Balance & Reserve in hand = Total Deposits - Total Expenses
  // When deposits > total expenses: Surplus cash remains in mess pool (positive cash in hand)
  // When total expenses > deposits: Deficit alert (shortfall where expenses outpaced collected deposits)
  const messCashBalance = totalDeposits - totalExpenses;
  const cashInHand = messCashBalance;

  let cashReserveStatus: 'Surplus' | 'Deficit' | 'Balanced' = 'Balanced';
  if (messCashBalance > 0.05) {
    cashReserveStatus = 'Surplus';
  } else if (messCashBalance < -0.05) {
    cashReserveStatus = 'Deficit';
  }

  const depositUtilizationRate = totalDeposits > 0 
    ? (totalExpenses / totalDeposits) * 100 
    : (totalExpenses > 0 ? 100 : 0);

  const bazaarExpenseShare = totalExpenses > 0 
    ? (totalShoppingExp / totalExpenses) * 100 
    : 0;

  const sharedBillsShare = totalExpenses > 0 
    ? (totalDiningExp / totalExpenses) * 100 
    : 0;

  const netCashDisparity = Math.abs(totalDeposits - totalExpenses);
  const depositSurplusOrDeficit = messCashBalance;

  // Verification: Sum of balances must equal messCashBalance
  const sumOfBalances = memberSettlements.reduce((acc, ms) => acc + ms.balance, 0);
  const reconciliationVariance = Math.abs(messCashBalance - sumOfBalances);

  const clearedCount = memberSettlements.filter(ms => ms.isSettled).length;

  const summary: MessSummary = {
    totalShoppingExp,
    totalDiningExp,
    totalExpenses,
    totalMeals,
    activeMealRate,
    totalDeposits,
    messCashBalance,
    cashInHand,
    cashReserveStatus,
    depositUtilizationRate,
    bazaarExpenseShare,
    sharedBillsShare,
    netCashDisparity,
    depositSurplusOrDeficit,
    activeMembersCount: activeCount,
    reconciliationVariance,
    auditStatusText: reconciliationVariance < 0.05 ? 'Fully Balanced' : 'Variance Detected',
    clearedCount
  };

  return { summary, memberSettlements };
}

// WhatsApp Group Message Generator
export function generateWhatsAppReport(
  summary: MessSummary,
  memberSettlements: MemberSettlement[],
  monthName: string = 'October - November 2026'
): string {
  const lines: string[] = [];

  const reserveBadge = summary.cashReserveStatus === 'Surplus' 
    ? '🟢 SURPLUS CASH RESERVE' 
    : summary.cashReserveStatus === 'Deficit' 
      ? '🔴 CASH DEFICIT ALERT' 
      : '⚪ BALANCED';

  lines.push(`🍽️ *MESS MEAL MANAGEMENT SYSTEM* 🍽️`);
  lines.push(`📅 Period: *${monthName}*`);
  lines.push(`----------------------------------------`);
  lines.push(`📊 *MESS LIQUIDITY & DISPARITY OVERVIEW:*`);
  lines.push(`• Total Member Deposits: *${formatTk(summary.totalDeposits)}*`);
  lines.push(`• Total Cash Outflow: *${formatTk(summary.totalExpenses)}*`);
  lines.push(`• 💵 *Mess Cash in Hand:* *${formatTk(summary.cashInHand)}* (${reserveBadge})`);
  lines.push(`• Deposit Utilization: *${formatNumber(summary.depositUtilizationRate, 1)}%*`);
  if (summary.cashReserveStatus === 'Deficit') {
    lines.push(`⚠️ *ALERT:* Expenses exceed deposits by ${formatTk(summary.netCashDisparity)}. Extra deposit needed immediately!`);
  }
  lines.push(`----------------------------------------`);
  lines.push(`🍲 *MEAL RATE & EXPENSE BREAKDOWN:*`);
  lines.push(`• Active Meal Rate: *${formatTk(summary.activeMealRate)}* / meal (Mess Bazaar Only)`);
  lines.push(`• Mess Bazaar (Food): ${formatTk(summary.totalShoppingExp)} (${formatNumber(summary.bazaarExpenseShare, 1)}% of expenses)`);
  lines.push(`• Other Shared Bills: ${formatTk(summary.totalDiningExp)} (Split: ${formatTk(summary.activeMembersCount > 0 ? summary.totalDiningExp / summary.activeMembersCount : 0)}/member)`);
  lines.push(`• Total Meals Consumed: *${formatNumber(summary.totalMeals, 1)}*`);
  lines.push(`• Audit Variance: ${formatTk(summary.reconciliationVariance)} (${summary.auditStatusText})`);
  lines.push(`----------------------------------------`);
  lines.push(`⚖️ *INDIVIDUAL MEMBER SETTLEMENT:*`);

  memberSettlements.forEach((ms, idx) => {
    const sign = ms.balance >= 0 ? '🟢' : '🔴';
    const action = ms.balance >= 0 ? `Refund: ${formatTk(ms.balance)}` : `Pay Due: ${formatTk(Math.abs(ms.balance))}`;
    lines.push(
      `${idx + 1}. *${ms.member.name}* ${sign}\n` +
      `   Meals: ${formatNumber(ms.totalMeals, 1)} | Meal Cost: ${formatTk(ms.mealCost)} | Shared Bills: ${formatTk(ms.diningSplit)}\n` +
      `   Total Cost: ${formatTk(ms.totalCost)} | Dep: ${formatTk(ms.totalDeposit)}\n` +
      `   *Standing: ${action}* ${ms.isSettled ? '✅ Cleared' : '⏳ Pending'}`
    );
  });

  lines.push(`----------------------------------------`);
  lines.push(`💡 *Note:* Only Mess Bazaar calculates meal rate. All other bills are shared split and not added to the meal rate.`);
  lines.push(`Reconcile pending dues or collect refunds from Mess Manager via bKash / Cash.`);

  return lines.join('\n');
}

// Generate pure CSV matching the user's template
export function exportToCSV(
  summary: MessSummary,
  memberSettlements: MemberSettlement[],
  expenses: BazaarExpense[],
  monthName: string = 'October - November 2026'
): string {
  const rows: string[] = [];

  rows.push(`📊 Dashboard,🍲 Meal Tracker,🛒 Bazaar & Expenses,💳 Deposits,⚖️ Member Settlement,,,,,,,`);
  rows.push(`,🍽️ MESS MEAL MANAGEMENT SYSTEM,,,,,,,📅 ${monthName} | Live App Console,,,,`);
  rows.push(`,"Rule: Only Mess Bazaar calculates meal rate. All other bills are shared split equally.",,,,,,,,,,,`);
  rows.push(`,ACTIVE MEAL RATE,,,TOTAL MESS EXPENSES,,,TOTAL MEALS CONSUMED,,,MESS CASH BALANCE,,`);
  rows.push(`,${formatTk(summary.activeMealRate)},,,${formatTk(summary.totalExpenses)},,,${formatNumber(summary.totalMeals, 1)},,,${formatTk(summary.messCashBalance)},,`);
  rows.push(`,Total Bazaar / Total Meals,,,${formatTk(summary.totalShoppingExp)} Mess Bazaar + ${formatTk(summary.totalDiningExp)} Other Shared Bills,,,${summary.activeMembersCount} Active Mess Members,,,Audited & Fully Balanced,,`);
  rows.push(`,,,,,,,,,,,,`);
  rows.push(`,,,,,,,,,,,,`);
  rows.push(`,⚖️ MEMBER RECONCILIATION & LIVE SETTLEMENT MANAGER,,,,,,,,,,,`);
  rows.push(`Member Name,Total Meals,Meal Rate,Meal Cost [Bazaar Only] (Tk),Other Bills Shared Split (Tk),Total Cost (Tk),Total Deposit (Tk),Balance (Tk),Status,Settlement Action,Settled / Cleared,Audit Check`);

  for (const ms of memberSettlements) {
    rows.push(
      `"${ms.member.name}",${formatNumber(ms.totalMeals, 1)},"${formatTk(ms.appliedMealRate)}","${formatTk(ms.mealCost)}","${formatTk(ms.diningSplit)}","${formatTk(ms.totalCost)}","${formatTk(ms.totalDeposit)}","${formatTk(ms.balance)}","${ms.status}","${ms.settlementAction}",${ms.isSettled ? 'TRUE' : 'FALSE'},"${ms.auditCheck}"`
    );
  }

  rows.push(
    `"Total / Mess Summary",${formatNumber(summary.totalMeals, 1)},"${formatTk(summary.activeMealRate)}","${formatTk(summary.totalShoppingExp)}","${formatTk(summary.totalDiningExp)}","${formatTk(summary.totalExpenses)}","${formatTk(summary.totalDeposits)}","${formatTk(summary.messCashBalance)}","Fully Balanced","Net: ${formatTk(summary.messCashBalance)}","Cleared: ${summary.clearedCount}/${memberSettlements.length}","Ledger Matched"`
  );
  rows.push(
    `"AUDIT CHECK: Total Mess Expenses = ${formatTk(summary.totalExpenses)} (Bazaar: ${formatTk(summary.totalShoppingExp)} + Bills: ${formatTk(summary.totalDiningExp)})  |  Total Member Deposits = ${formatTk(summary.totalDeposits)}  |  Variance = ${formatTk(summary.reconciliationVariance)}  |  Audit Status: ✔️ ${summary.auditStatusText}",,,,,,,,,,,`
  );
  rows.push(`,,,,,,,,,,,,`);
  rows.push(`,🛒 RECENT BAZAAR ACTIVITY & EXPENSES LEDGER (${monthName.toUpperCase()}),,,,,,,,,,,`);
  rows.push(`Date,Shopper (BazarKari),Expense Category,Mess Bazaar [Meal Rate] (Tk),Other Bills [Shared Split] (Tk),Total Expense (Tk),Daily Meals,Meal Rate [Bazaar Only] (Tk),Shopper Deposit,Remarks / Purpose,Ledger Tab,Audit Status`);

  for (const exp of expenses) {
    const totalExp = exp.shoppingExp + exp.diningExp;
    rows.push(
      `"${exp.date}","${exp.shopperName}","${exp.category}","${formatTk(exp.shoppingExp)}","${formatTk(exp.diningExp)}","${formatTk(totalExp)}",${formatNumber(summary.totalMeals, 1)},"${formatTk(summary.activeMealRate)}","${formatTk(0)}","${exp.remarks.replace(/"/g, '""')}","${exp.ledgerTab}","✔️ ${exp.auditStatus}"`
    );
  }

  rows.push(
    `"Month Ledger Total","${summary.activeMembersCount} Active Members","${expenses.length} Shopping Trips","${formatTk(summary.totalShoppingExp)} [Bazaar]","${formatTk(summary.totalDiningExp)} [Bills]","${formatTk(summary.totalExpenses)}",${formatNumber(summary.totalMeals, 1)},"${formatTk(summary.activeMealRate)}","${formatTk(summary.totalDeposits)}","Only Bazaar In Meal Rate","General Ledger","✔️ Reconciled"`
  );

  return rows.join('\n');
}

// Dormitory Bill Tracker Helpers with Integrated Meal Settlement

export function calculateDormitorySummary(
  billItems: DormitoryBillItem[],
  payments: DormitoryMemberPayment[],
  memberSettlements: MemberSettlement[] = [],
  includeMealAdjustment: boolean = true
): { summary: DormitorySummary; updatedPayments: DormitoryMemberPayment[] } {
  const totalExpenses = billItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalMembers = payments.length || 1;
  const perMemberShare = totalMembers > 0 ? totalExpenses / totalMembers : 0;

  // Map member settlements by ID or normalized name
  const settlementMap: Record<string, MemberSettlement> = {};
  for (const ms of memberSettlements) {
    settlementMap[ms.member.id] = ms;
    settlementMap[ms.member.name.toUpperCase().trim()] = ms;
  }

  let totalPaid = 0;
  let totalMealRefundsAdjustment = 0;
  let totalNetCombinedPayable = 0;

  const updatedPayments = payments.map((p) => {
    const paid = Number(p.paidAmount) || 0;
    totalPaid += paid;
    const assigned = perMemberShare;

    // Look up settlement
    const ms = settlementMap[p.memberId] || settlementMap[p.memberName.toUpperCase().trim()];
    const mealBal = ms ? ms.balance : 0;
    const mealStatus = ms ? ms.status : 'Balanced';

    // Calculate adjusted net due
    // Meal balance > 0 means refund credit (subtract from flat rent)
    // Meal balance < 0 means due deficit (add to flat rent)
    let netDue = assigned;
    if (includeMealAdjustment) {
      netDue = Math.max(0, assigned - mealBal);
      totalMealRefundsAdjustment += mealBal;
    }
    totalNetCombinedPayable += netDue;

    const remainingDue = Math.max(0, netDue - paid);

    let status: 'Paid' | 'Partial' | 'Unpaid';
    if (paid >= netDue && netDue > 0) {
      status = 'Paid';
    } else if (paid > 0) {
      status = 'Partial';
    } else if (netDue === 0 && paid === 0) {
      status = 'Paid'; // Fully covered by meal refund
    } else {
      status = 'Unpaid';
    }

    return {
      ...p,
      assignedShare: assigned,
      balanceDue: remainingDue,
      status,
      mealBalance: mealBal,
      mealStatus,
      netCombinedDue: netDue,
      netRemainingToPay: remainingDue
    };
  });

  const totalBalanceDue = Math.max(0, totalNetCombinedPayable - totalPaid);
  const paidMembersCount = updatedPayments.filter(p => p.status === 'Paid').length;

  let overallStatus: 'Pending' | 'Partially Paid' | 'Fully Collected';
  if (totalPaid === 0) {
    overallStatus = 'Pending';
  } else if (totalPaid >= totalNetCombinedPayable) {
    overallStatus = 'Fully Collected';
  } else {
    overallStatus = 'Partially Paid';
  }

  const summary: DormitorySummary = {
    totalExpenses,
    totalMembers,
    perMemberShare,
    totalPaid,
    totalBalanceDue,
    paidMembersCount,
    status: overallStatus,
    totalMealRefundsAdjustment,
    totalNetCombinedPayable,
    totalNetRemainingDue: totalBalanceDue
  };

  return { summary, updatedPayments };
}

export function generateDormitoryWhatsAppNotice(
  summary: DormitorySummary,
  billItems: DormitoryBillItem[],
  payments: DormitoryMemberPayment[],
  monthName: string = 'October - November 2026',
  includeMealAdjustment: boolean = true
): string {
  const lines: string[] = [];
  lines.push(`🏢 *DORMITORY MONTHLY BILL & SETTLEMENT NOTICE* 🏢`);
  lines.push(`📅 Period: *${monthName}*`);
  lines.push(`👥 Shared Expense Split (${summary.totalMembers} Members)`);
  lines.push(`----------------------------------------`);
  lines.push(`💰 *EXPENSE BREAKDOWN:*`);
  billItems.forEach(b => {
    lines.push(`• ${b.name}: *${formatTk(b.amount)}*`);
  });
  lines.push(`📊 *Total Flat Expenses: ${formatTk(summary.totalExpenses)}*`);
  lines.push(`👉 *Base Rent Share / Member: ${formatTk(summary.perMemberShare)}*`);

  if (includeMealAdjustment) {
    lines.push(`🍲 *Meal Settlement Adjustment: Included (One-Pay Combined)*`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`📋 *MEMBER OBLIGATION & PAYMENT STATUS:*`);
  payments.forEach((p, idx) => {
    const icon = p.status === 'Paid' ? '✅' : p.status === 'Partial' ? '🟡' : '❌';
    const mealBal = p.mealBalance || 0;
    let adjText = '';
    if (includeMealAdjustment && Math.abs(mealBal) > 0.05) {
      adjText = mealBal > 0 
        ? ` | Meal Credit: -${formatTk(mealBal)}` 
        : ` | Meal Due: +${formatTk(Math.abs(mealBal))}`;
    }

    const targetToPay = p.netCombinedDue ?? p.assignedShare;
    lines.push(
      `${idx + 1}. *${p.memberName}* ${icon}\n` +
      `   Rent: ${formatTk(p.assignedShare)}${adjText}\n` +
      `   👉 *Net Payable: ${formatTk(targetToPay)}* | Paid: ${formatTk(p.paidAmount)} | Balance: *${formatTk(p.balanceDue)}*`
    );
  });
  lines.push(`----------------------------------------`);
  lines.push(`💵 Total Collected: ${formatTk(summary.totalPaid)} | Remaining To Collect: ${formatTk(summary.totalBalanceDue)}`);
  lines.push(`💡 *Note:* Pay your adjusted net amount directly via bKash / Cash to the Mess Manager.`);

  return lines.join('\n');
}

export function exportDormitoryCSV(
  summary: DormitorySummary,
  billItems: DormitoryBillItem[],
  payments: DormitoryMemberPayment[],
  includeMealAdjustment: boolean = true
): string {
  const rows: string[] = [];
  rows.push(`Dormitory Monthly Bill & Settlement Tracker,,,,,,,,,,`);
  rows.push(`Monthly Shared Expense Split & Payment Tracker (${summary.totalMembers} Members),,,,,,,,,,`);
  rows.push(`Total Expenses,Total Members,Per-Member Share,Total Net Combined Due,Total Collected,Remaining Due,,,,,`);
  rows.push(`"${formatTk(summary.totalExpenses)}",${summary.totalMembers},"${formatTk(summary.perMemberShare)}","${formatTk(summary.totalNetCombinedPayable)}","${formatTk(summary.totalPaid)}","${formatTk(summary.totalBalanceDue)}",,,,,`);
  rows.push(`,,,,,,,,,,`);
  
  if (includeMealAdjustment) {
    rows.push(`Expense Item,Amount,,#,Member Name,Base Share,Meal Adjustment,Net Combined Due,Paid Amount,Balance Due,Status`);
  } else {
    rows.push(`Expense Item,Amount,,#,Member Name,Assigned Share,Paid Amount,Balance Due,Status,,`);
  }

  const maxRows = Math.max(billItems.length + 1, payments.length + 1);
  for (let i = 0; i < maxRows; i++) {
    const bill = billItems[i];
    const p = payments[i];

    let leftItem = '';
    let leftAmt = '';
    if (i < billItems.length) {
      leftItem = `"${bill.name}"`;
      leftAmt = `"${formatTk(bill.amount)}"`;
    } else if (i === billItems.length) {
      leftItem = `"Total Monthly Expenses"`;
      leftAmt = `"${formatTk(summary.totalExpenses)}"`;
    }

    let rightCols = '';
    if (i < payments.length) {
      const idx = `${i + 1}`;
      const name = `"${p.memberName}"`;
      const baseShare = `"${formatTk(p.assignedShare)}"`;
      const mealAdj = `"${p.mealBalance && p.mealBalance > 0 ? '-' + formatTk(p.mealBalance) : p.mealBalance && p.mealBalance < 0 ? '+' + formatTk(Math.abs(p.mealBalance)) : '৳0.00'}"`;
      const netDue = `"${formatTk(p.netCombinedDue ?? p.assignedShare)}"`;
      const paid = `"${formatTk(p.paidAmount)}"`;
      const due = `"${formatTk(p.balanceDue)}"`;
      const status = `"${p.status}"`;

      if (includeMealAdjustment) {
        rightCols = `${idx},${name},${baseShare},${mealAdj},${netDue},${paid},${due},${status}`;
      } else {
        rightCols = `${idx},${name},${baseShare},${paid},${due},${status},,`;
      }
    } else if (i === payments.length) {
      const idx = `"Total"`;
      const name = `""`;
      const baseShare = `"${formatTk(summary.totalExpenses)}"`;
      const mealAdj = `"${formatTk(summary.totalMealRefundsAdjustment)}"`;
      const netDue = `"${formatTk(summary.totalNetCombinedPayable)}"`;
      const paid = `"${formatTk(summary.totalPaid)}"`;
      const due = `"${formatTk(summary.totalBalanceDue)}"`;
      const status = `"${summary.status}"`;

      if (includeMealAdjustment) {
        rightCols = `${idx},${name},${baseShare},${mealAdj},${netDue},${paid},${due},${status}`;
      } else {
        rightCols = `${idx},${name},${baseShare},${paid},${due},${status},,`;
      }
    }

    rows.push(`${leftItem},${leftAmt},,${rightCols}`);
  }

  return rows.join('\n');
}


