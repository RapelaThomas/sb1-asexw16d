import React, { useState } from 'react';
import { Settings, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Zap, BarChart3 } from 'lucide-react';
import { Currency, Expense, Income } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface BudgetCategoryOptimizationProps {
  expenses: Expense[];
  incomes: Income[];
  currency: Currency;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void;
}

const BudgetCategoryOptimization: React.FC<BudgetCategoryOptimizationProps> = ({
  expenses,
  incomes,
  currency,
  onUpdateExpense
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.monthlyAmount, 0);
  
  // Group expenses by category
  const needsExpenses = expenses.filter(e => e.category === 'need');
  const wantsExpenses = expenses.filter(e => e.category === 'want');
  
  const totalNeeds = needsExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const totalWants = wantsExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const totalExpenses = totalNeeds + totalWants;
  
  // Calculate percentages
  const needsPercentage = totalIncome > 0 ? (totalNeeds / totalIncome) * 100 : 0;
  const wantsPercentage = totalIncome > 0 ? (totalWants / totalIncome) * 100 : 0;
  const savingsPercentage = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  // Ideal 50/30/20 rule
  const idealNeeds = totalIncome * 0.5;
  const idealWants = totalIncome * 0.3;
  const idealSavings = totalIncome * 0.2;
  
  // Calculate differences
  const needsDifference = totalNeeds - idealNeeds;
  const wantsDifference = totalWants - idealWants;
  const savingsDifference = (totalIncome - totalExpenses) - idealSavings;
  
  // Generate optimization suggestions
  const generateOptimizationSuggestions = () => {
    const suggestions = [];
    
    if (needsPercentage > 50) {
      suggestions.push({
        category: 'needs',
        message: `Your needs spending is ${needsPercentage.toFixed(1)}% of income, above the recommended 50%.`,
        action: `Consider reducing by ${formatCurrency(needsDifference, currency)}/month.`,
        items: needsExpenses
          .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
          .slice(0, 3)
          .map(e => ({
            id: e.id,
            name: e.name,
            amount: e.monthlyAmount,
            potential: e.monthlyAmount * 0.1 // Suggest 10% reduction
          }))
      });
    }
    
    if (wantsPercentage > 30) {
      suggestions.push({
        category: 'wants',
        message: `Your wants spending is ${wantsPercentage.toFixed(1)}% of income, above the recommended 30%.`,
        action: `Consider reducing by ${formatCurrency(wantsDifference, currency)}/month.`,
        items: wantsExpenses
          .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
          .slice(0, 3)
          .map(e => ({
            id: e.id,
            name: e.name,
            amount: e.monthlyAmount,
            potential: e.monthlyAmount * 0.2 // Suggest 20% reduction
          }))
      });
    }
    
    if (savingsPercentage < 20) {
      suggestions.push({
        category: 'savings',
        message: `Your savings rate is ${savingsPercentage.toFixed(1)}% of income, below the recommended 20%.`,
        action: `Aim to increase savings by ${formatCurrency(Math.abs(savingsDifference), currency)}/month.`,
        items: []
      });
    }
    
    return suggestions;
  };
  
  const optimizationSuggestions = generateOptimizationSuggestions();

  // Handle expense reduction
  const handleReduceExpense = (expenseId: string, reductionAmount: number) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    const newAmount = Math.max(0, expense.amount - reductionAmount);
    onUpdateExpense(expenseId, { amount: newAmount });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Category Optimization</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Optimize your budget allocation for better financial health</p>
        </div>
        <button
          onClick={() => setShowOptimizationDetails(!showOptimizationDetails)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Brain className="h-4 w-4 mr-2" />
          {showOptimizationDetails ? 'Hide Details' : 'Show Optimization Details'}
        </button>
      </div>

      {/* Current Budget Allocation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Budget Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{needsPercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Needs</div>
            <div className="text-lg font-medium text-blue-600">{formatCurrency(totalNeeds, currency)}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{wantsPercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wants</div>
            <div className="text-lg font-medium text-purple-600">{formatCurrency(totalWants, currency)}</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{savingsPercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Savings</div>
            <div className="text-lg font-medium text-green-600">{formatCurrency(totalIncome - totalExpenses, currency)}</div>
          </div>
        </div>
        
        {/* 50/30/20 Rule Comparison */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Comparison to 50/30/20 Rule</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Needs (50%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(idealNeeds, currency)}
                  </span>
                  <span className={`text-xs font-medium ${
                    needsDifference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {needsDifference > 0 ? '+' : ''}{formatCurrency(needsDifference, currency)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, needsPercentage)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wants (30%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(idealWants, currency)}
                  </span>
                  <span className={`text-xs font-medium ${
                    wantsDifference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {wantsDifference > 0 ? '+' : ''}{formatCurrency(wantsDifference, currency)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, wantsPercentage)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Savings (20%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(idealSavings, currency)}
                  </span>
                  <span className={`text-xs font-medium ${
                    savingsDifference < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {savingsDifference > 0 ? '+' : ''}{formatCurrency(savingsDifference, currency)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, savingsPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget Health Assessment */}
        <div className={`p-4 rounded-lg ${
          savingsPercentage >= 20 && needsPercentage <= 50 && wantsPercentage <= 30
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center">
            {savingsPercentage >= 20 && needsPercentage <= 50 && wantsPercentage <= 30 ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            )}
            <span className={`font-medium ${
              savingsPercentage >= 20 && needsPercentage <= 50 && wantsPercentage <= 30
                ? 'text-green-800 dark:text-green-300'
                : 'text-yellow-800 dark:text-yellow-300'
            }`}>
              Budget Health Assessment
            </span>
          </div>
          <p className={`text-sm mt-1 ${
            savingsPercentage >= 20 && needsPercentage <= 50 && wantsPercentage <= 30
              ? 'text-green-700 dark:text-green-400'
              : 'text-yellow-700 dark:text-yellow-400'
          }`}>
            {savingsPercentage >= 20 && needsPercentage <= 50 && wantsPercentage <= 30
              ? 'Your budget allocation is well-balanced according to the 50/30/20 rule.'
              : 'Your budget could use some optimization to better align with the 50/30/20 rule.'}
          </p>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Optimization Suggestions</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start space-x-3 mb-3">
                  {suggestion.category === 'needs' ? (
                    <TrendingDown className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : suggestion.category === 'wants' ? (
                    <TrendingDown className="h-5 w-5 text-purple-600 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {suggestion.category} Optimization
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {suggestion.message} {suggestion.action}
                    </p>
                  </div>
                </div>
                
                {suggestion.items.length > 0 && (
                  <div className="mt-3 space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Items to Optimize:</h5>
                    {suggestion.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Current: {formatCurrency(item.amount, currency)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                            <p className="text-lg font-medium text-green-600">
                              {formatCurrency(item.potential, currency)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleReduceExpense(item.id, item.potential)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Details */}
      {showOptimizationDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Needs Breakdown</h4>
                <div className="space-y-3">
                  {needsExpenses
                    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
                    .slice(0, 5)
                    .map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{expense.name}</span>
                        <span className="text-blue-600">{formatCurrency(expense.monthlyAmount, currency)}</span>
                      </div>
                    ))}
                  {needsExpenses.length > 5 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      +{needsExpenses.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Wants Breakdown</h4>
                <div className="space-y-3">
                  {wantsExpenses
                    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
                    .slice(0, 5)
                    .map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{expense.name}</span>
                        <span className="text-purple-600">{formatCurrency(expense.monthlyAmount, currency)}</span>
                      </div>
                    ))}
                  {wantsExpenses.length > 5 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      +{wantsExpenses.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="font-medium text-indigo-800 dark:text-indigo-300">Optimization Strategy</span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                The 50/30/20 rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. This balanced approach helps ensure financial stability while still allowing for enjoyment and future planning.
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Needs (50%)</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    Housing, utilities, groceries, transportation, insurance, minimum debt payments
                  </p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Wants (30%)</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    Dining out, entertainment, hobbies, subscriptions, travel, non-essential shopping
                  </p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Savings (20%)</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    Emergency fund, retirement, investments, extra debt payments, financial goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Impact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Impact</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Financial Health</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Optimizing your budget categories could improve your financial health score by up to 15 points.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Savings Growth</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Following these optimizations could add {formatCurrency(Math.abs(savingsDifference) * 12, currency)} to your savings annually.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Goal Achievement</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                You could reach your financial goals up to 30% faster with an optimized budget allocation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCategoryOptimization;