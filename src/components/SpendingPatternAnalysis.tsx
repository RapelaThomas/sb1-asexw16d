import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle, Brain, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SpendingPattern, Currency, Expense, DailyEntry } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface SpendingPatternAnalysisProps {
  spendingPatterns: SpendingPattern[];
  expenses: Expense[];
  dailyEntries: DailyEntry[];
  currency: Currency;
}

const SpendingPatternAnalysis: React.FC<SpendingPatternAnalysisProps> = ({
  spendingPatterns,
  expenses,
  dailyEntries,
  currency
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30days' | '90days' | '6months' | '1year'>('30days');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate total spending by category
  const calculateCategorySpending = () => {
    const categories: Record<string, number> = {};
    
    // Add regular expenses
    expenses.forEach(expense => {
      const category = expense.category;
      if (!categories[category]) categories[category] = 0;
      categories[category] += expense.monthlyAmount;
    });
    
    // Add daily entries
    dailyEntries.forEach(entry => {
      if (entry.category && entry.expenses > 0) {
        if (!categories[entry.category]) categories[entry.category] = 0;
        categories[entry.category] += entry.expenses;
      }
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      case '6months': return 'Last 6 Months';
      case '1year': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: 'increasing' | 'decreasing' | 'stable', category: string) => {
    const isWant = category === 'want';
    
    switch (trend) {
      case 'increasing':
        return isWant 
          ? 'Spending is increasing - consider setting limits' 
          : 'Spending is increasing - review for potential savings';
      case 'decreasing':
        return isWant 
          ? 'Great job! Spending is decreasing' 
          : 'Spending is decreasing - ensure needs are still met';
      case 'stable':
        return 'Spending is stable';
    }
  };

  const categorySpending = calculateCategorySpending();
  const totalSpending = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);

  // Get spending data for visualization
  const getSpendingData = () => {
    // This would normally use real historical data
    // For demo purposes, we'll generate some sample data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const needsData = months.map((_, i) => {
      const baseAmount = 1200;
      const variation = Math.random() * 200 - 100;
      return baseAmount + variation;
    });
    
    const wantsData = months.map((_, i) => {
      const baseAmount = 800;
      const variation = Math.random() * 300 - 150;
      return baseAmount + variation;
    });
    
    // Reorder months to start with current month - 11
    const startMonth = (currentMonth - 11 + 12) % 12;
    const orderedMonths = [...months.slice(startMonth), ...months.slice(0, startMonth)];
    
    return {
      months: orderedMonths,
      needs: needsData,
      wants: wantsData
    };
  };

  const spendingData = getSpendingData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Pattern Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">AI-powered insights into your spending habits</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="need">Needs</option>
            <option value="want">Wants</option>
          </select>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6" />
          <h3 className="text-lg font-semibold">AI Spending Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">Spending Trends</h4>
            <ul className="space-y-2 text-sm">
              {spendingPatterns.map((pattern, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="mt-0.5">
                    {getTrendIcon(pattern.trend)}
                  </div>
                  <span>
                    {pattern.category === 'need' ? 'Needs' : 'Wants'} spending is {pattern.trend}. 
                    {pattern.trend === 'increasing' && pattern.category === 'want' && 
                      ' Consider reviewing your discretionary expenses.'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">Optimization Opportunities</h4>
            <ul className="space-y-2 text-sm">
              {spendingPatterns.flatMap((pattern, index) => 
                pattern.suggestions.map((suggestion, i) => (
                  <li key={`${index}-${i}`} className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm">
            Potential monthly savings: {formatCurrency(spendingPatterns.reduce((sum, p) => sum + p.optimizationPotential, 0), currency)}
          </p>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{getTimeframeLabel()}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpending, currency)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {categorySpending.map((category, index) => {
                const percentage = (category.amount / totalSpending) * 100;
                const isNeed = category.category === 'need';
                
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full ${isNeed ? 'bg-blue-500' : 'bg-purple-500'} mr-2`}></span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isNeed ? 'Needs' : 'Wants'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(category.amount, currency)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isNeed ? 'bg-blue-500' : 'bg-purple-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Spending Visualization */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Monthly Spending Trends</h4>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between space-x-2">
                  {spendingData.months.map((month, index) => {
                    const needsHeight = (spendingData.needs[index] / 2000) * 100;
                    const wantsHeight = (spendingData.wants[index] / 2000) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                        <div className="w-full flex justify-center space-x-1">
                          <div className="relative group">
                            <div 
                              className="w-4 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                              style={{ height: `${needsHeight}%` }}
                            ></div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Needs: {formatCurrency(spendingData.needs[index], currency)}
                            </div>
                          </div>
                          <div className="relative group">
                            <div 
                              className="w-4 bg-purple-500 rounded-t transition-all duration-300 hover:bg-purple-600"
                              style={{ height: `${wantsHeight}%` }}
                            ></div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Wants: {formatCurrency(spendingData.wants[index], currency)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Suggestions</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {spendingPatterns.map((pattern, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {pattern.category === 'need' ? 'Needs' : 'Wants'} Spending
                  </h4>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(pattern.trend)}
                    <span className={`text-sm ${
                      pattern.trend === 'increasing' 
                        ? 'text-red-600' 
                        : pattern.trend === 'decreasing' 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                    }`}>
                      {pattern.trend === 'increasing' ? '+' : pattern.trend === 'decreasing' ? '-' : ''}
                      {pattern.trend !== 'stable' && '10%'}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getTrendLabel(pattern.trend, pattern.category)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {pattern.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{suggestion}</p>
                        {pattern.optimizationPotential > 0 && i === 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Potential savings: {formatCurrency(pattern.optimizationPotential, currency)}/month
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {pattern.seasonality && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Seasonal spending detected
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Peak months: {pattern.peakMonths.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800 dark:text-green-300">Total Potential Savings</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-green-700 dark:text-green-400">
                  By implementing these suggestions:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(spendingPatterns.reduce((sum, p) => sum + p.optimizationPotential, 0), currency)}/month
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                That's {formatCurrency(spendingPatterns.reduce((sum, p) => sum + p.optimizationPotential, 0) * 12, currency)} per year!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Category Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Category Analysis</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monthly Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % of Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Optimization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {spendingPatterns.map((pattern, index) => {
                  const percentage = (pattern.averageMonthly / totalSpending) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            pattern.category === 'need' ? 'bg-blue-500' : 'bg-purple-500'
                          } mr-2`}></div>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {pattern.category === 'need' ? 'Needs' : 'Wants'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(pattern.averageMonthly, currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTrendIcon(pattern.trend)}
                          <span className={`ml-1 ${
                            pattern.trend === 'increasing' 
                              ? 'text-red-600' 
                              : pattern.trend === 'decreasing' 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                          }`}>
                            {pattern.trend.charAt(0).toUpperCase() + pattern.trend.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(pattern.optimizationPotential, currency)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingPatternAnalysis;