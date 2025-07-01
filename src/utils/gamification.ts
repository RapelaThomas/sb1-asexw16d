import { Income, Expense, Loan, Bill, DailyEntry, BusinessEntry, FinancialGoal, Challenge, UserProgress, FinancialHealth } from '../types';
import { calculateTotalMonthlyIncome, calculateTotalMonthlyExpenses, calculateTotalDebt } from './calculations';

export const generateChallenges = (
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  bills: Bill[],
  dailyEntries: DailyEntry[],
  businessEntries: BusinessEntry[],
  goals: FinancialGoal[],
  financialHealth: FinancialHealth,
  existingChallenges: Challenge[]
): Challenge[] => {
  const challenges: Challenge[] = [];
  const today = new Date();
  
  // Only generate challenges if user has some financial data
  const hasData = incomes.length > 0 || expenses.length > 0 || loans.length > 0 || 
                  dailyEntries.length > 0 || businessEntries.length > 0 || goals.length > 0;
  
  if (!hasData) {
    return [];
  }

  const totalIncome = calculateTotalMonthlyIncome(incomes);
  const totalExpenses = calculateTotalMonthlyExpenses(expenses);
  const totalDebt = calculateTotalDebt(loans);
  const wants = expenses.filter(e => e.category === 'want');
  const totalWants = wants.reduce((sum, expense) => sum + expense.monthlyAmount, 0);

  // Check if challenge already exists
  const challengeExists = (type: string, category: string) => {
    return existingChallenges.some(c => 
      c.type === type && 
      c.category === category && 
      c.isActive && 
      !c.isCompleted
    );
  };

  // Daily challenge - Track expenses (only if user has income)
  if (totalIncome > 0 && !challengeExists('daily', 'tracking')) {
    const recentEntries = dailyEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    challenges.push({
      id: `daily-track-${Date.now()}`,
      title: 'Daily Expense Tracker',
      description: 'Log your daily expenses for 7 consecutive days',
      type: 'daily',
      category: 'tracking',
      target: 7,
      current: recentEntries.length,
      points: 50,
      deadline: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'easy'
    });
  }

  // Weekly challenge - Reduce wants spending (only if user has wants)
  if (totalWants > 0 && !challengeExists('weekly', 'savings')) {
    const targetReduction = totalWants * 0.8;
    challenges.push({
      id: `weekly-reduce-wants-${Date.now()}`,
      title: 'Wants Spending Challenge',
      description: `Reduce wants spending by 20% this week`,
      type: 'weekly',
      category: 'savings',
      target: targetReduction,
      current: totalWants,
      points: 100,
      deadline: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'medium'
    });
  }

  // Monthly challenge - Emergency fund (only if user doesn't have adequate emergency fund)
  if (financialHealth.emergencyFundRatio < 1 && !challengeExists('monthly', 'savings')) {
    const emergencyTarget = totalExpenses * 6;
    const currentEmergency = goals.find(g => g.category === 'emergency')?.currentAmount || 0;
    
    challenges.push({
      id: `monthly-emergency-${Date.now()}`,
      title: 'Emergency Fund Builder',
      description: `Build emergency fund to cover 6 months of expenses`,
      type: 'monthly',
      category: 'savings',
      target: emergencyTarget,
      current: currentEmergency,
      points: 200,
      deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'hard'
    });
  }

  // Debt payoff challenge (only if user has loans)
  if (loans.length > 0 && !challengeExists('monthly', 'debt')) {
    const smallestLoan = loans.reduce((min, loan) => 
      loan.currentBalance < min.currentBalance ? loan : min
    );
    
    challenges.push({
      id: `debt-payoff-${Date.now()}`,
      title: 'Debt Destroyer',
      description: `Pay off ${smallestLoan.name} completely`,
      type: 'monthly',
      category: 'debt',
      target: smallestLoan.currentBalance,
      current: smallestLoan.principal - smallestLoan.currentBalance,
      points: 300,
      deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'hard'
    });
  }

  // Investment challenge for financially healthy users
  if ((financialHealth.level === 'good' || financialHealth.level === 'excellent') && 
      totalIncome > totalExpenses && !challengeExists('monthly', 'investment')) {
    const netIncome = totalIncome - totalExpenses;
    const investmentTarget = netIncome * 0.2;
    
    challenges.push({
      id: `investment-starter-${Date.now()}`,
      title: 'Investment Pioneer',
      description: 'Allocate 20% of surplus income to investments',
      type: 'monthly',
      category: 'investment',
      target: investmentTarget,
      current: 0,
      points: 150,
      deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'medium'
    });
  }

  // Goal achievement challenge (only if user has high priority goals)
  const highPriorityGoals = goals.filter(g => g.priority === 'high' && g.currentAmount < g.targetAmount);
  if (highPriorityGoals.length > 0 && !challengeExists('monthly', 'goals')) {
    const goal = highPriorityGoals[0];
    const monthlyRequired = (goal.targetAmount - goal.currentAmount) / 3; // 3 months to achieve
    
    challenges.push({
      id: `goal-achievement-${Date.now()}`,
      title: 'Goal Achiever',
      description: `Make progress on ${goal.name}`,
      type: 'monthly',
      category: 'goals',
      target: goal.currentAmount + monthlyRequired,
      current: goal.currentAmount,
      points: 120,
      deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      isActive: true,
      difficulty: 'medium'
    });
  }

  return challenges.filter(c => c.isActive);
};

export const calculateUserLevel = (totalPoints: number): { level: number; currentLevelPoints: number; nextLevelPoints: number } => {
  // Level progression: 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000, etc.
  const levelThresholds = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000];
  
  let level = 1;
  let currentLevelPoints = totalPoints;
  let nextLevelPoints = 100;
  
  for (let i = 1; i < levelThresholds.length; i++) {
    if (totalPoints >= levelThresholds[i]) {
      level = i + 1;
      currentLevelPoints = totalPoints - levelThresholds[i];
      nextLevelPoints = i + 1 < levelThresholds.length 
        ? levelThresholds[i + 1] - levelThresholds[i]
        : levelThresholds[i] * 1.5; // For levels beyond predefined thresholds
    } else {
      nextLevelPoints = levelThresholds[i] - levelThresholds[i - 1];
      break;
    }
  }
  
  // For very high levels, use exponential growth
  if (level > levelThresholds.length) {
    const basePoints = levelThresholds[levelThresholds.length - 1];
    const extraPoints = totalPoints - basePoints;
    const levelSize = 2000; // Points per level after max threshold
    level = levelThresholds.length + Math.floor(extraPoints / levelSize);
    currentLevelPoints = extraPoints % levelSize;
    nextLevelPoints = levelSize;
  }
  
  return { level, currentLevelPoints, nextLevelPoints };
};

export const updateChallengeProgress = (
  challenge: Challenge,
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  dailyEntries: DailyEntry[],
  goals: FinancialGoal[]
): number => {
  const today = new Date();
  
  switch (challenge.category) {
    case 'tracking':
      if (challenge.title.includes('Daily Expense Tracker')) {
        const recentEntries = dailyEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        });
        return recentEntries.length;
      }
      break;
      
    case 'savings':
      if (challenge.title.includes('Wants Spending')) {
        const currentWants = expenses
          .filter(e => e.category === 'want')
          .reduce((sum, expense) => sum + expense.monthlyAmount, 0);
        return currentWants;
      }
      if (challenge.title.includes('Emergency Fund')) {
        const emergencyGoal = goals.find(g => g.category === 'emergency');
        return emergencyGoal?.currentAmount || 0;
      }
      break;
      
    case 'debt':
      if (challenge.title.includes('Debt Destroyer')) {
        const targetLoan = loans.find(l => challenge.description.includes(l.name));
        if (targetLoan) {
          return targetLoan.principal - targetLoan.currentBalance;
        }
      }
      break;
      
    case 'goals':
      if (challenge.title.includes('Goal Achiever')) {
        const targetGoal = goals.find(g => challenge.description.includes(g.name));
        return targetGoal?.currentAmount || 0;
      }
      break;
      
    case 'investment':
      // This would need to be tracked through investment goals or accounts
      return challenge.current;
      
    default:
      return challenge.current;
  }
  
  return challenge.current;
};