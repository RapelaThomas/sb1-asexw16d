import React, { useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Calendar, DollarSign, Bell, User } from 'lucide-react';
import { Income, Expense, Loan, Bill, DailyEntry, FinancialGoal, UserPreferences, Currency, BankAccount, ExpectedPayment } from '../types';
import { formatCurrency, getNextPaymentRecommendation, calculateDailyAverage, calculateNetWorth, getUpcomingExpectedPayments, getOverdueExpectedPayments } from '../utils/calculations';

interface SmartRecommendationsProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  bills: Bill[];
  dailyEntries: DailyEntry[];
  goals: FinancialGoal[];
  preferences: UserPreferences;
  currency: Currency;
  bankAccounts?: BankAccount[];
  expectedPayments?: ExpectedPayment[];
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  incomes,
  expenses,
  loans,
  bills,
  dailyEntries,
  goals,
  preferences,
  currency,
  bankAccounts = [],
  expectedPayments = []
}) => {
  const { income: avgDailyIncome, expenses: avgDailyExpenses } = calculateDailyAverage(dailyEntries, 30);
  const availableDaily = avgDailyIncome - avgDailyExpenses;
  
  // FIXED: Use enhanced payment recommendation that includes account debts
  const nextPayment = getNextPaymentRecommendation(
    loans,
    bills,
    availableDaily * 30,
    preferences.debtStrategy === 'debt-focused' ? 'avalanche' : 'snowball',
    bankAccounts
  );

  const urgentBills = bills.filter(bill => {
    if (bill.isPaid) return false;
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilDue <= 3;
  });

  // Check for account debts
  const accountsWithDebt = bankAccounts.filter(account => 
    account.isActive && (
      account.balance < 0 || 
      (account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    )
  );

  // Check for expected payments
  const overdueExpectedPayments = getOverdueExpectedPayments(expectedPayments);
  const upcomingExpectedPayments = getUpcomingExpectedPayments(expectedPayments, 7);

  const highPriorityGoals = goals.filter(goal => goal.priority === 'high');

  // Calculate net worth using the consistent method
  const netWorth = calculateNetWorth(bankAccounts, loans, goals, expectedPayments);

  // Daily reminder notification
  useEffect(() => {
    const checkDailyReminder = () => {
      const now = new Date();
      const reminderTime = preferences.reminderTime || '09:00';
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);
      
      // Check if it's within 5 minutes of reminder time
      const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeDiff <= fiveMinutes) {
        // Check if user has logged today's entry
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = dailyEntries.find(entry => entry.date === today);
        
        if (!todayEntry && 'Notification' in window) {
          // Request permission if not granted
          if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                showNotification();
              }
            });
          } else if (Notification.permission === 'granted') {
            showNotification();
          }
        }
      }
    };

    const showNotification = () => {
      new Notification('RT MoneyMaster Reminder', {
        body: "Don't forget to log your daily income and expenses!",
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    };

    // Check every minute
    const interval = setInterval(checkDailyReminder, 60000);
    
    // Check immediately
    checkDailyReminder();
    
    return () => clearInterval(interval);
  }, [dailyEntries, preferences.reminderTime]);
  
  const generateDailyReminder = () => {
    const reminders = [];
    
    // Account debt reminders (highest priority)
    accountsWithDebt.forEach(account => {
      const negativeBalance = Math.abs(Math.min(0, account.balance));
      const overdraftUsed = account.overdraftUsed || 0;
      const totalDebt = negativeBalance + overdraftUsed;
      
      if (totalDebt > 0) {
        reminders.push({
          type: 'account-debt',
          priority: 'high',
          title: `${account.name} Account Debt`,
          message: `${negativeBalance > 0 ? `Negative balance: ${formatCurrency(negativeBalance, currency)}` : ''}${negativeBalance > 0 && overdraftUsed > 0 ? ' + ' : ''}${overdraftUsed > 0 ? `Overdraft: ${formatCurrency(overdraftUsed, currency)}` : ''}`,
          action: 'Pay Now',
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50'
        });
      }
    });
    
    // Overdue expected payments
    overdueExpectedPayments.forEach(payment => {
      reminders.push({
        type: 'expected-payment',
        priority: 'high',
        title: `Overdue ${payment.type === 'income' ? 'Income' : 'Payment'}: ${payment.name}`,
        message: `Expected on ${new Date(payment.expectedDate).toLocaleDateString()} - ${formatCurrency(payment.amount, currency)}${payment.personName ? ` ${payment.type === 'income' ? 'from' : 'to'} ${payment.personName}` : ''}`,
        action: payment.type === 'income' ? 'Mark as Received' : 'Mark as Paid',
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50'
      });
    });
    
    // Daily tracking reminder
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = dailyEntries.find(entry => entry.date === today);
    
    if (!todayEntry) {
      reminders.push({
        type: 'daily-tracking',
        priority: 'high',
        title: 'Log Today\'s Finances',
        message: 'Don\'t forget to track your income and expenses for today.',
        action: 'Add Daily Entry',
        icon: Calendar,
        color: 'text-blue-600 bg-blue-50'
      });
    }
    
    // Urgent bill reminders
    urgentBills.forEach(bill => {
      reminders.push({
        type: 'urgent-bill',
        priority: 'high',
        title: `${bill.name} Due Soon`,
        message: `Due ${new Date(bill.dueDate).toLocaleDateString()} - ${formatCurrency(bill.amount, currency)}`,
        action: 'Pay Now',
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50'
      });
    });
    
    // Upcoming expected payments
    upcomingExpectedPayments.forEach(payment => {
      reminders.push({
        type: 'expected-payment',
        priority: 'medium',
        title: `Upcoming ${payment.type === 'income' ? 'Income' : 'Payment'}: ${payment.name}`,
        message: `Expected on ${new Date(payment.expectedDate).toLocaleDateString()} - ${formatCurrency(payment.amount, currency)}${payment.personName ? ` ${payment.type === 'income' ? 'from' : 'to'} ${payment.personName}` : ''}`,
        action: 'Remind Me',
        icon: Calendar,
        color: 'text-orange-600 bg-orange-50'
      });
    });
    
    // Payment recommendation
    if (nextPayment && availableDaily > 0) {
      reminders.push({
        type: 'payment-recommendation',
        priority: 'medium',
        title: `Smart Payment Suggestion`,
        message: `Consider paying ${formatCurrency(nextPayment.amount, currency)} toward ${nextPayment.name}. ${nextPayment.reason}`,
        action: 'Make Payment',
        icon: DollarSign,
        color: 'text-green-600 bg-green-50'
      });
    }
    
    // Goal progress reminders
    highPriorityGoals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      if (progress < 50) {
        reminders.push({
          type: 'goal-progress',
          priority: 'medium',
          title: `${goal.name} Progress`,
          message: `You're ${progress.toFixed(1)}% toward your goal. Consider allocating more funds.`,
          action: 'Update Goal',
          icon: TrendingUp,
          color: 'text-purple-600 bg-purple-50'
        });
      }
    });
    
    return reminders.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const reminders = generateDailyReminder();

  const getSpendingInsights = () => {
    const insights = [];
    
    // Net worth insight
    insights.push({
      type: netWorth >= 0 ? 'positive' : 'warning',
      title: 'Net Worth',
      message: netWorth >= 0 
        ? `Your net worth is ${formatCurrency(netWorth, currency)}. Keep building your assets!` 
        : `Your net worth is ${formatCurrency(netWorth, currency)}. Focus on reducing debts to improve this figure.`,
      icon: netWorth >= 0 ? CheckCircle : AlertTriangle,
      color: netWorth >= 0 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
    });
    
    // Expected payments insights
    if (overdueExpectedPayments.length > 0) {
      const overdueIncome = overdueExpectedPayments.filter(p => p.type === 'income');
      const overdueExpenses = overdueExpectedPayments.filter(p => p.type === 'expense');
      
      if (overdueIncome.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Overdue Expected Income',
          message: `You have ${overdueIncome.length} overdue income payments totaling ${formatCurrency(overdueIncome.reduce((sum, p) => sum + p.amount, 0), currency)}. Follow up on these payments.`,
          icon: AlertTriangle,
          color: 'text-orange-600 bg-orange-50'
        });
      }
      
      if (overdueExpenses.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Overdue Expected Expenses',
          message: `You have ${overdueExpenses.length} overdue expense payments totaling ${formatCurrency(overdueExpenses.reduce((sum, p) => sum + p.amount, 0), currency)}. Make these payments to maintain good financial relationships.`,
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50'
        });
      }
    }
    
    if (dailyEntries.length >= 7) {
      const last7Days = dailyEntries.slice(-7);
      const weeklySpending = last7Days.reduce((sum, entry) => sum + entry.expenses, 0);
      const weeklyIncome = last7Days.reduce((sum, entry) => sum + entry.income, 0);
      
      if (weeklySpending > weeklyIncome) {
        insights.push({
          type: 'warning',
          title: 'Spending Alert',
          message: `You've spent ${formatCurrency(weeklySpending - weeklyIncome, currency)} more than you earned this week.`,
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50'
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Great Job!',
          message: `You saved ${formatCurrency(weeklyIncome - weeklySpending, currency)} this week.`,
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50'
        });
      }
    }
    
    // Account debt insights
    if (accountsWithDebt.length > 0) {
      const totalAccountDebt = accountsWithDebt.reduce((sum, account) => {
        const negativeBalance = Math.abs(Math.min(0, account.balance));
        const overdraftUsed = account.overdraftUsed || 0;
        return sum + negativeBalance + overdraftUsed;
      }, 0);
      
      insights.push({
        type: 'warning',
        title: 'Account Debt Alert',
        message: `You have ${formatCurrency(totalAccountDebt, currency)} in account debts. Prioritize paying these off to avoid fees.`,
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50'
      });
    }
    
    return insights;
  };

  const spendingInsights = getSpendingInsights();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Recommendations</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">AI-powered insights and daily reminders</p>
        
        {/* Notification Status */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Daily Reminder: {preferences.reminderTime} 
              {Notification.permission === 'granted' ? ' (Enabled)' : ' (Click to enable notifications)'}
            </span>
          </div>
          {Notification.permission !== 'granted' && (
            <button
              onClick={() => Notification.requestPermission()}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            >
              Enable browser notifications for daily reminders
            </button>
          )}
        </div>
      </div>

      {/* Daily Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Action Items</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {reminders.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 dark:text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">All caught up! No urgent actions needed today.</p>
            </div>
          ) : (
            reminders.map((reminder, index) => {
              const Icon = reminder.icon;
              return (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${reminder.color} dark:bg-opacity-20`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{reminder.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reminder.message}</p>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                      {reminder.action}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Spending Insights */}
      {spendingInsights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Insights</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {spendingInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${insight.color} dark:bg-opacity-20`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expected Payments Section */}
      {(overdueExpectedPayments.length > 0 || upcomingExpectedPayments.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expected Payments</h3>
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {overdueExpectedPayments.length > 0 && (
              <div className="px-6 py-4">
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">Overdue</h4>
                <div className="space-y-3">
                  {overdueExpectedPayments.slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${payment.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{payment.name}</span>
                        {payment.personName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.type === 'income' ? 'from' : 'to'} {payment.personName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${payment.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
            
            {upcomingExpectedPayments.length > 0 && (
              <div className="px-6 py-4">
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3">Upcoming (Next 7 Days)</h4>
                <div className="space-y-3">
                  {upcomingExpectedPayments.slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${payment.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{payment.name}</span>
                        {payment.personName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.type === 'income' ? 'from' : 'to'} {payment.personName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${payment.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
            
            {(overdueExpectedPayments.length > 3 || upcomingExpectedPayments.length > 3) && (
              <div className="px-6 py-3 text-center">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  View All Expected Payments
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average Net</p>
          <p className={`text-2xl font-bold ${availableDaily >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(availableDaily, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent Bills</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{urgentBills.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due within 3 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Worth</p>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(netWorth, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assets minus Liabilities</p>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;