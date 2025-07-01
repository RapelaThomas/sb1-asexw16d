import React, { useState } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, DollarSign, Target, Clock } from 'lucide-react';
import { DailyEntry, BankAccount, Currency } from '../types';
import { formatCurrency, calculateDailyAverage } from '../utils/calculations';

interface DailyTrackerProps {
  dailyEntries: DailyEntry[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddEntry: (entry: Omit<DailyEntry, 'id'>) => void;
  onUpdateEntry: (entryId: string, updates: Partial<DailyEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ 
  dailyEntries, 
  bankAccounts,
  currency,
  onAddEntry, 
  onUpdateEntry,
  onDeleteEntry 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    income: '',
    expenses: '',
    category: 'need' as const,
    description: '',
    frequency: 'once' as const,
    incomeBankAccountId: '',
    expenseBankAccountId: ''
  });

  const { income: avgIncome, expenses: avgExpenses } = calculateDailyAverage(dailyEntries, 30);
  const availableDaily = avgIncome - avgExpenses;
  const todayEntry = dailyEntries.find(entry => entry.date === formData.date);
  const recentEntries = dailyEntries.slice(-10).reverse();
  const activeAccounts = bankAccounts.filter(account => account.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.income || formData.expenses) {
      onAddEntry({
        date: formData.date,
        time: formData.time,
        income: parseFloat(formData.income) || 0,
        expenses: parseFloat(formData.expenses) || 0,
        category: formData.category,
        description: formData.description,
        frequency: formData.frequency,
        incomeBankAccountId: formData.incomeBankAccountId || undefined,
        expenseBankAccountId: formData.expenseBankAccountId || undefined
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        income: '',
        expenses: '',
        category: 'need',
        description: '',
        frequency: 'once',
        incomeBankAccountId: '',
        expenseBankAccountId: ''
      });
      setShowForm(false);
    }
  };

  const getBankAccountName = (bankAccountId?: string) => {
    if (!bankAccountId) return 'Not specified';
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    return account ? account.name : 'Unknown Account';
  };

  const getBankAccountIcon = (bankAccountId?: string) => {
    if (!bankAccountId) return '';
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    if (!account) return '🏦';
    
    switch (account.type) {
      case 'checking': return '🏦';
      case 'savings': return '💰';
      case 'credit': return '💳';
      case 'investment': return '📈';
      case 'cash': return '💵';
      default: return '🏦';
    }
  };

  const frequencies = [
    { value: 'once', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Daily Tracker</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Track your daily income and expenses with account details</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Daily Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Avg Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(avgIncome, currency)}</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Avg Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(avgExpenses, currency)}</p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Net</p>
              <p className={`text-xl sm:text-2xl font-bold ${availableDaily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(availableDaily, currency)}
              </p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Daily Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Freelance payment, Groceries"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Income
                </label>
                <input
                  type="number"
                  id="income"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={formData.incomeBankAccountId}
                  onChange={(e) => setFormData({ ...formData, incomeBankAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Select income account</option>
                  {activeAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {getBankAccountIcon(account.id)} {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expenses
                </label>
                <input
                  type="number"
                  id="expenses"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={formData.expenseBankAccountId}
                  onChange={(e) => setFormData({ ...formData, expenseBankAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Select expense account</option>
                  {activeAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {getBankAccountIcon(account.id)} {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expense Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="need">Need</option>
                <option value="want">Want</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Add Entry
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Entries</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {recentEntries.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No entries yet. Start tracking your daily finances!</p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.time && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {entry.time}
                        </div>
                      )}
                      {entry.description && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{entry.description}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.category === 'need' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      }`}>
                        {entry.category}
                      </span>
                      {entry.frequency && entry.frequency !== 'once' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {entry.frequency}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                      {entry.income > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            +{formatCurrency(entry.income, currency)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getBankAccountIcon(entry.incomeBankAccountId)} → {getBankAccountName(entry.incomeBankAccountId)}
                          </span>
                        </div>
                      )}
                      {entry.expenses > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(entry.expenses, currency)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            from {getBankAccountIcon(entry.expenseBankAccountId)} {getBankAccountName(entry.expenseBankAccountId)}
                          </span>
                        </div>
                      )}
                      <span className={`text-sm font-medium ${
                        entry.income - entry.expenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        Net: {formatCurrency(entry.income - entry.expenses, currency)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 self-end sm:self-center"
                  >
                    <Target className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;