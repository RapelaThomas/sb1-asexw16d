import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Shield,
  Percent,
  ShoppingCart,
  Info,
  Trophy,
  Star,
  Zap,
  Gift,
  User,
  Lightbulb,
  Briefcase
} from 'lucide-react';
import { Income, Expense, Loan, Bill, BusinessEntry, Currency, FinancialGoal, BankAccount, Challenge, UserProgress, ExpectedPayment } from '../types';
import { 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses,
  calculateFinancialHealth,
  calculateAutoAllocation,
  calculateTotalDebt,
  calculateMinimumPayments,
  getUpcomingBills,
  formatCurrency,
  formatDate,
  calculateBusinessContribution,
  calculateGoalProgress,
  calculateSpendingAllowance,
  calculatePercentageChange,
  calculateNetWorth,
  getUpcomingExpectedPayments,
  getOverdueExpectedPayments
} from '../utils/calculations';
import { generateChallenges, updateChallengeProgress } from '../utils/gamification';
import { calculateEmergencyPreparedness, generateHealthImprovementSteps } from '../utils/advancedCalculations';

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  bills: Bill[];
  businessEntries: BusinessEntry[];
  goals: FinancialGoal[];
  currency: Currency;
  bankAccounts?: BankAccount[];
  challenges?: Challenge[];
  userProgress?: UserProgress;
  expectedPayments?: ExpectedPayment[];
  onCompleteChallenge?: (challengeId: string) => void;
  onMarkExpectedPaymentAsPaid?: (paymentId: string, isPaid: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  incomes, 
  expenses, 
  loans, 
  bills, 
  businessEntries,
  goals,
  currency,
  bankAccounts = [],
  challenges = [],
  userProgress,
  expectedPayments = [],
  onCompleteChallenge,
  onMarkExpectedPaymentAsPaid
}) => {
  const [showAllImprovementSteps, setShowAllImprovementSteps] = useState(false);
  
  const totalIncome = calculateTotalMonthlyIncome(incomes);
  const businessContribution = calculateBusinessContribution(businessEntries);
  const totalMonthlyIncome = totalIncome + businessContribution;
  const totalExpenses = calculateTotalMonthlyExpenses(expenses);
  
  // Use enhanced debt calculation that includes account debts
  const totalDebt = calculateTotalDebt(loans, bankAccounts);
  const minimumPayments = calculateMinimumPayments(loans, bankAccounts);
  
  const netIncome = totalMonthlyIncome - totalExpenses - minimumPayments;
  const upcomingBills = getUpcomingBills(bills);

  const needs = expenses.filter(e => e.category === 'need');
  const wants = expenses.filter(e => e.category === 'want');
  const totalNeeds = calculateTotalMonthlyExpenses(needs);
  const totalWants = calculateTotalMonthlyExpenses(wants);

  // Expected payments
  const overdueExpectedPayments = getOverdueExpectedPayments(expectedPayments);
  const upcomingExpectedPayments = getUpcomingExpectedPayments(expectedPayments, 7);
  
  // Calculate totals for expected payments
  const totalExpectedIncome = expectedPayments
    .filter(payment => payment.type === 'income' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalExpectedExpenses = expectedPayments
    .filter(payment => payment.type === 'expense' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Use consistent net worth calculation
  const netWorth = calculateNetWorth(bankAccounts, loans, goals, expectedPayments);

  // Use the SAME financial health calculation as Auto Allocation
  const financialHealth = calculateFinancialHealth(incomes, expenses, loans, [], businessEntries, goals, bankAccounts, expectedPayments);

  // Calculate emergency preparedness
  const emergencyPreparedness = calculateEmergencyPreparedness(bankAccounts, incomes, expenses, loans);

  // Generate health improvement steps
  const healthImprovementSteps = generateHealthImprovementSteps(financialHealth, incomes, expenses, loans, bankAccounts);
  
  // Calculate spending allowance using the same preferences structure as Auto Allocation
  const defaultPreferences = {
    strategy: 'balanced' as const,
    riskTolerance: 'moderate' as const,
    emergencyFundMonths: 6,
    autoAllocate: true,
    reminderTime: '09:00',
    currency,
    autoSuggestStrategy: false
  };

  const spendingAllowance = calculateSpendingAllowance(incomes, expenses, loans, goals, businessEntries, defaultPreferences, bankAccounts);

  // Enhanced auto allocation with detailed breakdown
  const autoAllocation = calculateAutoAllocation(
    totalIncome,
    totalExpenses,
    loans,
    goals,
    businessEntries,
    defaultPreferences,
    financialHealth,
    bankAccounts
  );

  // Goal progress calculations
  const goalProgresses = goals.map(goal => calculateGoalProgress(goal));
  const urgentGoals = goalProgresses.filter(gp => !gp.isOnTrack && gp.daysRemaining <= 90);
  const completedGoals = goalProgresses.filter(gp => gp.progressPercentage >= 100);

  // Percentage change calculations - handle zero previous values properly
  const previousMonthIncome = 0; // No previous data initially
  const previousMonthExpenses = 0;
  const previousMonthDebt = 0;

  const incomeChange = calculatePercentageChange(totalMonthlyIncome, previousMonthIncome);
  const expenseChange = calculatePercentageChange(totalExpenses, previousMonthExpenses);
  const debtChange = calculatePercentageChange(totalDebt, previousMonthDebt);

  // Real Gamification System - Generate challenges based on actual data
  const activeChallenges = generateChallenges(
    incomes,
    expenses,
    loans,
    bills,
    [],
    businessEntries,
    goals,
    financialHealth,
    challenges
  );

  // Update challenge progress with real data
  const updatedChallenges = activeChallenges.map(challenge => ({
    ...challenge,
    current: updateChallengeProgress(challenge, incomes, expenses, loans, [], goals)
  }));

  // Real user progress or default values
  const currentUserProgress: UserProgress = userProgress || {
    totalPoints: 0,
    level: 1,
    currentLevelPoints: 0,
    nextLevelPoints: 100,
    streak: 0,
    longestStreak: 0,
    challengesCompleted: 0,
    achievementsUnlocked: 0,
    financialHealthImprovement: 0
  };

  // Financial improvement indicators
  const getFinancialTrend = () => {
    // Base trend on actual financial health score and debt changes
    const healthScore = financialHealth.score;
    const debtTrend = debtChange;
    
    let status = 'stable';
    let message = 'Your financial situation is stable.';
    let color = 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300';
    let icon = BarChart3;
    
    // Determine status based on health score and debt trend
    if (healthScore >= 70 && debtTrend <= 0) {
      status = 'improving';
      message = 'Your financial situation is improving! Keep up the great work.';
      color = 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
      icon = TrendingUp;
    } else if (healthScore < 40 || debtTrend > 10) {
      status = 'declining';
      message = 'Your financial situation needs attention. Focus on reducing expenses or increasing income.';
      color = 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      icon = TrendingDown;
    } else if (healthScore < 60 || debtTrend > 0) {
      status = 'mixed';
      message = 'Mixed financial signals. Monitor your spending and debt levels closely.';
      color = 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300';
      icon = AlertTriangle;
    }
    
    return { status, message, color, icon };
  };

  const financialTrend = getFinancialTrend();
  const TrendIcon = financialTrend.icon;

  // Urgent notifications
  const urgentNotifications = [
    ...upcomingBills.map(bill => ({
      id: bill.id,
      type: 'bill' as const,
      title: `${bill.name} Due Soon`,
      message: `Due ${formatDate(bill.dueDate)} - ${formatCurrency(bill.amount, currency)}`,
      urgency: 'high' as const,
      dueDate: bill.dueDate
    })),
    ...urgentGoals.map(goal => ({
      id: goal.goalId,
      type: 'goal' as const,
      title: `${goal.goalName} Behind Schedule`,
      message: `${goal.daysRemaining} days remaining, ${goal.progressPercentage.toFixed(1)}% complete`,
      urgency: 'medium' as const,
      dueDate: goal.targetDate
    })),
    ...overdueExpectedPayments.map(payment => ({
      id: payment.id,
      type: payment.type === 'income' ? 'expected-income' as const : 'expected-expense' as const,
      title: `Overdue ${payment.type === 'income' ? 'Income' : 'Payment'}: ${payment.name}`,
      message: `Expected on ${formatDate(payment.expectedDate)} - ${formatCurrency(payment.amount, currency)}${payment.personName ? ` from ${payment.personName}` : ''}`,
      urgency: 'high' as const,
      dueDate: payment.expectedDate,
      paymentId: payment.id
    })),
    ...upcomingExpectedPayments.map(payment => ({
      id: payment.id,
      type: payment.type === 'income' ? 'expected-income' as const : 'expected-expense' as const,
      title: `Expected ${payment.type === 'income' ? 'Income' : 'Payment'}: ${payment.name}`,
      message: `Expected on ${formatDate(payment.expectedDate)} - ${formatCurrency(payment.amount, currency)}${payment.personName ? ` ${payment.type === 'income' ? 'from' : 'to'} ${payment.personName}` : ''}`,
      urgency: 'medium' as const,
      dueDate: payment.expectedDate,
      paymentId: payment.id
    }))
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    trend?: string;
    change?: number;
  }> = ({ title, value, icon: Icon, color, trend, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trend}</p>}
          {change !== undefined && change !== 0 && (
            <div className="flex items-center mt-1">
              {change > 0 ? (
                <ArrowUp className={`h-3 w-3 ${title === 'Total Debt' ? 'text-red-500' : 'text-green-500'} mr-1`} />
              ) : change < 0 ? (
                <ArrowDown className={`h-3 w-3 ${title === 'Total Debt' ? 'text-green-500' : 'text-red-500'} mr-1`} />
              ) : (
                <Minus className="h-3 w-3 text-gray-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                title === 'Total Debt' 
                  ? (change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600')
                  : (change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600')
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last month
              </span>
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  // Generate improvement action plan
  const improvementActionPlan = healthImprovementSteps.filter(step => !step.completed).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financial Overview</h2>
        
        {/* Real Gamification Progress Bar - Only show if user has data */}
        {(totalMonthlyIncome > 0 || totalExpenses > 0 || loans.length > 0 || goals.length > 0) && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Level {currentUserProgress.level} Financial Master</h3>
                  <p className="text-purple-100">
                    {currentUserProgress.currentLevelPoints}/{currentUserProgress.nextLevelPoints} XP to next level
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentUserProgress.totalPoints}</div>
                <div className="text-purple-100 text-sm">Total Points</div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentUserProgress.currentLevelPoints / currentUserProgress.nextLevelPoints) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{currentUserProgress.streak}</div>
                <div className="text-purple-100 text-sm">Day Streak</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentUserProgress.challengesCompleted}</div>
                <div className="text-purple-100 text-sm">Challenges</div>
              </div>
              <div>
                <div className="text-xl font-bold">+{currentUserProgress.financialHealthImprovement}</div>
                <div className="text-purple-100 text-sm">Health Boost</div>
              </div>
            </div>
          </div>
        )}

        {/* Real Active Challenges - Only show if challenges exist */}
        {updatedChallenges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Challenges</h3>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Complete to earn rewards!
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {updatedChallenges.slice(0, 3).map((challenge) => {
                const progressPercentage = Math.min(100, (challenge.current / challenge.target) * 100);
                const isCompleted = progressPercentage >= 100;
                
                return (
                  <div key={challenge.id} className={`bg-gradient-to-r ${
                    challenge.difficulty === 'easy' ? 'from-green-500 to-green-600' :
                    challenge.difficulty === 'medium' ? 'from-blue-500 to-blue-600' :
                    'from-purple-500 to-purple-600'
                  } rounded-lg p-4 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {challenge.category === 'tracking' ? '📊' :
                         challenge.category === 'savings' ? '💰' :
                         challenge.category === 'debt' ? '⚡' :
                         challenge.category === 'goals' ? '🎯' :
                         challenge.category === 'investment' ? '📈' : '🏆'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'easy' ? 'bg-green-500/20' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{challenge.title}</h4>
                    <p className="text-sm opacity-90 mb-3">{challenge.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Gift className="h-3 w-3 mr-1" />
                          +{challenge.points} points
                        </span>
                        {isCompleted && onCompleteChallenge && (
                          <button
                            onClick={() => onCompleteChallenge(challenge.id)}
                            className="px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                          >
                            Claim Reward
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Financial Health Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(financialHealth.level)}`}>
                {financialHealth.level.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{financialHealth.score}/100</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                <div 
                  className={`bg-gradient-to-r ${getHealthScoreColor(financialHealth.score)} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${financialHealth.score}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Percent className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-xl font-bold text-red-600">{financialHealth.debtToIncomeRatio.toFixed(1)}%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Shield className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xl font-bold text-blue-600">{(financialHealth.emergencyFundRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Emergency Fund</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xl font-bold text-green-600">{financialHealth.savingsRate.toFixed(1)}%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-purple-600 mr-1" />
                <span className={`text-xl font-bold ${financialHealth.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialHealth.netWorth, currency)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Net Worth</div>
            </div>
          </div>
        </div>

        {/* Improvement Action Plan */}
        {improvementActionPlan.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Improvement Action Plan</h3>
              <button 
                onClick={() => setShowAllImprovementSteps(!showAllImprovementSteps)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showAllImprovementSteps ? 'Show Less' : 'Show More'}
              </button>
            </div>
            
            <div className="space-y-4">
              {(showAllImprovementSteps ? healthImprovementSteps : improvementActionPlan)
                .filter(step => !step.completed)
                .map((step, index) => {
                  const StepIcon = step.category === 'emergency' ? Shield :
                                  step.category === 'debt' ? Zap :
                                  step.category === 'savings' ? DollarSign :
                                  step.category === 'income' ? TrendingUp :
                                  step.category === 'expenses' ? TrendingDown : Target;
                  
                  return (
                    <div key={step.id} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                        <StepIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.description}</p>
                        <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                          <span className="flex items-center mr-3">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.estimatedTimeframe}
                          </span>
                          <span className="flex items-center">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            +{step.potentialScoreIncrease} points
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Money Allocation Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Where Your Money Goes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(autoAllocation.detailedBreakdown?.totalIncome || totalMonthlyIncome, currency)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Income</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(autoAllocation.detailedBreakdown?.fixedExpenses || totalExpenses, currency)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fixed Expenses</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(autoAllocation.detailedBreakdown?.minimumDebtPayments || minimumPayments, currency)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Debt Payments</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(autoAllocation.detailedBreakdown?.availableForAllocation || Math.max(0, netIncome), currency)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available to Allocate</div>
            </div>
          </div>
          
          {autoAllocation.detailedBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{formatCurrency(autoAllocation.detailedBreakdown.emergencyFundAllocation, currency)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Emergency Fund</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-lg font-bold text-indigo-600">{formatCurrency(autoAllocation.detailedBreakdown.investmentAllocation, currency)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Investments</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{formatCurrency(autoAllocation.detailedBreakdown.extraDebtPayment, currency)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Extra Debt Payment</div>
              </div>
              <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="text-lg font-bold text-pink-600">{formatCurrency(autoAllocation.detailedBreakdown.wantsAllocation, currency)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Wants/Discretionary</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">{formatCurrency(autoAllocation.detailedBreakdown.unallocated, currency)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unallocated</div>
              </div>
            </div>
          )}
          
          {/* Account Debt Payment Section */}
          {autoAllocation.detailedBreakdown?.accountDebtPayment && autoAllocation.detailedBreakdown.accountDebtPayment > 0 && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-800 dark:text-orange-300">Account Debt Payment</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(autoAllocation.detailedBreakdown.accountDebtPayment, currency)}
                </span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                This amount is allocated to pay off negative balances and overdraft usage.
              </p>
            </div>
          )}
        </div>

        {/* Emergency Preparedness */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Preparedness</h3>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                emergencyPreparedness.level === 'well-prepared' ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300' :
                emergencyPreparedness.level === 'prepared' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300' :
                emergencyPreparedness.level === 'basic' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {emergencyPreparedness.level.toUpperCase().replace('-', ' ')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{emergencyPreparedness.score}/100</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Preparedness Score</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${emergencyPreparedness.score}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{emergencyPreparedness.emergencyFundMonths.toFixed(1)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Months of Expenses</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(emergencyPreparedness.liquidAssets, currency)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Liquid Assets</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{emergencyPreparedness.debtToIncomeRatio.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income</div>
            </div>
          </div>
          
          {emergencyPreparedness.recommendations.length > 0 && (
            <div className="space-y-3">
              {emergencyPreparedness.recommendations.slice(0, 2).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending Allowance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discretionary Spending Allowance</h3>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                spendingAllowance.canSpend ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {spendingAllowance.canSpend ? 'CAN SPEND' : 'RESTRICTED'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(spendingAllowance.allowedWantsSpending, currency)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Allowance</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatCurrency(spendingAllowance.currentWantsSpending, currency)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Currently Spending</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                spendingAllowance.remainingWantsAllowance > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(spendingAllowance.remainingWantsAllowance, currency)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available to Spend</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spending Usage</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {spendingAllowance.allowedWantsSpending > 0 
                  ? ((spendingAllowance.currentWantsSpending / spendingAllowance.allowedWantsSpending) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  spendingAllowance.currentWantsSpending > spendingAllowance.allowedWantsSpending
                    ? 'bg-red-500'
                    : spendingAllowance.currentWantsSpending > spendingAllowance.allowedWantsSpending * 0.8
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, spendingAllowance.allowedWantsSpending > 0 
                    ? (spendingAllowance.currentWantsSpending / spendingAllowance.allowedWantsSpending) * 100 
                    : 0)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Recommendations and Restrictions */}
          <div className="space-y-2">
            {spendingAllowance.restrictions.map((restriction, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{restriction}</p>
              </div>
            ))}
            
            {spendingAllowance.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Financial Health Indicator */}
        <div className={`rounded-lg p-4 mb-6 ${financialTrend.color}`}>
          <div className="flex items-center space-x-3">
            <TrendIcon className="h-6 w-6" />
            <div>
              <h3 className="font-semibold capitalize">Financial Status: {financialTrend.status}</h3>
              <p className="text-sm opacity-90">{financialTrend.message}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(totalMonthlyIncome, currency)}
            icon={TrendingUp}
            color="text-green-600"
            trend={businessContribution > 0 ? `+${formatCurrency(businessContribution, currency)} from business` : undefined}
            change={incomeChange}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(totalExpenses, currency)}
            icon={TrendingDown}
            color="text-red-600"
            change={expenseChange}
          />
          <StatCard
            title="Total Debt"
            value={formatCurrency(totalDebt, currency)}
            icon={CreditCard}
            color="text-red-600"
            change={debtChange}
          />
          <StatCard
            title="Net Worth"
            value={formatCurrency(netWorth, currency)}
            icon={DollarSign}
            color={netWorth > 0 ? "text-green-600" : "text-red-600"}
          />
        </div>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attention Required</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {urgentNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className={`p-4 ${
                notification.urgency === 'high' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(notification.dueDate)}
                    </span>
                    {(notification.type === 'expected-income' || notification.type === 'expected-expense') && 
                     onMarkExpectedPaymentAsPaid && notification.paymentId && (
                      <button
                        onClick={() => onMarkExpectedPaymentAsPaid(notification.paymentId!, true)}
                        className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Mark as {notification.type === 'expected-income' ? 'Received' : 'Paid'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Insights */}
      {businessEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Insights</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(businessContribution, currency)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Profit Margin</p>
                <p className="text-xl font-bold text-green-600">
                  {businessEntries.length > 0 
                    ? (businessEntries.reduce((sum, entry) => sum + (entry.profit / entry.sales), 0) / businessEntries.length * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Contributions</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(businessEntries.reduce((sum, entry) => sum + entry.profitToGoal, 0), currency)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {businessEntries.length > 0 && businessEntries[0].sales > 0 
                    ? `Your latest sales of ${formatCurrency(businessEntries[0].sales, currency)} generated a profit of ${formatCurrency(businessEntries[0].profit, currency)}.`
                    : 'Start tracking your business performance to get personalized insights.'}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  {businessEntries.length > 0 
                    ? 'Consider allocating more profit to your high-priority financial goals.'
                    : 'Regular tracking helps identify trends and optimization opportunities.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Income</span>
              <span className="font-medium text-green-600">{formatCurrency(totalMonthlyIncome, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Needs</span>
              <span className="font-medium text-blue-600">{formatCurrency(totalNeeds, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Wants</span>
              <span className="font-medium text-purple-600">{formatCurrency(totalWants, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Minimum Payments</span>
              <span className="font-medium text-red-600">{formatCurrency(minimumPayments, currency)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Remaining</span>
                <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netIncome, currency)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Budget Insights */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800 dark:text-blue-300">Budget Insights</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
              {totalNeeds > totalMonthlyIncome * 0.5 && (
                <li>• Your needs spending is {(totalNeeds / totalMonthlyIncome * 100).toFixed(1)}% of income, above the recommended 50%</li>
              )}
              {totalWants > totalMonthlyIncome * 0.3 && (
                <li>• Your wants spending is {(totalWants / totalMonthlyIncome * 100).toFixed(1)}% of income, above the recommended 30%</li>
              )}
              {netIncome < totalMonthlyIncome * 0.2 && (
                <li>• Your savings rate is {(netIncome / totalMonthlyIncome * 100).toFixed(1)}% of income, below the recommended 20%</li>
              )}
              {netIncome < 0 && (
                <li className="text-red-700 dark:text-red-400">• You're spending more than you earn. Focus on reducing expenses or increasing income.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Expected Payments Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expected Payments</h3>
            <User className="h-5 w-5 text-blue-600" />
          </div>
          
          {expectedPayments.length === 0 ? (
            <div className="text-center py-6">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No expected payments tracked yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track money you expect to receive or pay out
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Income</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalExpectedIncome, currency)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {overdueExpectedPayments.filter(p => p.type === 'income').length > 0 && 
                      `${overdueExpectedPayments.filter(p => p.type === 'income').length} overdue`}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpectedExpenses, currency)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {overdueExpectedPayments.filter(p => p.type === 'expense').length > 0 && 
                      `${overdueExpectedPayments.filter(p => p.type === 'expense').length} overdue`}
                  </p>
                </div>
              </div>
              
              {upcomingExpectedPayments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upcoming (Next 7 Days)</h4>
                  <div className="space-y-2">
                    {upcomingExpectedPayments.slice(0, 3).map(payment => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${payment.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{payment.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${payment.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount, currency)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatDate(payment.expectedDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-center mt-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto">
                  Manage Expected Payments <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debt Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Debt Overview</h3>
        <div className="space-y-3">
          {loans.length === 0 && !bankAccounts.some(account => account.isActive && (account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0))) ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No debts to display</p>
          ) : (
            <>
              {/* Account Debts */}
              {bankAccounts
                .filter(account => account.isActive && (account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)))
                .map(account => {
                  const negativeBalance = Math.abs(Math.min(0, account.balance));
                  const overdraftUsed = account.overdraftUsed || 0;
                  const totalDebt = negativeBalance + overdraftUsed;
                  const minPayment = Math.max(totalDebt * 0.05, 25);
                  
                  return (
                    <div key={account.id} className="flex justify-between items-center py-2 border-l-4 border-orange-500 pl-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.name} Account Debt</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {negativeBalance > 0 && `Negative Balance: ${formatCurrency(negativeBalance, currency)}`}
                          {negativeBalance > 0 && overdraftUsed > 0 && ' + '}
                          {overdraftUsed > 0 && `Overdraft: ${formatCurrency(overdraftUsed, currency)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">{formatCurrency(totalDebt, currency)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Min: {formatCurrency(minPayment, currency)}</p>
                      </div>
                    </div>
                  );
                })}
              
              {/* Traditional Loans */}
              {loans.map(loan => (
                <div key={loan.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{loan.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{loan.interestRate}% Monthly Interest</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(loan.currentBalance, currency)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min: {formatCurrency(loan.minimumPayment, currency)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* Debt Insights */}
        {(loans.length > 0 || bankAccounts.some(account => account.isActive && (account.balance < 0 || (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)))) && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800 dark:text-blue-300">Debt Insights</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
              {loans.length > 0 && (
                <li>• Focus on paying off {loans.sort((a, b) => b.interestRate - a.interestRate)[0].name} first due to its high interest rate of {loans.sort((a, b) => b.interestRate - a.interestRate)[0].interestRate}%</li>
              )}
              {bankAccounts.some(account => account.isActive && account.balance < 0) && (
                <li>• Prioritize clearing negative account balances to avoid fees and penalties</li>
              )}
              {bankAccounts.some(account => account.isActive && account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0) && (
                <li>• Pay off overdraft usage to reduce ongoing charges</li>
              )}
              {totalDebt > totalMonthlyIncome * 3 && (
                <li>• Your debt is {(totalDebt / totalMonthlyIncome).toFixed(1)}x your monthly income. Consider a debt reduction strategy.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Bills (Next 7 Days)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{bill.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(bill.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-orange-600">{formatCurrency(bill.amount, currency)}</p>
                  <Calendar className="h-4 w-4 text-orange-500 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Health Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Health Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Emergency Fund</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {netIncome > 0 
                ? `You have ${formatCurrency(netIncome, currency)} available monthly. Consider building an emergency fund of 3-6 months of expenses.`
                : "Focus on reducing expenses or increasing income to create breathing room."
              }
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Debt Strategy</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              {loans.length > 0
                ? `Prioritize paying off ${loans.sort((a, b) => b.interestRate - a.interestRate)[0].name} with ${loans.sort((a, b) => b.interestRate - a.interestRate)[0].interestRate}% interest to save money.`
                : "You're debt-free! Consider investing for future growth."
              }
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Spending Balance</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Your wants represent {totalMonthlyIncome > 0 ? ((totalWants / totalMonthlyIncome) * 100).toFixed(1) : 0}% of your income. 
              {totalWants > totalMonthlyIncome * 0.3 
                ? " This is above the recommended 30%. Consider reducing discretionary spending."
                : " This is within the recommended range of 30% or less."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;