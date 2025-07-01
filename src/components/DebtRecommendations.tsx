import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Zap, Calculator, DollarSign, AlertCircle, Save, CheckCircle, Layers } from 'lucide-react';
import { Loan, Income, Expense, Currency, UserPreferences, PaymentSuggestion, BankAccount } from '../types';
import { 
  generateDebtRecommendations, 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses,
  calculateMinimumPayments,
  formatCurrency,
  suggestOptimalDebtStrategy,
  generatePaymentSuggestions,
  calculateFinancialHealth,
  calculateTotalDebt
} from '../utils/calculations';

interface DebtRecommendationsProps {
  loans: Loan[];
  incomes: Income[];
  expenses: Expense[];
  currency: Currency;
  preferences: UserPreferences;
  bankAccounts?: BankAccount[];
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

const DebtRecommendations: React.FC<DebtRecommendationsProps> = ({ 
  loans, 
  incomes, 
  expenses,
  currency,
  preferences,
  bankAccounts = [],
  onUpdatePreferences
}) => {
  const [extraPayment, setExtraPayment] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState<'avalanche' | 'snowball' | 'hybrid'>(
    preferences.debtStrategy || 'avalanche'
  );
  const [paymentSuggestions, setPaymentSuggestions] = useState<PaymentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const totalIncome = calculateTotalMonthlyIncome(incomes);
  const totalExpenses = calculateTotalMonthlyExpenses(expenses);
  
  // FIXED: Use enhanced debt and payment calculations
  const totalDebt = calculateTotalDebt(loans, bankAccounts);
  const minimumPayments = calculateMinimumPayments(loans, bankAccounts);
  
  const availableForDebt = totalIncome - totalExpenses - minimumPayments;

  const recommendations = generateDebtRecommendations(loans, extraPayment, selectedStrategy, bankAccounts);
  const suggestedStrategy = suggestOptimalDebtStrategy(loans, incomes, expenses, [], bankAccounts);
  const financialHealth = calculateFinancialHealth(incomes, expenses, loans, [], [], [], bankAccounts);

  // Generate payment suggestions
  useEffect(() => {
    setLoading(true);
    if (availableForDebt > 0) {
      const suggestions = generatePaymentSuggestions(
        loans, 
        [], 
        [], 
        availableForDebt, 
        preferences, 
        financialHealth,
        bankAccounts
      );
      setPaymentSuggestions(suggestions);
    }
    setLoading(false);
  }, [loans, availableForDebt, preferences, financialHealth, bankAccounts]);

  const handleSaveStrategy = () => {
    const updatedPreferences = {
      ...preferences,
      debtStrategy: selectedStrategy
    };
    onUpdatePreferences(updatedPreferences);
  };

  const handleAutoSuggestToggle = (enabled: boolean) => {
    const updatedPreferences = {
      ...preferences,
      autoSuggestStrategy: enabled,
      debtStrategy: enabled ? suggestedStrategy : selectedStrategy
    };
    onUpdatePreferences(updatedPreferences);
  };

  const markSuggestionComplete = (suggestionId: string) => {
    setPaymentSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, completed: true }
          : suggestion
      )
    );
  };

  const calculatePayoffTime = (balance: number, payment: number, interestRate: number): number => {
    if (payment <= (balance * interestRate / 100)) return 999; // Payment too low
    const monthlyRate = interestRate / 100;
    return Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate)
    );
  };

  const calculateTotalInterest = (balance: number, payment: number, interestRate: number): number => {
    const months = calculatePayoffTime(balance, payment, interestRate);
    if (months === 999) return balance * 10; // High penalty for insufficient payment
    return (payment * months) - balance;
  };

  // Check if there are any debts to analyze
  const hasDebts = totalDebt > 0;

  if (!hasDebts) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Debt Strategy</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Get personalized recommendations for paying off debt</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No debts to analyze. You're debt-free! Consider focusing on building wealth and achieving your financial goals.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Debt Strategy</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Get personalized recommendations for paying off debt</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Debt Strategy</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Personalized recommendations to become debt-free faster</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum Payments</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(minimumPayments, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available for Debt</p>
          <p className={`text-xl font-bold ${availableForDebt >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.max(0, availableForDebt), currency)}
          </p>
        </div>
      </div>

      {availableForDebt < 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800 dark:text-red-300">Budget Alert</span>
          </div>
          <p className="text-red-700 dark:text-red-400 mt-1">
            Your expenses exceed your income. Consider reducing expenses or increasing income before focusing on extra debt payments.
          </p>
        </div>
      )}

      {/* AI Strategy Suggestion */}
      {suggestedStrategy !== selectedStrategy && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800 dark:text-blue-300">AI Recommendation</span>
              </div>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                Based on your financial situation, we recommend the <strong>{suggestedStrategy}</strong> strategy.
              </p>
            </div>
            <button
              onClick={() => setSelectedStrategy(suggestedStrategy)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              Use Suggestion
            </button>
          </div>
        </div>
      )}

      {/* Auto-Suggest Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Auto-Suggest Strategy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Let AI automatically choose the best strategy based on your financial health</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.autoSuggestStrategy || false}
              onChange={(e) => handleAutoSuggestToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Strategy</h3>
          <button
            onClick={handleSaveStrategy}
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Strategy
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setSelectedStrategy('avalanche')}
            className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 ${
              selectedStrategy === 'avalanche'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900 dark:text-white">Debt Avalanche</span>
              {suggestedStrategy === 'avalanche' && (
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  AI Recommended
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pay minimums on all debts, then put extra money toward the highest interest rate debt. 
              Mathematically optimal - saves the most money.
            </p>
          </button>
          <button
            onClick={() => setSelectedStrategy('snowball')}
            className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 ${
              selectedStrategy === 'snowball'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-gray-900 dark:text-white">Debt Snowball</span>
              {suggestedStrategy === 'snowball' && (
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  AI Recommended
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pay minimums on all debts, then put extra money toward the smallest balance. 
              Psychologically motivating - builds momentum with quick wins.
            </p>
          </button>
          <button
            onClick={() => setSelectedStrategy('hybrid')}
            className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 ${
              selectedStrategy === 'hybrid'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center mb-2">
              <Layers className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="font-semibold text-gray-900 dark:text-white">Hybrid Strategy</span>
              {suggestedStrategy === 'hybrid' && (
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  AI Recommended
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-powered combination of avalanche and snowball. Targets high-impact debts that provide 
              maximum financial health improvement in the shortest time.
            </p>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label htmlFor="extraPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Extra Payment Amount:
          </label>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <input
              type="number"
              id="extraPayment"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Math.max(0, parseFloat(e.target.value) || 0))}
              className="ml-1 w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              step="10"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Max recommended: {formatCurrency(Math.max(0, availableForDebt), currency)}
          </span>
        </div>
      </div>

      {/* Payment Suggestions */}
      {paymentSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Payment Suggestions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered recommendations based on your financial situation</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {paymentSuggestions.map((suggestion) => (
              <div key={suggestion.id} className={`p-4 ${suggestion.completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        suggestion.urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        suggestion.urgency === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                        suggestion.urgency === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {suggestion.priority}
                      </span>
                      <div>
                        <h4 className={`font-medium ${suggestion.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {suggestion.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-bold ${suggestion.completed ? 'text-gray-500' : 'text-blue-600'}`}>
                      {formatCurrency(suggestion.amount, currency)}
                    </span>
                    <button
                      onClick={() => markSuggestionComplete(suggestion.id)}
                      disabled={suggestion.completed}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        suggestion.completed
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedStrategy === 'avalanche' ? 'Debt Avalanche' : 
             selectedStrategy === 'snowball' ? 'Debt Snowball' : 'Hybrid Debt Strategy'} Plan
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {recommendations.map((rec, index) => {
            // Handle account debt recommendations
            if (rec.reason.includes('Account debt')) {
              const account = bankAccounts.find(a => a.id === rec.loanId);
              if (!account) return null;
              
              const negativeBalance = Math.abs(Math.min(0, account.balance));
              const overdraftUsed = account.overdraftUsed || 0;
              const totalDebt = negativeBalance + overdraftUsed;
              
              return (
                <div key={rec.loanId} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                          index === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {rec.priority}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.loanName}</h4>
                        {index === 0 && (
                          <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                            Focus Here
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebt, currency)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">High priority debt</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggested Payment</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(rec.suggestedPayment, currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payoff Time</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rec.payoffMonths === 999 ? '999+' : rec.payoffMonths} months
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {rec.payoffMonths === 999 ? 'Payment too low' : `${Math.floor(rec.payoffMonths / 12)} years ${rec.payoffMonths % 12} months`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Fees</p>
                      <p className="text-lg font-semibold text-orange-600">{formatCurrency(rec.totalInterest, currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totalDebt + rec.totalInterest, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Handle regular loan recommendations
            const loan = loans.find(l => l.id === rec.loanId);
            if (!loan) return null;

            const payoffMonths = calculatePayoffTime(loan.currentBalance, rec.suggestedPayment, loan.interestRate);
            const totalInterest = calculateTotalInterest(loan.currentBalance, rec.suggestedPayment, loan.interestRate);
            
            return (
              <div key={rec.loanId} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                        index === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {rec.priority}
                      </span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.loanName}</h4>
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                          Focus Here
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{formatCurrency(loan.currentBalance, currency)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{loan.interestRate}% APR</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggested Payment</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(rec.suggestedPayment, currency)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.suggestedPayment > loan.minimumPayment && 
                        `+${formatCurrency(rec.suggestedPayment - loan.minimumPayment, currency)} extra`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payoff Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {payoffMonths === 999 ? '999+' : payoffMonths} months
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payoffMonths === 999 ? 'Payment too low' : `${Math.floor(payoffMonths / 12)} years ${payoffMonths % 12} months`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interest</p>
                    <p className="text-lg font-semibold text-orange-600">{formatCurrency(totalInterest, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(loan.currentBalance + totalInterest, currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Your Debt-Free Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-green-100">Total Debt</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalDebt, currency)}
            </p>
          </div>
          <div>
            <p className="text-green-100">Monthly Payment</p>
            <p className="text-2xl font-bold">
              {formatCurrency(minimumPayments + extraPayment, currency)}
            </p>
          </div>
          <div>
            <p className="text-green-100">Strategy</p>
            <p className="text-2xl font-bold capitalize">
              {selectedStrategy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtRecommendations;