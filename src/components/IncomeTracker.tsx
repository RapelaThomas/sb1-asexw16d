import React, { useState } from 'react';
import { Plus, TrendingUp, Trash2, Building2, Edit2 } from 'lucide-react';
import { Income, BankAccount, Currency } from '../types';
import { formatCurrency, calculateTotalMonthlyIncome } from '../utils/calculations';

interface IncomeTrackerProps {
  incomes: Income[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddIncome: (income: Omit<Income, 'id' | 'monthlyAmount'>) => void;
  onUpdateIncome: (incomeId: string, updates: Partial<Income>) => void;
  onDeleteIncome: (incomeId: string) => void;
}

const IncomeTracker: React.FC<IncomeTrackerProps> = ({ 
  incomes, 
  bankAccounts,
  currency,
  onAddIncome, 
  onUpdateIncome,
  onDeleteIncome 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'monthly' as const,
    bankAccountId: ''
  });

  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomes);
  const activeAccounts = bankAccounts.filter(account => account.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.source && formData.amount && formData.bankAccountId) {
      const incomeData = {
        source: formData.source,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        bankAccountId: formData.bankAccountId
      };

      if (editingIncome) {
        onUpdateIncome(editingIncome, incomeData);
        setEditingIncome(null);
      } else {
        onAddIncome(incomeData);
      }

      setFormData({ source: '', amount: '', frequency: 'monthly', bankAccountId: '' });
      setShowForm(false);
    }
  };

  const startEdit = (income: Income) => {
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      frequency: income.frequency,
      bankAccountId: income.bankAccountId
    });
    setEditingIncome(income.id);
    setShowForm(true);
  };

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income Tracker</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track all your income sources and their destinations</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingIncome(null);
            setFormData({ source: '', amount: '', frequency: 'monthly', bankAccountId: '' });
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </button>
      </div>

      {/* Total Income Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Total Monthly Income</p>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthlyIncome, currency)}</p>
          </div>
          <TrendingUp className="h-12 w-12 text-green-200" />
        </div>
      </div>

      {/* Add/Edit Income Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingIncome ? 'Edit Income Source' : 'Add New Income Source'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Income Source *
              </label>
              <input
                type="text"
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Primary Job, Freelance, Side Business"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
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
                <label htmlFor="bankAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deposit To *
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
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingIncome ? 'Update Income' : 'Add Income'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingIncome(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income Sources</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {incomes.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No income sources added yet</p>
            </div>
          ) : (
            incomes.map((income) => (
              <div key={income.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{income.source}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(income.amount, currency)} {income.frequency}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(income.monthlyAmount, currency)}/month
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{getBankAccountIcon(income.bankAccountId)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          → {getBankAccountName(income.bankAccountId)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(income)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteIncome(income.id)}
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
  );
};

export default IncomeTracker;