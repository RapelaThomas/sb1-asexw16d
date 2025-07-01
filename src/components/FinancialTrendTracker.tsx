import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';
import { Income, Expense, Loan, DailyEntry, BusinessEntry, Currency, BankAccount, ExpectedPayment } from '../types';
import { formatCurrency, calculateTotalMonthlyIncome, calculateTotalMonthlyExpenses, calculateTotalDebt, calculateNetWorth } from '../utils/calculations';

interface FinancialTrendTrackerProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  dailyEntries: DailyEntry[];
  businessEntries: BusinessEntry[];
  currency: Currency;
  bankAccounts?: BankAccount[];
  expectedPayments?: ExpectedPayment[];
}

interface TrendData {
  period: string;
  income: number;
  expenses: number;
  netIncome: number;
  businessProfit: number;
  totalDebt: number;
  netWorth: number;
}

interface TrendComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  isGood: boolean;
}

const FinancialTrendTracker: React.FC<FinancialTrendTrackerProps> = ({
  incomes,
  expenses,
  loans,
  dailyEntries,
  businessEntries,
  currency,
  bankAccounts = [],
  expectedPayments = []
}) => {
  const trendData = useMemo(() => {
    const now = new Date();
    const periods: TrendData[] = [];
    
    // Generate data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const periodDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Filter entries for this period
      const periodDailyEntries = dailyEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= periodDate && entryDate <= periodEnd;
      });
      
      const periodBusinessEntries = businessEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= periodDate && entryDate <= periodEnd;
      });
      
      // Calculate metrics for this period
      const monthlyIncome = calculateTotalMonthlyIncome(incomes);
      const monthlyExpenses = calculateTotalMonthlyExpenses(expenses);
      const dailyIncome = periodDailyEntries.reduce((sum, entry) => sum + entry.income, 0);
      const dailyExpenses = periodDailyEntries.reduce((sum, entry) => sum + entry.expenses, 0);
      const businessProfit = periodBusinessEntries.reduce((sum, entry) => sum + entry.profit, 0);
      
      // FIXED: Use enhanced debt calculation
      const totalDebt = calculateTotalDebt(loans, bankAccounts);
      
      // FIXED: Use consistent net worth calculation
      const netWorth = calculateNetWorth(bankAccounts, loans, [], expectedPayments);
      
      const totalIncome = monthlyIncome + dailyIncome;
      const totalExpenses = monthlyExpenses + dailyExpenses;
      
      periods.push({
        period: periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: totalIncome,
        expenses: totalExpenses,
        netIncome: totalIncome - totalExpenses,
        businessProfit,
        totalDebt,
        netWorth
      });
    }
    
    return periods;
  }, [incomes, expenses, loans, dailyEntries, businessEntries, bankAccounts, expectedPayments]);

  const comparisons = useMemo((): TrendComparison[] => {
    if (trendData.length < 2) return [];
    
    const current = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    
    const createComparison = (
      metric: string,
      currentValue: number,
      previousValue: number,
      isGoodWhenUp: boolean = true
    ): TrendComparison => {
      const change = currentValue - previousValue;
      const changePercent = previousValue !== 0 ? (change / Math.abs(previousValue)) * 100 : 0;
      
      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(changePercent) < 1) {
        trend = 'stable';
      } else if (change > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }
      
      // For debt, "good" means decreasing (trend down)
      // For everything else, "good" means increasing (trend up)
      const isGood = metric === 'Total Debt' 
        ? (trend === 'down' || trend === 'stable')
        : (trend === 'up' || (trend === 'stable' && isGoodWhenUp));
      
      return {
        metric,
        current: currentValue,
        previous: previousValue,
        change,
        changePercent,
        trend,
        isGood
      };
    };
    
    return [
      createComparison('Total Income', current.income, previous.income, true),
      createComparison('Total Expenses', current.expenses, previous.expenses, false),
      createComparison('Net Income', current.netIncome, previous.netIncome, true),
      createComparison('Business Profit', current.businessProfit, previous.businessProfit, true),
      createComparison('Total Debt', current.totalDebt, previous.totalDebt, false),
      createComparison('Net Worth', current.netWorth, previous.netWorth, true)
    ];
  }, [trendData]);

  const overallFinancialHealth = useMemo(() => {
    // Count positive changes (good trends)
    const positiveChanges = comparisons.filter(comp => comp.isGood).length;
    const totalChanges = comparisons.length;
    
    // Calculate health percentage
    const healthPercentage = totalChanges > 0 ? (positiveChanges / totalChanges) * 100 : 0;
    
    if (totalChanges === 0) return { status: 'stable', message: 'No data available for comparison' };
    
    // Check for critical indicators
    const netWorthNegative = trendData.length > 0 && trendData[trendData.length - 1].netWorth < 0;
    const highDebt = trendData.length > 0 && trendData[trendData.length - 1].totalDebt > 0 && 
                    (trendData[trendData.length - 1].totalDebt > trendData[trendData.length - 1].income * 6);
    const negativeNetIncome = trendData.length > 0 && trendData[trendData.length - 1].netIncome < 0;
    
    // FIXED: Prioritize critical indicators over percentage-based assessment
    if (netWorthNegative && negativeNetIncome) {
      return { 
        status: 'poor', 
        message: 'Your financial situation is poor. Focus on increasing income and reducing expenses to improve your net worth.'
      };
    } else if (highDebt || negativeNetIncome) {
      return { 
        status: 'declining', 
        message: 'Your financial situation is declining. Address debt levels and ensure income exceeds expenses.'
      };
    }
    
    // If no critical indicators, use percentage-based assessment
    if (healthPercentage >= 80) {
      return { status: 'improving', message: 'Your financial situation is improving significantly!' };
    } else if (healthPercentage >= 60) {
      return { status: 'stable', message: 'Your financial situation is relatively stable with some positive trends.' };
    } else if (healthPercentage >= 40) {
      return { status: 'mixed', message: 'Your financial situation shows mixed results. Focus on key areas for improvement.' };
    } else {
      return { status: 'declining', message: 'Your financial situation needs attention. Consider reviewing your budget and expenses.' };
    }
  }, [comparisons, trendData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', isGood: boolean) => {
    if (trend === 'stable') return <Minus className="h-4 w-4" />;
    if (trend === 'up') return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  const getTrendColor = (isGood: boolean, trend: 'up' | 'down' | 'stable') => {
    if (trend === 'stable') return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    return isGood ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'improving': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'stable': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'mixed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'declining': 
      case 'poor': 
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // FIXED: Get the appropriate icon based on financial status
  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'improving': return <TrendingUp className="h-6 w-6" />;
      case 'stable': return <BarChart3 className="h-6 w-6" />;
      case 'mixed': return <Calendar className="h-6 w-6" />;
      case 'declining': 
      case 'poor': 
        return <TrendingDown className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const HealthStatusIcon = getHealthStatusIcon(overallFinancialHealth.status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Trend Analysis</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Track your financial progress over time</p>
      </div>

      {/* Overall Financial Health */}
      <div className={`rounded-lg p-6 ${getHealthStatusColor(overallFinancialHealth.status)}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {HealthStatusIcon}
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize">
              Financial Status: {overallFinancialHealth.status}
            </h3>
            <p className="text-sm opacity-90">{overallFinancialHealth.message}</p>
          </div>
        </div>
      </div>

      {/* Trend Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisons.map((comparison, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{comparison.metric}</h3>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(comparison.isGood, comparison.trend)}`}>
                {getTrendIcon(comparison.trend, comparison.isGood)}
                <span>
                  {comparison.trend === 'stable' ? '0%' : `${comparison.changePercent > 0 ? '+' : ''}${comparison.changePercent.toFixed(1)}%`}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(comparison.current, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Previous Month</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(comparison.previous, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
                <p className={`text-sm font-medium ${
                  comparison.metric === 'Total Debt'
                    ? (comparison.change > 0 ? 'text-red-600' : comparison.change < 0 ? 'text-green-600' : 'text-gray-600')
                    : (comparison.change > 0 ? 'text-green-600' : comparison.change < 0 ? 'text-red-600' : 'text-gray-600')
                }`}>
                  {comparison.change > 0 ? '+' : ''}{formatCurrency(comparison.change, currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Chart Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">6-Month Financial Chart</h3>
        </div>
        <div className="p-6">
          <div className="relative h-64 mb-6">
            {/* Chart Container */}
            <div className="absolute inset-0 flex items-end justify-between space-x-2">
              {trendData.map((period, index) => {
                const maxValue = Math.max(...trendData.map(p => Math.max(p.income, p.expenses)));
                const incomeHeight = maxValue > 0 ? (period.income / maxValue) * 100 : 0;
                const expenseHeight = maxValue > 0 ? (period.expenses / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    {/* Bars */}
                    <div className="w-full flex justify-center space-x-1">
                      <div className="relative group">
                        <div 
                          className="w-6 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                          style={{ height: `${incomeHeight * 2}px` }}
                        ></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Income: {formatCurrency(period.income, currency)}
                        </div>
                      </div>
                      <div className="relative group">
                        <div 
                          className="w-6 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                          style={{ height: `${expenseHeight * 2}px` }}
                        ></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Expenses: {formatCurrency(period.expenses, currency)}
                        </div>
                      </div>
                    </div>
                    {/* Period Label */}
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {period.period}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights and Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Insights & Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Net Worth Alert */}
            {trendData.length > 0 && trendData[trendData.length - 1].netWorth < 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300">
                    Negative Net Worth
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Your net worth is {formatCurrency(trendData[trendData.length - 1].netWorth, currency)}. Focus on reducing debts and increasing assets to improve your overall financial position.
                  </p>
                </div>
              </div>
            )}
            
            {comparisons.filter(comp => !comp.isGood && comp.trend !== 'stable').map((comp, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                    {comp.metric} needs attention
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {comp.metric === 'Total Expenses' && 'Consider reviewing your budget and identifying areas to reduce spending.'}
                    {comp.metric === 'Total Debt' && 'Focus on debt reduction strategies to improve your financial health.'}
                    {comp.metric === 'Net Income' && 'Look for ways to increase income or reduce expenses to improve cash flow.'}
                    {comp.metric === 'Business Profit' && 'Review business operations and consider cost optimization strategies.'}
                    {comp.metric === 'Net Worth' && 'Work on reducing debts and increasing assets to improve your overall financial position.'}
                  </p>
                </div>
              </div>
            ))}
            
            {comparisons.filter(comp => comp.isGood && comp.trend === 'up').map((comp, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    Great progress on {comp.metric}!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Keep up the good work. Consider maintaining or expanding these positive trends.
                  </p>
                </div>
              </div>
            ))}
            
            {comparisons.length > 0 && comparisons.every(comp => comp.isGood || comp.trend === 'stable') && !trendData[trendData.length - 1]?.netWorth < 0 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    Excellent financial management!
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your financial trends are positive. Consider setting new goals or increasing your savings rate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTrendTracker;