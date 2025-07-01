import React, { useState, useEffect } from 'react';
import { Plus, Repeat, Calendar, TrendingUp, TrendingDown, FileText, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { RecurringTransaction, Currency, BankAccount } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface RecurringTransactionsProps {
  recurringTransactions: RecurringTransaction[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'lastGenerated'>) => void;
  onUpdateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  onDeleteRecurringTransaction: (id: string) => void;
  onGenerateTransactions: () => void;
}

const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  recurringTransactions,
  bankAccounts,
  currency,
  onAddRecurringTransaction,
  onUpdateRecurringTransaction,
  onDeleteRecurringTransaction,
  onGenerateTransactions
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'income' as const,
    name: '',
    amount: '',
    frequency: 'monthly' as const,
    nextOccurrence: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    category: '',
    isActive: true,
    autoGenerate: true
  });

  const activeAccounts = bankAccounts.filter(account => account.isActive);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.amount && formData.bankAccountId) {
      const transactionData = {
        type: formData.type,
        name: formData.name,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        nextOccurrence: formData.nextOccurrence,
        bankAccountId: formData.bankAccountId,
        category: formData.category || undefined,
        isActive: formData.isActive,
        autoGenerate: formData.autoGenerate
      };

      if (editingTransaction) {
        onUpdateRecurringTransaction(editingTransaction, transactionData);
        setEditingTransaction(null);
      } else {
        onAddRecurringTransaction(transactionData);
      }

      setFormData({
        type: 'income',
        name: '',
        amount: '',
        frequency: 'monthly',
        nextOccurrence: new Date().toISOString().split('T')[0],
        bankAccountId: '',
        category: '',
        isActive: true,
        autoGenerate: true
      });
      setShowForm(false);
    }
  };

  const startEdit = (transaction: RecurringTransaction) => {
    setFormData({
      type: transaction.type,
      name: transaction.name,
      amount: transaction.amount.toString(),
      frequency: transaction.frequency,
      nextOccurrence: transaction.nextOccurrence,
      bankAccountId: transaction.bankAccountId,
      category: transaction.category || '',
      isActive: transaction.isActive,
      autoGenerate: transaction.autoGenerate
    });
    setEditingTransaction(transaction.id);
    setShowForm(true);
  };

  const getBankAccountName = (bankAccountId: string) => {
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    return account ? account.name : 'Unknown Account';
  };

  const getBankAccountIcon = (bankAccountId: string) => {
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
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const categories = [
    { value: 'need', label: 'Need' },
    { value: 'want', label: 'Want' },
    { value: 'utility', label: 'Utility' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];

  // Group transactions by type
  const incomeTransactions = recurringTransactions.filter(t => t.type === 'income');
  const expenseTransactions = recurringTransactions.filter(t => t.type === 'expense');
  const billTransactions = recurringTransactions.filter(t => t.type === 'bill');

  // Calculate totals
  const monthlyIncome = incomeTransactions.reduce((sum, t) => {
    if (!t.isActive) return sum;
    
    switch (t.frequency) {
      case 'weekly': return sum + (t.amount * 4.33);
      case 'biweekly': return sum + (t.amount * 2.17);
      case 'monthly': return sum + t.amount;
      case 'yearly': return sum + (t.amount / 12);
      default: return sum;
    }
  }, 0);

  const monthlyExpenses = [...expenseTransactions, ...billTransactions].reduce((sum, t) => {
    if (!t.isActive) return sum;
    
    switch (t.frequency) {
      case 'weekly': return sum + (t.amount * 4.33);
      case 'biweekly': return sum + (t.amount * 2.17);
      case 'monthly': return sum + t.amount;
      case 'yearly': return sum + (t.amount / 12);
      default: return sum;
    }
  }, 0);

  // Check for upcoming transactions
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTransactions = recurringTransactions.filter(t => {
    if (!t.isActive) return false;
    const nextDate = new Date(t.nextOccurrence);
    return nextDate >= today && nextDate <= nextWeek;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Automate your regular income and expenses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onGenerateTransactions}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Repeat className="h-4 w-4 mr-2" />
            Generate Transactions
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome, currency)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses, currency)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Monthly</p>
              <p className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyIncome - monthlyExpenses, currency)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Upcoming Transactions Alert */}
      {upcomingTransactions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800 dark:text-blue-300">Upcoming Transactions</span>
          </div>
          <p className="text-blue-700 dark:text-blue-400 mt-1">
            You have {upcomingTransactions.length} transactions scheduled in the next 7 days.
          </p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcomingTransactions.slice(0, 3).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.name}</span>
                <span className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Salary, Rent, Netflix"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="bill">Bill</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
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
              <div>
                <label htmlFor="nextOccurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Occurrence *
                </label>
                <input
                  type="date"
                  id="nextOccurrence"
                  value={formData.nextOccurrence}
                  onChange={(e) => setFormData({ ...formData, nextOccurrence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bankAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formData.type === 'income' ? 'Deposit To' : 'Pay From'} *
                </label>
                <select
                  id="bankAccountId"
                  value={formData.bankAccountId}
                  onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Account</option>
                  {activeAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {getBankAccountIcon(account.id)} {account.name}
                    </option>
                  ))}
                </select>
              </div>
              {(formData.type === 'expense' || formData.type === 'bill') && (
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoGenerate"
                  checked={formData.autoGenerate}
                  onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="autoGenerate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Auto-generate transactions
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recurring Transactions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recurring Income</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {incomeTransactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recurring income set up yet</p>
              </div>
            ) : (
              incomeTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium text-gray-900 dark:text-white ${!transaction.isActive ? 'line-through opacity-60' : ''}`}>
                          {transaction.name}
                        </h4>
                        {!transaction.isActive && (
                          <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(transaction.amount, currency)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.frequency}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Next: {new Date(transaction.nextOccurrence).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getBankAccountIcon(transaction.bankAccountId)} To: {getBankAccountName(transaction.bankAccountId)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecurringTransaction(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense & Bill Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recurring Expenses & Bills</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {expenseTransactions.length === 0 && billTransactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recurring expenses or bills set up yet</p>
              </div>
            ) : (
              [...expenseTransactions, ...billTransactions].map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium text-gray-900 dark:text-white ${!transaction.isActive ? 'line-through opacity-60' : ''}`}>
                          {transaction.name}
                        </h4>
                        {transaction.type === 'bill' && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">
                            Bill
                          </span>
                        )}
                        {!transaction.isActive && (
                          <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(transaction.amount, currency)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.frequency}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Next: {new Date(transaction.nextOccurrence).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getBankAccountIcon(transaction.bankAccountId)} From: {getBankAccountName(transaction.bankAccountId)}
                        {transaction.category && ` • Category: ${transaction.category}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecurringTransaction(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automation Settings</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Automation Active
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-generate transactions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically create transactions based on recurring patterns
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Send reminders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified before recurring transactions are due
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-adjust for holidays</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically adjust dates for weekends and holidays
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800 dark:text-blue-300">Automation Tips</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400 list-disc list-inside">
            <li>Set up recurring transactions for all regular income and expenses</li>
            <li>Review and adjust your recurring transactions monthly</li>
            <li>Keep your bank account balances updated for accurate automation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactions;