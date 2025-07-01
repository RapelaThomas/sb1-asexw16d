import {
  Income,
  Expense,
  Loan,
  Bill,
  DailyEntry,
  BusinessEntry,
  FinancialGoal,
  BankAccount,
  AutoAllocation,
  FinancialHealth,
  DebtRecommendation,
  SpendingAllowance,
  UserPreferences,
  PaymentSuggestion,
  ExpectedPayment,
  Currency
} from '../types';

// Default currencies with KES as default
export const defaultCurrencies: Currency[] = [
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

// Format currency
export const formatCurrency = (amount: number, currency: Currency = defaultCurrencies[0]): string => {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  
  return amount < 0 ? `-${formatted}` : formatted;
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate monthly amount based on frequency
export const calculateMonthlyAmount = (amount: number, frequency: string): number => {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33; // Average weeks in a month
    case 'biweekly':
      return amount * 2.17; // Average bi-weeks in a month
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
};

// Calculate total monthly income
export const calculateTotalMonthlyIncome = (incomes: Income[]): number => {
  return incomes.reduce((total, income) => total + income.monthlyAmount, 0);
};

// Calculate total monthly expenses
export const calculateTotalMonthlyExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.monthlyAmount, 0);
};

// Calculate total debt
export const calculateTotalDebt = (loans: Loan[], bankAccounts: BankAccount[] = []): number => {
  // Sum loan balances
  const loanDebt = loans.reduce((total, loan) => total + loan.currentBalance, 0);
  
  // Add negative bank account balances (credit cards, overdrafts)
  const accountDebt = bankAccounts
    .filter(account => account.isActive)
    .reduce((total, account) => {
      let accountDebt = 0;
      
      // Add negative balance
      if (account.balance < 0) {
        accountDebt += Math.abs(account.balance);
      }
      
      // Add overdraft used
      if (account.hasOverdraft && account.overdraftUsed) {
        accountDebt += account.overdraftUsed;
      }
      
      return total + accountDebt;
    }, 0);
  
  return loanDebt + accountDebt;
};

// Calculate minimum payments
export const calculateMinimumPayments = (loans: Loan[], bankAccounts: BankAccount[] = []): number => {
  // Sum loan minimum payments
  const loanPayments = loans.reduce((total, loan) => total + loan.minimumPayment, 0);
  
  // Calculate minimum payments for negative bank accounts
  const accountPayments = bankAccounts
    .filter(account => account.isActive)
    .reduce((total, account) => {
      let payment = 0;
      
      // For negative balances, assume 5% minimum payment or $25, whichever is greater
      if (account.balance < 0) {
        payment += Math.max(Math.abs(account.balance) * 0.05, 25);
      }
      
      // For overdrafts, assume 5% minimum payment
      if (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0) {
        payment += account.overdraftUsed * 0.05;
      }
      
      return total + payment;
    }, 0);
  
  return loanPayments + accountPayments;
};

// Calculate interest per month
export const calculateInterestPerMonth = (loan: Loan): number => {
  return (loan.currentBalance * loan.interestRate) / 100;
};

// Calculate daily average
export const calculateDailyAverage = (dailyEntries: DailyEntry[], days: number = 30): { income: number; expenses: number } => {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  const recentEntries = dailyEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= now;
  });
  
  const totalIncome = recentEntries.reduce((sum, entry) => sum + entry.income, 0);
  const totalExpenses = recentEntries.reduce((sum, entry) => sum + entry.expenses, 0);
  
  return {
    income: totalIncome / days,
    expenses: totalExpenses / days
  };
};

// Calculate business contribution
export const calculateBusinessContribution = (businessEntries: BusinessEntry[]): number => {
  // Get entries from the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const recentEntries = businessEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= thirtyDaysAgo && entryDate <= now;
  });
  
  // Calculate average monthly profit
  const totalProfit = recentEntries.reduce((sum, entry) => sum + entry.profit, 0);
  return totalProfit / 30 * 30; // Convert to monthly
};

// Get upcoming bills
export const getUpcomingBills = (bills: Bill[], days: number = 7): Bill[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return bills.filter(bill => {
    if (bill.isPaid) return false;
    const dueDate = new Date(bill.dueDate);
    return dueDate >= now && dueDate <= futureDate;
  });
};

// Get upcoming expected payments
export const getUpcomingExpectedPayments = (payments: ExpectedPayment[], days: number = 7): ExpectedPayment[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return payments.filter(payment => {
    if (payment.isPaid) return false;
    const expectedDate = new Date(payment.expectedDate);
    return expectedDate >= now && expectedDate <= futureDate;
  });
};

// Get overdue expected payments
export const getOverdueExpectedPayments = (payments: ExpectedPayment[]): ExpectedPayment[] => {
  const now = new Date();
  
  return payments.filter(payment => {
    if (payment.isPaid) return false;
    const expectedDate = new Date(payment.expectedDate);
    return expectedDate < now;
  });
};

// Calculate goal progress
export const calculateGoalProgress = (goal: FinancialGoal): {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  daysRemaining: number;
  progressPercentage: number;
  monthlyRequired: number;
  isOnTrack: boolean;
  status: 'ahead' | 'on-track' | 'behind' | 'at-risk';
  monthsRemaining?: number;
} => {
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
  
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const monthlyRequired = remainingAmount / monthsRemaining;
  
  // Determine if on track
  const elapsedPercentage = 100 - ((daysRemaining / (daysRemaining + (now.getTime() - new Date(goal.createdAt || now).getTime()) / (1000 * 60 * 60 * 24))) * 100);
  const isOnTrack = progressPercentage >= elapsedPercentage;
  
  // Determine status
  let status: 'ahead' | 'on-track' | 'behind' | 'at-risk';
  if (progressPercentage >= elapsedPercentage + 10) {
    status = 'ahead';
  } else if (progressPercentage >= elapsedPercentage - 10) {
    status = 'on-track';
  } else if (progressPercentage >= elapsedPercentage - 25) {
    status = 'behind';
  } else {
    status = 'at-risk';
  }
  
  return {
    goalId: goal.id,
    goalName: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate,
    daysRemaining,
    progressPercentage,
    monthlyRequired,
    isOnTrack,
    status,
    monthsRemaining
  };
};

// Calculate spending allowance
export const calculateSpendingAllowance = (
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  goals: FinancialGoal[],
  businessEntries: BusinessEntry[],
  preferences: UserPreferences,
  bankAccounts: BankAccount[] = []
): SpendingAllowance => {
  const totalIncome = calculateTotalMonthlyIncome(incomes) + calculateBusinessContribution(businessEntries);
  const needsExpenses = expenses.filter(e => e.category === 'need');
  const wantsExpenses = expenses.filter(e => e.category === 'want');
  
  const totalNeeds = calculateTotalMonthlyExpenses(needsExpenses);
  const totalWants = calculateTotalMonthlyExpenses(wantsExpenses);
  const minimumDebtPayments = calculateMinimumPayments(loans, bankAccounts);
  
  // Calculate allowance based on 50/30/20 rule
  const idealWantsPercentage = 0.3; // 30% for wants
  const allowedWantsSpending = totalIncome * idealWantsPercentage;
  const remainingWantsAllowance = allowedWantsSpending - totalWants;
  
  // Determine if spending is allowed
  const canSpend = remainingWantsAllowance > 0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  const restrictions: string[] = [];
  
  if (remainingWantsAllowance < 0) {
    restrictions.push(`You've exceeded your monthly wants budget by KES ${Math.abs(remainingWantsAllowance).toFixed(0)}`);
    restrictions.push('Consider reducing non-essential spending for the rest of the month');
  } else if (remainingWantsAllowance < allowedWantsSpending * 0.2) {
    recommendations.push(`You have KES ${remainingWantsAllowance.toFixed(0)} left for wants this month (less than 20% of your budget)`);
    recommendations.push('Be mindful of additional discretionary spending');
  } else {
    recommendations.push(`You have KES ${remainingWantsAllowance.toFixed(0)} available for wants this month`);
  }
  
  // Add debt-related recommendations
  const totalDebt = calculateTotalDebt(loans, bankAccounts);
  if (totalDebt > 0 && totalDebt > totalIncome * 3) {
    restrictions.push('Your debt level is high relative to income');
    restrictions.push('Consider prioritizing debt repayment over discretionary spending');
  }
  
  // Add goal-related recommendations
  const urgentGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal);
    return progress.status === 'behind' || progress.status === 'at-risk';
  });
  
  if (urgentGoals.length > 0) {
    recommendations.push(`You have ${urgentGoals.length} financial goals that need attention`);
    recommendations.push('Consider allocating more to goals instead of discretionary spending');
  }
  
  return {
    allowedWantsSpending,
    currentWantsSpending: totalWants,
    remainingWantsAllowance,
    canSpend,
    recommendations,
    restrictions
  };
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // If previous was zero, and current is positive, that's a 100% increase
  }
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Calculate net worth
export const calculateNetWorth = (
  bankAccounts: BankAccount[] = [],
  loans: Loan[] = [],
  goals: FinancialGoal[] = [],
  expectedPayments: ExpectedPayment[] = []
): number => {
  // Assets: positive bank account balances + goal progress + expected income
  const assets = bankAccounts
    .filter(account => account.isActive)
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  
  const goalAssets = goals
    .filter(goal => goal.category === 'investment' || goal.category === 'emergency')
    .reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  const expectedIncome = expectedPayments
    .filter(payment => payment.type === 'income' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Liabilities: loans + negative bank account balances + overdrafts + expected expenses
  const loanLiabilities = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  
  const accountLiabilities = bankAccounts
    .filter(account => account.isActive)
    .reduce((sum, account) => {
      let liability = 0;
      
      // Add negative balance
      if (account.balance < 0) {
        liability += Math.abs(account.balance);
      }
      
      // Add overdraft used
      if (account.hasOverdraft && account.overdraftUsed) {
        liability += account.overdraftUsed;
      }
      
      return sum + liability;
    }, 0);
  
  const expectedExpenses = expectedPayments
    .filter(payment => payment.type === 'expense' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  return (assets + goalAssets + expectedIncome) - (loanLiabilities + accountLiabilities + expectedExpenses);
};

// Generate debt recommendations
export const generateDebtRecommendations = (
  loans: Loan[],
  extraPayment: number,
  strategy: 'avalanche' | 'snowball' | 'hybrid',
  bankAccounts: BankAccount[] = []
): DebtRecommendation[] => {
  const recommendations: DebtRecommendation[] = [];
  
  // First, handle account debts (negative balances and overdrafts)
  bankAccounts
    .filter(account => account.isActive && (
      account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    ))
    .forEach((account, index) => {
      const negativeBalance = Math.abs(Math.min(0, account.balance));
      const overdraftUsed = account.overdraftUsed || 0;
      const totalDebt = negativeBalance + overdraftUsed;
      
      if (totalDebt > 0) {
        // Account debts are always highest priority regardless of strategy
        recommendations.push({
          loanId: account.id,
          loanName: `${account.name} Account`,
          strategy,
          priority: index + 1,
          reason: `Account debt should be prioritized to avoid fees and penalties`,
          suggestedPayment: Math.max(totalDebt * 0.1, 50), // Suggest 10% of balance or $50, whichever is greater
          urgencyScore: 100 - index, // Higher score = higher urgency
          payoffMonths: 10, // Simplified
          totalInterest: totalDebt * 0.2 // Simplified estimate of fees/interest
        });
      }
    });
  
  // Then handle regular loans
  const sortedLoans = [...loans].sort((a, b) => {
    if (strategy === 'avalanche') {
      // Sort by interest rate (highest first)
      return b.interestRate - a.interestRate;
    } else if (strategy === 'snowball') {
      // Sort by balance (lowest first)
      return a.currentBalance - b.currentBalance;
    } else {
      // Hybrid: consider both interest rate and balance
      const aScore = (a.interestRate * 0.7) + ((1 / a.currentBalance) * 0.3 * 1000);
      const bScore = (b.interestRate * 0.7) + ((1 / b.currentBalance) * 0.3 * 1000);
      return bScore - aScore;
    }
  });
  
  // Start with account debts priority count
  let priorityCount = recommendations.length;
  
  sortedLoans.forEach((loan, index) => {
    priorityCount++;
    
    let reason = '';
    if (strategy === 'avalanche') {
      reason = `High interest rate of ${loan.interestRate}% makes this a priority for the avalanche method`;
    } else if (strategy === 'snowball') {
      reason = `Small balance of KES ${loan.currentBalance.toFixed(0)} makes this a good quick win for the snowball method`;
    } else {
      reason = `Optimized based on both interest rate and balance for maximum financial benefit`;
    }
    
    // Calculate suggested payment
    let suggestedPayment = loan.minimumPayment;
    if (index === 0) {
      // Add extra payment to highest priority loan
      suggestedPayment += extraPayment;
    }
    
    // Calculate months to payoff
    const monthlyInterestRate = loan.interestRate / 100;
    let payoffMonths = 0;
    
    if (suggestedPayment > loan.currentBalance * monthlyInterestRate) {
      payoffMonths = Math.ceil(
        Math.log(suggestedPayment / (suggestedPayment - loan.currentBalance * monthlyInterestRate)) / 
        Math.log(1 + monthlyInterestRate)
      );
    } else {
      payoffMonths = 999; // Effectively never if payment is less than monthly interest
    }
    
    // Calculate total interest
    let totalInterest = 0;
    if (payoffMonths < 999) {
      totalInterest = (suggestedPayment * payoffMonths) - loan.currentBalance;
    } else {
      totalInterest = loan.currentBalance * 2; // Simplified estimate for "infinite" payoff
    }
    
    recommendations.push({
      loanId: loan.id,
      loanName: loan.name,
      strategy,
      priority: priorityCount,
      reason,
      suggestedPayment,
      urgencyScore: 90 - index * 5, // Higher score = higher urgency
      payoffMonths,
      totalInterest
    });
  });
  
  return recommendations;
};

// Suggest optimal debt strategy
export const suggestOptimalDebtStrategy = (
  loans: Loan[],
  incomes: Income[],
  expenses: Expense[],
  dailyEntries: DailyEntry[],
  bankAccounts: BankAccount[] = []
): 'avalanche' | 'snowball' | 'hybrid' => {
  // If no loans, default to avalanche
  if (loans.length === 0) return 'avalanche';
  
  // Calculate total debt and average interest rate
  const totalDebt = calculateTotalDebt(loans, bankAccounts);
  const avgInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length;
  
  // Calculate monthly disposable income
  const monthlyIncome = calculateTotalMonthlyIncome(incomes);
  const monthlyExpenses = calculateTotalMonthlyExpenses(expenses);
  const minimumPayments = calculateMinimumPayments(loans, bankAccounts);
  const disposableIncome = monthlyIncome - monthlyExpenses - minimumPayments;
  
  // Check for small quick-win debts
  const hasSmallDebts = loans.some(loan => loan.currentBalance < monthlyIncome * 0.5);
  
  // Check for high-interest debts
  const hasHighInterestDebts = loans.some(loan => loan.interestRate > 15);
  
  // Check for psychological factors (simplified)
  const needsMotivation = dailyEntries.length < 10; // Low engagement might indicate need for motivation
  
  // Decision logic
  if (disposableIncome < 0 || needsMotivation || hasSmallDebts) {
    // If struggling financially or needs motivation, snowball for psychological wins
    return 'snowball';
  } else if (hasHighInterestDebts || avgInterestRate > 10) {
    // If high interest rates, avalanche to minimize interest
    return 'avalanche';
  } else {
    // Otherwise, use hybrid approach
    return 'hybrid';
  }
};

// Generate payment suggestions
export const generatePaymentSuggestions = (
  loans: Loan[],
  bills: Bill[],
  goals: FinancialGoal[],
  availableAmount: number,
  preferences: UserPreferences,
  financialHealth: FinancialHealth,
  bankAccounts: BankAccount[] = []
): PaymentSuggestion[] => {
  const suggestions: PaymentSuggestion[] = [];
  
  // First, handle account debts (negative balances and overdrafts)
  bankAccounts
    .filter(account => account.isActive && (
      account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    ))
    .forEach((account, index) => {
      const negativeBalance = Math.abs(Math.min(0, account.balance));
      const overdraftUsed = account.overdraftUsed || 0;
      const totalDebt = negativeBalance + overdraftUsed;
      
      if (totalDebt > 0) {
        suggestions.push({
          id: `account-${account.id}`,
          type: 'loan',
          name: `${account.name} Account Debt`,
          amount: Math.min(totalDebt, availableAmount * 0.5), // Suggest using up to 50% of available funds
          priority: index + 1,
          reason: 'Account debt typically has high fees and should be prioritized',
          urgency: 'critical',
          completed: false
        });
      }
    });
  
  // Handle loans based on strategy
  const strategy = preferences.debtStrategy || 'avalanche';
  const debtRecommendations = generateDebtRecommendations(loans, availableAmount, strategy, []);
  
  debtRecommendations.slice(0, 2).forEach((rec, index) => {
    const loan = loans.find(l => l.id === rec.loanId);
    if (loan) {
      suggestions.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        name: loan.name,
        amount: rec.suggestedPayment,
        priority: suggestions.length + 1,
        reason: rec.reason,
        urgency: index === 0 ? 'high' : 'medium',
        dueDate: loan.dueDate,
        completed: false
      });
    }
  });
  
  // Handle urgent bills
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const urgentBills = unpaidBills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7;
  });
  
  urgentBills.forEach(bill => {
    suggestions.push({
      id: `bill-${bill.id}`,
      type: 'bill',
      name: bill.name,
      amount: bill.amount,
      priority: suggestions.length + 1,
      reason: `Due in ${Math.max(0, Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days`,
      urgency: 'high',
      dueDate: bill.dueDate,
      completed: false
    });
  });
  
  // Handle high-priority goals
  const highPriorityGoals = goals.filter(goal => goal.priority === 'high');
  
  highPriorityGoals.slice(0, 1).forEach(goal => {
    const progress = calculateGoalProgress(goal);
    if (progress.status === 'behind' || progress.status === 'at-risk') {
      suggestions.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        name: goal.name,
        amount: progress.monthlyRequired,
        priority: suggestions.length + 1,
        reason: `Goal is ${progress.status}. Needs regular contributions to stay on track.`,
        urgency: 'medium',
        dueDate: goal.targetDate,
        completed: false
      });
    }
  });
  
  return suggestions.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });
};

// Get next payment recommendation
export const getNextPaymentRecommendation = (
  loans: Loan[],
  bills: Bill[],
  availableAmount: number,
  strategy: 'avalanche' | 'snowball' | 'hybrid' = 'avalanche',
  bankAccounts: BankAccount[] = []
): { loanId: string; name: string; amount: number; reason: string } | null => {
  // First check for account debts
  const accountsWithDebt = bankAccounts
    .filter(account => account.isActive && (
      account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    ));
  
  if (accountsWithDebt.length > 0) {
    const account = accountsWithDebt[0];
    const negativeBalance = Math.abs(Math.min(0, account.balance));
    const overdraftUsed = account.overdraftUsed || 0;
    const totalDebt = negativeBalance + overdraftUsed;
    
    return {
      loanId: account.id,
      name: `${account.name} Account Debt`,
      amount: Math.min(totalDebt, availableAmount * 0.5),
      reason: 'Account debt typically has high fees and should be prioritized'
    };
  }
  
  // Then check for loans
  if (loans.length > 0) {
    const recommendations = generateDebtRecommendations(loans, availableAmount, strategy);
    if (recommendations.length > 0) {
      const topRec = recommendations[0];
      const loan = loans.find(l => l.id === topRec.loanId);
      if (loan) {
        return {
          loanId: loan.id,
          name: loan.name,
          amount: topRec.suggestedPayment,
          reason: topRec.reason
        };
      }
    }
  }
  
  // Then check for urgent bills
  const urgentBills = bills.filter(bill => {
    if (bill.isPaid) return false;
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3;
  });
  
  if (urgentBills.length > 0) {
    const bill = urgentBills[0];
    return {
      loanId: bill.id,
      name: bill.name,
      amount: bill.amount,
      reason: `Due in ${Math.max(0, Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days`
    };
  }
  
  return null;
};

// Calculate financial health
export const calculateFinancialHealth = (
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  dailyEntries: DailyEntry[],
  businessEntries: BusinessEntry[],
  goals: FinancialGoal[],
  bankAccounts: BankAccount[] = [],
  expectedPayments: ExpectedPayment[] = []
): FinancialHealth => {
  // Calculate key metrics
  const totalIncome = calculateTotalMonthlyIncome(incomes) + calculateBusinessContribution(businessEntries);
  const totalExpenses = calculateTotalMonthlyExpenses(expenses);
  const totalDebt = calculateTotalDebt(loans, bankAccounts);
  const minimumPayments = calculateMinimumPayments(loans, bankAccounts);
  
  // Calculate net worth
  const netWorth = calculateNetWorth(bankAccounts, loans, goals, expectedPayments);
  
  // Calculate debt-to-income ratio
  const debtToIncomeRatio = totalIncome > 0 ? (minimumPayments / totalIncome) * 100 : 100;
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses - minimumPayments) / totalIncome) * 100 : 0;
  
  // Calculate emergency fund ratio
  const monthlyExpenses = totalExpenses + minimumPayments;
  const emergencyFunds = bankAccounts
    .filter(account => account.isActive && account.type === 'savings')
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  
  const emergencyFundRatio = monthlyExpenses > 0 ? emergencyFunds / (monthlyExpenses * 6) : 0;
  
  // Calculate business contribution
  const businessContribution = calculateBusinessContribution(businessEntries);
  
  // Calculate financial health score (0-100)
  let score = 0;
  
  // If there's no data, set score to 0
  if (totalIncome === 0 && totalExpenses === 0 && totalDebt === 0 && emergencyFunds === 0) {
    score = 0;
  } else {
    // Debt-to-income component (30 points)
    if (debtToIncomeRatio <= 10) score += 30;
    else if (debtToIncomeRatio <= 20) score += 25;
    else if (debtToIncomeRatio <= 30) score += 20;
    else if (debtToIncomeRatio <= 40) score += 15;
    else if (debtToIncomeRatio <= 50) score += 10;
    else score += 5;
    
    // Savings rate component (30 points)
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 15;
    else if (savingsRate >= 0) score += 10;
    else score += 0;
    
    // Emergency fund component (20 points)
    if (emergencyFundRatio >= 1) score += 20;
    else if (emergencyFundRatio >= 0.75) score += 15;
    else if (emergencyFundRatio >= 0.5) score += 10;
    else if (emergencyFundRatio >= 0.25) score += 5;
    else score += 0;
    
    // Net worth component (10 points)
    if (netWorth > totalIncome * 12) score += 10;
    else if (netWorth > totalIncome * 6) score += 8;
    else if (netWorth > totalIncome * 3) score += 6;
    else if (netWorth > 0) score += 4;
    else score += 0;
    
    // Income diversity component (5 points)
    if (incomes.length > 2) score += 5;
    else if (incomes.length > 1) score += 3;
    else score += 0;
    
    // Business income component (5 points)
    if (businessContribution > totalIncome * 0.2) score += 5;
    else if (businessContribution > 0) score += 3;
    else score += 0;
  }
  
  // Determine financial health level
  let level: 'poor' | 'fair' | 'good' | 'excellent';
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'fair';
  else level = 'poor';
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (debtToIncomeRatio > 30) {
    recommendations.push('Focus on reducing debt to improve your debt-to-income ratio');
  }
  
  if (savingsRate < 10) {
    recommendations.push('Increase your savings rate by reducing expenses or increasing income');
  }
  
  if (emergencyFundRatio < 0.5) {
    recommendations.push('Build your emergency fund to cover at least 3-6 months of expenses');
  }
  
  if (netWorth < 0) {
    recommendations.push('Work on increasing your net worth by paying down debt and building assets');
  }
  
  if (incomes.length <= 1) {
    recommendations.push('Consider developing additional income streams to increase financial security');
  }
  
  // Suggest optimal strategy
  let suggestedStrategy: 'debt-focused' | 'balanced' | 'savings-focused';
  
  if (debtToIncomeRatio > 40 || totalDebt > totalIncome * 6) {
    suggestedStrategy = 'debt-focused';
  } else if (emergencyFundRatio < 0.5 || savingsRate < 10) {
    suggestedStrategy = 'savings-focused';
  } else {
    suggestedStrategy = 'balanced';
  }
  
  return {
    score,
    level,
    debtToIncomeRatio,
    emergencyFundRatio,
    savingsRate,
    netWorth,
    businessContribution,
    recommendations,
    suggestedStrategy
  };
};

// Calculate auto allocation
export const calculateAutoAllocation = (
  monthlyIncome: number,
  monthlyExpenses: number,
  loans: Loan[],
  goals: FinancialGoal[],
  businessEntries: BusinessEntry[],
  preferences: UserPreferences,
  financialHealth: FinancialHealth,
  bankAccounts: BankAccount[] = []
): AutoAllocation => {
  // Calculate business profit contribution
  const businessProfit = calculateBusinessContribution(businessEntries);
  
  // Calculate total income including business
  const totalIncome = monthlyIncome + businessProfit;
  
  // Calculate minimum debt payments
  const minimumDebtPayments = calculateMinimumPayments(loans, bankAccounts);
  
  // Calculate account debt payment (negative balances and overdrafts)
  const accountDebtPayment = bankAccounts
    .filter(account => account.isActive)
    .reduce((total, account) => {
      let payment = 0;
      
      // For negative balances, assume 10% payment
      if (account.balance < 0) {
        payment += Math.abs(account.balance) * 0.1;
      }
      
      // For overdrafts, assume 20% payment
      if (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0) {
        payment += account.overdraftUsed * 0.2;
      }
      
      return total + payment;
    }, 0);
  
  // Calculate available amount for allocation
  const availableForAllocation = Math.max(0, totalIncome - monthlyExpenses - minimumDebtPayments - accountDebtPayment);
  
  // Determine allocation percentages based on strategy
  let debtPercentage = 0.2; // Default: 20% to debt
  let emergencyPercentage = 0.1; // Default: 10% to emergency fund
  let investmentPercentage = 0.1; // Default: 10% to investments
  let wantsPercentage = 0.3; // Default: 30% to wants
  
  switch (preferences.strategy) {
    case 'debt-focused':
      debtPercentage = 0.5; // 50% to debt
      emergencyPercentage = 0.1; // 10% to emergency fund
      investmentPercentage = 0.05; // 5% to investments
      wantsPercentage = 0.15; // 15% to wants
      break;
    case 'savings-focused':
      debtPercentage = 0.1; // 10% to debt
      emergencyPercentage = 0.2; // 20% to emergency fund
      investmentPercentage = 0.2; // 20% to investments
      wantsPercentage = 0.2; // 20% to wants
      break;
  }
  
  // Adjust based on financial health
  if (financialHealth.level === 'poor') {
    // Prioritize emergency fund and debt
    emergencyPercentage += 0.1;
    debtPercentage += 0.1;
    investmentPercentage -= 0.1;
    wantsPercentage -= 0.1;
  } else if (financialHealth.level === 'excellent') {
    // More towards investments
    investmentPercentage += 0.1;
    debtPercentage -= 0.05;
    wantsPercentage -= 0.05;
  }
  
  // Calculate allocations
  const debtPayment = availableForAllocation * debtPercentage + minimumDebtPayments + accountDebtPayment;
  const emergencyFund = availableForAllocation * emergencyPercentage;
  const investments = availableForAllocation * investmentPercentage;
  const wants = availableForAllocation * wantsPercentage;
  const needs = monthlyExpenses;
  
  // Calculate unallocated amount
  const totalAllocated = debtPayment + emergencyFund + investments + wants + needs;
  const unallocated = Math.max(0, totalIncome - totalAllocated);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (financialHealth.debtToIncomeRatio > 30) {
    recommendations.push('Your debt-to-income ratio is high. Consider allocating more to debt repayment.');
  }
  
  if (financialHealth.emergencyFundRatio < 0.5) {
    recommendations.push('Your emergency fund is below target. Prioritize building it to at least 3 months of expenses.');
  }
  
  if (financialHealth.savingsRate < 10) {
    recommendations.push('Your savings rate is low. Try to increase income or reduce expenses to save more.');
  }
  
  if (accountDebtPayment > 0) {
    recommendations.push('Prioritize paying off account debts and overdrafts to avoid high fees and interest.');
  }
  
  return {
    debtPayment,
    emergencyFund,
    investments,
    needs,
    wants,
    businessProfit,
    totalAllocated,
    recommendations,
    detailedBreakdown: {
      totalIncome,
      fixedExpenses: monthlyExpenses,
      minimumDebtPayments,
      accountDebtPayment,
      availableForAllocation,
      emergencyFundAllocation: emergencyFund,
      investmentAllocation: investments,
      extraDebtPayment: debtPayment - minimumDebtPayments - accountDebtPayment,
      wantsAllocation: wants,
      unallocated
    }
  };
};