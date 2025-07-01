import { 
  Income, 
  Expense, 
  Loan, 
  Bill, 
  DailyEntry, 
  BusinessEntry, 
  FinancialGoal, 
  BankAccount,
  ExpectedPayment,
  Currency,
  UserPreferences,
  SpendingPattern,
  CashFlowEvent,
  RecurringTransaction,
  BillNegotiation,
  GoalForecast,
  HealthImprovementStep,
  EmergencyPreparedness,
  Celebration
} from '../types';

// Recurring Transactions Automation
export const generateRecurringTransactions = (
  incomes: Income[],
  expenses: Expense[],
  bills: Bill[]
): RecurringTransaction[] => {
  const recurring: RecurringTransaction[] = [];
  const today = new Date();

  // Process recurring incomes
  incomes.forEach(income => {
    if (income.isRecurring) {
      const nextOccurrence = calculateNextOccurrence(today, income.frequency);
      recurring.push({
        id: `income-${income.id}`,
        type: 'income',
        name: income.source,
        amount: income.amount,
        frequency: income.frequency,
        nextOccurrence: nextOccurrence.toISOString().split('T')[0],
        bankAccountId: income.bankAccountId,
        isActive: true,
        autoGenerate: true
      });
    }
  });

  // Process recurring expenses
  expenses.forEach(expense => {
    if (expense.isRecurring) {
      const nextOccurrence = calculateNextOccurrence(today, expense.frequency);
      recurring.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        name: expense.name,
        amount: expense.amount,
        frequency: expense.frequency,
        nextOccurrence: nextOccurrence.toISOString().split('T')[0],
        bankAccountId: expense.bankAccountId,
        category: expense.category,
        isActive: true,
        autoGenerate: true
      });
    }
  });

  // Process recurring bills
  bills.forEach(bill => {
    if (bill.isRecurring) {
      const nextOccurrence = calculateNextOccurrence(today, bill.frequency);
      recurring.push({
        id: `bill-${bill.id}`,
        type: 'bill',
        name: bill.name,
        amount: bill.amount,
        frequency: bill.frequency,
        nextOccurrence: nextOccurrence.toISOString().split('T')[0],
        bankAccountId: bill.bankAccountId || '',
        category: bill.category,
        isActive: true,
        autoGenerate: true
      });
    }
  });

  return recurring;
};

const calculateNextOccurrence = (
  lastDate: Date, 
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly'
): Date => {
  const next = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
};

// Financial Goal Forecasting
export const generateGoalForecast = (
  goal: FinancialGoal,
  monthlyIncome: number,
  monthlyExpenses: number,
  currentSavingsRate: number
): GoalForecast => {
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  const availableForGoals = (monthlyIncome - monthlyExpenses) * (currentSavingsRate / 100);
  const monthlyContributionNeeded = remainingAmount / monthsRemaining;
  
  // Calculate probability of success
  let probabilityOfSuccess = 100;
  if (monthlyContributionNeeded > availableForGoals) {
    probabilityOfSuccess = Math.max(20, (availableForGoals / monthlyContributionNeeded) * 100);
  }
  
  // Generate milestones
  const milestones: any[] = [];
  const milestonePercentages = [25, 50, 75, 100];
  
  milestonePercentages.forEach(percentage => {
    const milestoneAmount = (goal.targetAmount * percentage) / 100;
    const monthsToMilestone = Math.ceil((milestoneAmount - goal.currentAmount) / Math.max(1, availableForGoals));
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsToMilestone);
    
    milestones.push({
      percentage,
      amount: milestoneAmount,
      estimatedDate: estimatedDate.toISOString().split('T')[0],
      achieved: goal.currentAmount >= milestoneAmount,
      achievedDate: goal.currentAmount >= milestoneAmount ? today.toISOString().split('T')[0] : undefined
    });
  });
  
  // Generate recommendations
  const recommendedAdjustments: string[] = [];
  if (probabilityOfSuccess < 80) {
    recommendedAdjustments.push(`Increase monthly contribution by KSh ${((monthlyContributionNeeded - availableForGoals) * 1.1).toFixed(0)} to improve success rate`);
    recommendedAdjustments.push('Consider extending target date by 3-6 months');
    recommendedAdjustments.push('Review and reduce non-essential expenses');
  }
  
  if (probabilityOfSuccess > 95) {
    recommendedAdjustments.push('Consider increasing goal amount or setting additional goals');
    recommendedAdjustments.push('Explore investment options for excess savings');
  }
  
  const projectedMonths = Math.ceil(remainingAmount / Math.max(1, availableForGoals));
  const projectedCompletionDate = new Date();
  projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + projectedMonths);
  
  return {
    projectedCompletionDate: projectedCompletionDate.toISOString().split('T')[0],
    monthlyContributionNeeded,
    probabilityOfSuccess: Math.round(probabilityOfSuccess),
    recommendedAdjustments,
    milestones
  };
};

// Cash Flow Calendar
export const generateCashFlowCalendar = (
  incomes: Income[],
  expenses: Expense[],
  bills: Bill[],
  loans: Loan[],
  expectedPayments: ExpectedPayment[],
  goals: FinancialGoal[],
  daysAhead: number = 90
): CashFlowEvent[] => {
  const events: CashFlowEvent[] = [];
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + daysAhead);
  
  // Generate recurring income events
  incomes.forEach(income => {
    if (income.isRecurring) {
      let currentDate = new Date(income.nextOccurrence || today);
      while (currentDate <= endDate) {
        events.push({
          id: `income-${income.id}-${currentDate.getTime()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'income',
          name: income.source,
          amount: income.amount,
          category: 'income',
          bankAccountId: income.bankAccountId,
          isRecurring: true,
          status: 'scheduled',
          confidence: 0.9
        });
        currentDate = calculateNextOccurrence(currentDate, income.frequency);
      }
    }
  });
  
  // Generate recurring expense events
  expenses.forEach(expense => {
    if (expense.isRecurring) {
      let currentDate = new Date(expense.nextOccurrence || today);
      while (currentDate <= endDate) {
        events.push({
          id: `expense-${expense.id}-${currentDate.getTime()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'expense',
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          bankAccountId: expense.bankAccountId,
          isRecurring: true,
          status: 'scheduled',
          confidence: 0.85
        });
        currentDate = calculateNextOccurrence(currentDate, expense.frequency);
      }
    }
  });
  
  // Add bill events
  bills.forEach(bill => {
    if (!bill.isPaid) {
      const billDate = new Date(bill.dueDate);
      if (billDate <= endDate) {
        events.push({
          id: `bill-${bill.id}`,
          date: bill.dueDate,
          type: 'bill',
          name: bill.name,
          amount: bill.amount,
          category: bill.category,
          bankAccountId: bill.bankAccountId || '',
          isRecurring: bill.isRecurring || false,
          status: billDate < today ? 'overdue' : 'scheduled',
          confidence: 0.95
        });
      }
    }
  });
  
  // Add loan payment events
  loans.forEach(loan => {
    if (loan.dueDate) {
      const dueDate = new Date(loan.dueDate);
      if (dueDate <= endDate) {
        events.push({
          id: `loan-${loan.id}`,
          date: loan.dueDate,
          type: 'loan_payment',
          name: `${loan.name} Payment`,
          amount: loan.minimumPayment,
          category: 'debt',
          bankAccountId: '',
          isRecurring: true,
          status: dueDate < today ? 'overdue' : 'scheduled',
          confidence: 0.98
        });
      }
    }
  });
  
  // Add expected payments
  expectedPayments.forEach(payment => {
    if (!payment.isPaid) {
      const paymentDate = new Date(payment.expectedDate);
      if (paymentDate <= endDate) {
        events.push({
          id: `expected-${payment.id}`,
          date: payment.expectedDate,
          type: payment.type as 'income' | 'expense',
          name: payment.name,
          amount: payment.amount,
          category: payment.type,
          bankAccountId: payment.bankAccountId,
          isRecurring: false,
          status: paymentDate < today ? 'overdue' : 'scheduled',
          confidence: 0.7
        });
      }
    }
  });
  
  // Add goal contribution events (monthly)
  goals.forEach(goal => {
    if (goal.priority === 'high') {
      const monthlyContribution = (goal.targetAmount - goal.currentAmount) / 12; // Assume 12 months
      let currentDate = new Date(today);
      currentDate.setDate(1); // First of month
      
      while (currentDate <= endDate) {
        events.push({
          id: `goal-${goal.id}-${currentDate.getTime()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'goal_contribution',
          name: `${goal.name} Contribution`,
          amount: monthlyContribution,
          category: 'savings',
          bankAccountId: '',
          isRecurring: true,
          status: 'scheduled',
          confidence: 0.6
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
  });
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Spending Pattern Analysis
export const analyzeSpendingPatterns = (
  expenses: Expense[],
  dailyEntries: DailyEntry[]
): SpendingPattern[] => {
  const patterns: SpendingPattern[] = [];
  const categories = ['need', 'want'];
  
  categories.forEach(category => {
    const categoryExpenses = expenses.filter(e => e.category === category);
    const categoryDailyEntries = dailyEntries.filter(e => e.category === category);
    
    // Calculate average monthly spending
    const monthlyFromExpenses = categoryExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
    const monthlyFromDaily = categoryDailyEntries.reduce((sum, e) => sum + e.expenses, 0);
    const averageMonthly = monthlyFromExpenses + (monthlyFromDaily / 12);
    
    // Analyze trend (simplified - would need more historical data)
    const recentSpending = categoryDailyEntries
      .filter(e => new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + e.expenses, 0);
    
    const olderSpending = categoryDailyEntries
      .filter(e => {
        const date = new Date(e.date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        return date <= thirtyDaysAgo && date > sixtyDaysAgo;
      })
      .reduce((sum, e) => sum + e.expenses, 0);
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentSpending > olderSpending * 1.1) trend = 'increasing';
    else if (recentSpending < olderSpending * 0.9) trend = 'decreasing';
    
    // Generate optimization suggestions
    const suggestions: string[] = [];
    if (category === 'want' && trend === 'increasing') {
      suggestions.push('Consider setting a monthly limit for discretionary spending');
      suggestions.push('Review recent purchases to identify unnecessary expenses');
    }
    
    if (category === 'need' && averageMonthly > 0) {
      suggestions.push('Look for opportunities to negotiate bills or find better deals');
      suggestions.push('Consider bulk purchasing for frequently used items');
    }
    
    const optimizationPotential = category === 'want' ? 
      Math.min(30, averageMonthly * 0.2) : 
      Math.min(15, averageMonthly * 0.1);
    
    patterns.push({
      category,
      averageMonthly,
      trend,
      seasonality: false, // Would need more data to determine
      peakMonths: [],
      optimizationPotential,
      suggestions
    });
  });
  
  return patterns;
};

// Financial Health Score Improvement Suggestions
export const generateHealthImprovementSteps = (
  financialHealth: any,
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  bankAccounts: BankAccount[]
): HealthImprovementStep[] => {
  const steps: HealthImprovementStep[] = [];
  
  // If there's no data, return empty array
  if (incomes.length === 0 && expenses.length === 0 && loans.length === 0 && bankAccounts.length === 0) {
    return steps;
  }
  
  // Get emergency fund data
  const emergencyFundGoal = 6; // 6 months of expenses is the target
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.monthlyAmount, 0);
  const targetEmergencyFund = monthlyExpenses * emergencyFundGoal;
  
  // Calculate current emergency fund
  const emergencyFundAccounts = bankAccounts.filter(account => 
    account.isActive && account.type === 'savings'
  );
  
  const currentEmergencyFund = emergencyFundAccounts.reduce(
    (sum, account) => sum + Math.max(0, account.balance), 0
  );
  
  // Emergency fund improvement
  if (financialHealth.emergencyFundRatio < 1) {
    const emergencyFundMonths = currentEmergencyFund / Math.max(1, monthlyExpenses);
    const emergencyFundDeficit = targetEmergencyFund - currentEmergencyFund;
    
    steps.push({
      id: 'emergency-fund',
      title: 'Build Emergency Fund',
      description: `Increase your emergency fund to cover ${emergencyFundGoal} months of expenses. Currently at ${(emergencyFundMonths).toFixed(1)} months (${(financialHealth.emergencyFundRatio * 100).toFixed(1)}% of target).`,
      impact: 'high',
      difficulty: 'medium',
      estimatedTimeframe: '6-12 months',
      potentialScoreIncrease: 15,
      category: 'emergency',
      completed: false
    });
  }
  
  // Debt reduction - specific to actual loans
  if (loans.length > 0 && financialHealth.debtToIncomeRatio > 30) {
    // Find highest interest loan
    const highestInterestLoan = loans.reduce((highest, loan) => 
      loan.interestRate > highest.interestRate ? loan : highest
    , loans[0]);
    
    steps.push({
      id: 'reduce-debt',
      title: `Pay Down ${highestInterestLoan.name}`,
      description: `Focus on paying down your ${highestInterestLoan.name} with ${highestInterestLoan.interestRate}% interest rate. Current balance: KSh ${highestInterestLoan.currentBalance.toFixed(0)}.`,
      impact: 'high',
      difficulty: 'hard',
      estimatedTimeframe: '12-24 months',
      potentialScoreIncrease: 20,
      category: 'debt',
      completed: false
    });
  }
  
  // Account debt reduction - specific to negative balance accounts
  const accountsWithDebt = bankAccounts.filter(account => 
    account.isActive && (
      account.balance < 0 || 
      (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    )
  );
  
  if (accountsWithDebt.length > 0) {
    const worstAccount = accountsWithDebt.reduce((worst, account) => {
      const currentDebt = Math.abs(Math.min(0, account.balance)) + (account.overdraftUsed || 0);
      const worstDebt = Math.abs(Math.min(0, worst.balance)) + (worst.overdraftUsed || 0);
      return currentDebt > worstDebt ? account : worst;
    }, accountsWithDebt[0]);
    
    const accountDebt = Math.abs(Math.min(0, worstAccount.balance)) + (worstAccount.overdraftUsed || 0);
    
    steps.push({
      id: `account-debt-${worstAccount.id}`,
      title: `Clear ${worstAccount.name} Account Debt`,
      description: `Pay off the negative balance and overdraft in your ${worstAccount.name} account. Current debt: KSh ${accountDebt.toFixed(0)}.`,
      impact: 'high',
      difficulty: 'medium',
      estimatedTimeframe: '1-3 months',
      potentialScoreIncrease: 15,
      category: 'debt',
      completed: false
    });
  }
  
  // Increase savings rate - based on actual income and expenses
  const totalIncome = incomes.reduce((sum, income) => sum + income.monthlyAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.monthlyAmount, 0);
  const currentSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  if (currentSavingsRate < 20) {
    // Find top 3 want expenses to potentially reduce
    const topWantExpenses = expenses
      .filter(e => e.category === 'want')
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
      .slice(0, 3);
    
    const expenseNames = topWantExpenses.map(e => e.name).join(', ');
    const potentialSavings = topWantExpenses.reduce((sum, e) => sum + (e.monthlyAmount * 0.2), 0);
    
    steps.push({
      id: 'increase-savings',
      title: 'Increase Savings Rate',
      description: `Your current savings rate is ${currentSavingsRate.toFixed(1)}% of income, below the recommended 20%. Consider reducing discretionary expenses like ${expenseNames} to save approximately KSh ${potentialSavings.toFixed(0)}/month more.`,
      impact: 'medium',
      difficulty: 'medium',
      estimatedTimeframe: '3-6 months',
      potentialScoreIncrease: 10,
      category: 'savings',
      completed: false
    });
  }
  
  // Income diversification - specific to user's situation
  if (incomes.length === 1) {
    const currentIncome = incomes[0];
    
    steps.push({
      id: 'diversify-income',
      title: 'Diversify Income Sources',
      description: `You currently rely on a single income source (${currentIncome.source}). Consider developing additional income streams to reduce financial risk.`,
      impact: 'medium',
      difficulty: 'hard',
      estimatedTimeframe: '6-12 months',
      potentialScoreIncrease: 8,
      category: 'income',
      completed: false
    });
  }
  
  // Expense optimization - based on specific expenses
  const wantExpenses = expenses.filter(e => e.category === 'want');
  const totalWants = wantExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  
  if (totalWants > totalIncome * 0.3) {
    // Find the largest want expense
    const largestWantExpense = wantExpenses.reduce((largest, expense) => 
      expense.monthlyAmount > largest.monthlyAmount ? expense : largest
    , wantExpenses[0]);
    
    if (largestWantExpense) {
      steps.push({
        id: `optimize-expense-${largestWantExpense.id}`,
        title: `Reduce ${largestWantExpense.name} Expense`,
        description: `Your ${largestWantExpense.name} expense of KSh ${largestWantExpense.monthlyAmount.toFixed(0)}/month is significant. Consider ways to reduce this cost by 20% to improve your wants-to-income ratio.`,
        impact: 'medium',
        difficulty: 'easy',
        estimatedTimeframe: '1-3 months',
        potentialScoreIncrease: 12,
        category: 'expenses',
        completed: false
      });
    }
  }
  
  return steps.sort((a, b) => {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    const difficultyWeight = { easy: 3, medium: 2, hard: 1 };
    
    const scoreA = impactWeight[a.impact] + difficultyWeight[a.difficulty];
    const scoreB = impactWeight[b.impact] + difficultyWeight[b.difficulty];
    
    return scoreB - scoreA;
  });
};

// Emergency Preparedness Score
export const calculateEmergencyPreparedness = (
  bankAccounts: BankAccount[],
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[]
): EmergencyPreparedness => {
  // If there's no data, return a default score of 0
  if (bankAccounts.length === 0 && incomes.length === 0 && expenses.length === 0 && loans.length === 0) {
    return {
      score: 0,
      level: 'unprepared',
      emergencyFundMonths: 0,
      liquidAssets: 0,
      debtToIncomeRatio: 0,
      incomeStability: 0,
      recommendations: [
        'Start building an emergency fund as soon as you begin receiving income',
        'Aim to save at least 3-6 months of expenses in a liquid savings account',
        'Consider setting up automatic transfers to your emergency fund'
      ]
    };
  }

  const totalIncome = incomes.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const totalDebt = loans.reduce((sum, l) => sum + l.minimumPayment, 0);
  
  // Calculate liquid assets (checking + savings)
  const liquidAssets = bankAccounts
    .filter(acc => acc.isActive && (acc.type === 'checking' || acc.type === 'savings'))
    .reduce((sum, acc) => sum + Math.max(0, acc.balance), 0);
  
  const emergencyFundMonths = totalExpenses > 0 ? liquidAssets / totalExpenses : 0;
  const debtToIncomeRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 100;
  
  // Income stability (simplified - would need historical data)
  const incomeStability = incomes.length > 1 ? 0.8 : 0.6;
  
  // Calculate score (0-100)
  let score = 0;
  
  // Emergency fund component (40% of score)
  if (emergencyFundMonths >= 6) score += 40;
  else if (emergencyFundMonths >= 3) score += 30;
  else if (emergencyFundMonths >= 1) score += 20;
  else score += emergencyFundMonths * 20;
  
  // Debt component (30% of score)
  if (debtToIncomeRatio <= 20) score += 30;
  else if (debtToIncomeRatio <= 40) score += 20;
  else if (debtToIncomeRatio <= 60) score += 10;
  
  // Income stability component (20% of score)
  score += incomeStability * 20;
  
  // Liquid assets component (10% of score)
  if (liquidAssets >= totalExpenses * 3) score += 10;
  else score += (liquidAssets / (totalExpenses * 3)) * 10;
  
  score = Math.min(100, Math.max(0, score));
  
  let level: 'unprepared' | 'basic' | 'prepared' | 'well-prepared';
  if (score >= 80) level = 'well-prepared';
  else if (score >= 60) level = 'prepared';
  else if (score >= 40) level = 'basic';
  else level = 'unprepared';
  
  // Generate specific recommendations based on actual data
  const recommendations: string[] = [];
  
  if (emergencyFundMonths < 3) {
    const targetEmergencyFund = totalExpenses * 3;
    const currentEmergencyFund = liquidAssets;
    const emergencyFundGap = targetEmergencyFund - currentEmergencyFund;
    
    if (emergencyFundGap > 0) {
      recommendations.push(`Build emergency fund by adding KSh ${emergencyFundGap.toFixed(0)} to reach 3 months of expenses (KSh ${targetEmergencyFund.toFixed(0)})`);
    }
  }
  
  if (debtToIncomeRatio > 40) {
    // Find highest interest loan
    if (loans.length > 0) {
      const highestInterestLoan = loans.reduce((highest, loan) => 
        loan.interestRate > highest.interestRate ? loan : highest
      , loans[0]);
      
      recommendations.push(`Focus on reducing your ${highestInterestLoan.name} with ${highestInterestLoan.interestRate}% interest rate to improve financial flexibility`);
    } else {
      recommendations.push('Focus on reducing debt to improve financial flexibility');
    }
  }
  
  if (incomes.length === 1) {
    recommendations.push(`Consider developing additional income sources beyond your current ${incomes[0].source}`);
  }
  
  if (liquidAssets < totalExpenses) {
    const liquidityGap = totalExpenses - liquidAssets;
    recommendations.push(`Increase liquid savings by at least KSh ${liquidityGap.toFixed(0)} for immediate access to funds`);
  }
  
  return {
    score: Math.round(score),
    level,
    emergencyFundMonths,
    liquidAssets,
    debtToIncomeRatio,
    incomeStability,
    recommendations
  };
};

// Bill Negotiation Assistant
export const generateBillNegotiationOpportunities = (
  bills: Bill[],
  expenses: Expense[]
): BillNegotiation[] => {
  const opportunities: BillNegotiation[] = [];
  
  // Analyze bills for negotiation potential
  bills.forEach(bill => {
    let potentialSavings = 0;
    let successProbability = 0;
    const negotiationTips: string[] = [];
    let bestTimeToCall = '10:00 AM - 12:00 PM';
    const competitorRates: number[] = [];
    
    switch (bill.category) {
      case 'utility':
        potentialSavings = bill.amount * 0.15; // 15% potential savings
        successProbability = 0.6;
        negotiationTips.push('Ask about budget billing plans');
        negotiationTips.push('Inquire about energy efficiency programs');
        negotiationTips.push('Request a rate review based on usage history');
        competitorRates = [bill.amount * 0.85, bill.amount * 0.9, bill.amount * 0.8];
        break;
        
      case 'subscription':
        potentialSavings = bill.amount * 0.25; // 25% potential savings
        successProbability = 0.8;
        negotiationTips.push('Mention you\'re considering canceling');
        negotiationTips.push('Ask about promotional rates for loyal customers');
        negotiationTips.push('Request to speak with retention department');
        competitorRates = [bill.amount * 0.7, bill.amount * 0.8, bill.amount * 0.75];
        break;
        
      case 'insurance':
        potentialSavings = bill.amount * 0.2; // 20% potential savings
        successProbability = 0.7;
        negotiationTips.push('Get quotes from competitors first');
        negotiationTips.push('Ask about bundling discounts');
        negotiationTips.push('Review coverage to ensure you\'re not over-insured');
        bestTimeToCall = '2:00 PM - 4:00 PM';
        competitorRates = [bill.amount * 0.8, bill.amount * 0.85, bill.amount * 0.75];
        break;
        
      default:
        potentialSavings = bill.amount * 0.1; // 10% potential savings
        successProbability = 0.4;
        negotiationTips.push('Research competitor pricing');
        negotiationTips.push('Be polite but persistent');
        competitorRates = [bill.amount * 0.9, bill.amount * 0.95];
    }
    
    // Only include bills with significant savings potential
    if (potentialSavings > 10 && (!bill.lastNegotiated || 
        new Date(bill.lastNegotiated) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))) {
      opportunities.push({
        id: `negotiation-${bill.id}`,
        billId: bill.id,
        billName: bill.name,
        currentAmount: bill.amount,
        potentialSavings,
        negotiationTips,
        bestTimeToCall,
        competitorRates,
        lastNegotiated: bill.lastNegotiated,
        successProbability
      });
    }
  });
  
  return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
};

// AI Expense Categorization
export const categorizeExpenseWithAI = (
  description: string,
  amount: number,
  merchant?: string
): { category: 'need' | 'want'; confidence: number; aiCategory: string } => {
  // Simplified AI categorization logic
  const needKeywords = [
    'grocery', 'gas', 'fuel', 'pharmacy', 'medical', 'doctor', 'hospital',
    'rent', 'mortgage', 'utilities', 'electric', 'water', 'internet',
    'insurance', 'car payment', 'loan', 'childcare', 'school'
  ];
  
  const wantKeywords = [
    'restaurant', 'coffee', 'starbucks', 'entertainment', 'movie', 'game',
    'shopping', 'clothes', 'amazon', 'target', 'mall', 'vacation',
    'hobby', 'gym', 'subscription', 'streaming', 'spotify', 'netflix'
  ];
  
  const lowerDesc = description.toLowerCase();
  const lowerMerchant = merchant?.toLowerCase() || '';
  
  let needScore = 0;
  let wantScore = 0;
  
  needKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword) || lowerMerchant.includes(keyword)) {
      needScore += 1;
    }
  });
  
  wantKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword) || lowerMerchant.includes(keyword)) {
      wantScore += 1;
    }
  });
  
  // Amount-based heuristics
  if (amount > 500) needScore += 0.5; // Large amounts more likely to be needs
  if (amount < 50) wantScore += 0.5; // Small amounts more likely to be wants
  
  const totalScore = needScore + wantScore;
  let category: 'need' | 'want' = 'want';
  let confidence = 0.5;
  
  if (totalScore > 0) {
    category = needScore > wantScore ? 'need' : 'want';
    confidence = Math.max(needScore, wantScore) / totalScore;
  }
  
  // Determine AI category for more specific classification
  let aiCategory = 'other';
  if (lowerDesc.includes('food') || lowerDesc.includes('grocery')) aiCategory = 'food';
  else if (lowerDesc.includes('transport') || lowerDesc.includes('gas')) aiCategory = 'transportation';
  else if (lowerDesc.includes('entertainment')) aiCategory = 'entertainment';
  else if (lowerDesc.includes('shopping')) aiCategory = 'shopping';
  else if (lowerDesc.includes('utility')) aiCategory = 'utilities';
  
  return {
    category,
    confidence: Math.min(0.95, Math.max(0.3, confidence)),
    aiCategory
  };
};

// Milestone Celebrations
export const generateCelebrations = (
  goals: FinancialGoal[],
  userProgress: any,
  financialHealth: any,
  recentAchievements: string[]
): Celebration[] => {
  const celebrations: Celebration[] = [];
  const now = new Date().toISOString();
  
  // Goal milestone celebrations
  goals.forEach(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (progress >= milestone && !recentAchievements.includes(`goal-${goal.id}-${milestone}`)) {
        celebrations.push({
          id: `goal-${goal.id}-${milestone}`,
          type: 'milestone',
          title: `${milestone}% Goal Achievement!`,
          message: `You've reached ${milestone}% of your ${goal.name} goal!`,
          amount: goal.currentAmount,
          icon: milestone === 100 ? '🎉' : '🎯',
          color: milestone === 100 ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600',
          timestamp: now,
          acknowledged: false
        });
      }
    });
  });
  
  // Level up celebrations
  if (userProgress && userProgress.level > 1) {
    celebrations.push({
      id: `level-${userProgress.level}`,
      type: 'level_up',
      title: `Level ${userProgress.level} Achieved!`,
      message: `You've reached Level ${userProgress.level} in your financial journey!`,
      icon: '⭐',
      color: 'from-purple-500 to-purple-600',
      timestamp: now,
      acknowledged: false
    });
  }
  
  // Streak celebrations
  if (userProgress && userProgress.streak > 0 && userProgress.streak % 7 === 0) {
    celebrations.push({
      id: `streak-${userProgress.streak}`,
      type: 'streak',
      title: `${userProgress.streak} Day Streak!`,
      message: `Amazing! You've tracked your finances for ${userProgress.streak} consecutive days!`,
      icon: '🔥',
      color: 'from-orange-500 to-orange-600',
      timestamp: now,
      acknowledged: false
    });
  }
  
  // Financial health improvements
  if (financialHealth.score >= 80 && !recentAchievements.includes('excellent-health')) {
    celebrations.push({
      id: 'excellent-health',
      type: 'milestone',
      title: 'Excellent Financial Health!',
      message: `Your financial health score has reached ${financialHealth.score}!`,
      icon: '💪',
      color: 'from-green-500 to-green-600',
      timestamp: now,
      acknowledged: false
    });
  }
  
  return celebrations;
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const absAmount = Math.abs(amount);
  
  // Use KES formatting
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  
  // Add minus prefix for negative amounts
  return amount < 0 ? `-${formatted}` : formatted;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};