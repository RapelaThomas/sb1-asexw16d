import React, { useState } from 'react';
import { Settings, DollarSign, Target, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { UserPreferences, AutoAllocation as AutoAllocationData, FinancialHealth, Currency, BankAccount } from '../types';
import { formatCurrency, calculateNetWorth } from '../utils/calculations';

interface AutoAllocationProps {
  preferences: UserPreferences;
  allocation: AutoAllocationData;
  financialHealth: FinancialHealth;
  currency: Currency;
  bankAccounts?: BankAccount[];
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

const AutoAllocation: React.FC<AutoAllocationProps> = ({ 
  preferences, 
  allocation, 
  financialHealth,
  currency,
  bankAccounts = [],
  onUpdatePreferences 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState(preferences);

  // Calculate net worth using the enhanced calculation
  const netWorth = calculateNetWorth(bankAccounts, [], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(formData);
    setShowSettings(false);
  };

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getHealthIcon = (level: string) => {
    switch (level) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Allocation</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">AI-powered income allocation based on your financial health</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </button>
      </div>

      {/* Financial Health Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(financialHealth.level)}`}>
              {financialHealth.level.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
              <span className="text-2xl font-bold text-blue-600">{financialHealth.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${getHealthScoreColor(financialHealth.score)} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${financialHealth.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income Ratio</span>
              <span className="text-sm font-medium">{financialHealth.debtToIncomeRatio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Emergency Fund Ratio</span>
              <span className="text-sm font-medium">{(financialHealth.emergencyFundRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
              <span className="text-sm font-medium">{financialHealth.savingsRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Net Worth</span>
              <span className={`text-sm font-medium ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netWorth, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Settings */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocation Preferences</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Financial Strategy
                </label>
                <select
                  id="strategy"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="debt-focused">Debt-Focused (70% to debt)</option>
                  <option value="balanced">Balanced Approach</option>
                  <option value="savings-focused">Savings-Focused</option>
                </select>
              </div>
              <div>
                <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Tolerance
                </label>
                <select
                  id="riskTolerance"
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyFundMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Fund Target (months)
                </label>
                <input
                  type="number"
                  id="emergencyFundMonths"
                  value={formData.emergencyFundMonths}
                  onChange={(e) => setFormData({ ...formData, emergencyFundMonths: parseInt(e.target.value) || 6 })}
                  min="3"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Reminder Time
                </label>
                <input
                  type="time"
                  id="reminderTime"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoAllocate"
                checked={formData.autoAllocate}
                onChange={(e) => setFormData({ ...formData, autoAllocate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="autoAllocate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable automatic allocation recommendations
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocation Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Monthly Allocation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Based on your {preferences.strategy.replace('-', ' ')} strategy and {financialHealth.level} financial health
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Debt Payment</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(allocation.debtPayment, currency)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emergency Fund</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(allocation.emergencyFund, currency)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Investments</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(allocation.investments, currency)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(allocation.needs, currency)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wants</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(allocation.wants, currency)}</p>
            </div>
          </div>
          
          {/* Account Debt Payment Section */}
          {allocation.detailedBreakdown?.accountDebtPayment && allocation.detailedBreakdown.accountDebtPayment > 0 && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-800 dark:text-orange-300">Account Debt Payment</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(allocation.detailedBreakdown.accountDebtPayment, currency)}
                </span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                This amount is included in your debt payment allocation to cover negative balances and overdraft usage.
              </p>
            </div>
          )}
          
          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">AI Recommendations:</h4>
            {allocation.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">{recommendation}</p>
              </div>
            ))}
          </div>
          
          {/* Financial Health Recommendations */}
          {financialHealth.recommendations.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Health Improvement Tips:</h4>
              {financialHealth.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoAllocation;