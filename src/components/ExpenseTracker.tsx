import React, { useState } from 'react';
import { Plus, TrendingDown, Trash2, Tag, Edit2 } from 'lucide-react';
import { Expense, BankAccount, Currency } from '../types';
import { formatCurrency, calculateTotalMonthlyExpenses } from '../utils/calculations';

interface ExpenseTrackerProps {
  expenses: Expense[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddExpense: (expense: Omit<Expense, 'id' | 'monthlyAmount'>) => void;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ 
  expenses, 
  bankAccounts,
  currency,
  onAddExpense, 
  onUpdateExpense,
  onDeleteExpense 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'need' as const,
    frequency: 'monthly' as const,
    bankAccountId: ''
  });

  const needs = expenses.filter(e => e.category === 'need');
  const wants = expenses.filter(e => e.category === 'want');
  const totalNeeds = calculateTotalMonthlyExpenses(needs);
  const totalWants = calculateTotalMonthlyExpenses(wants);
  const totalExpenses = totalNeeds + totalWants;
  const activeAccounts = bankAccounts.filter(account => account.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.amount && formData.bankAccountId) {
      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        bankAccountId: formData.bankAccountId
      };

      if (editingExpense) {
        onUpdateExpense(editingExpense, expenseData);
        setEditingExpense(null);
      } else {
        onAddExpense(expenseData);
      }

      setFormData({ name: '', amount: '', category: 'need', frequency: 'monthly', bankAccountId: '' });
      setShowForm(false);
    }
  };

  const startEdit = (expense: Expense) => {
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      frequency: expense.frequency,
      bankAccountId: expense.bankAccountId
    });
    setEditingExpense(expense.id);
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

  const ExpenseCard: React.FC<{ 
    title: string; 
    expenses: Expense[]; 
    total: number; 
    color: string;
    bgColor: string;
  }> = ({ title, expenses, total, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`px-6 py-4 ${bgColor} border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
          <span className={`text-2xl font-bold ${color}`}>
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            No {title.toLowerCase()} added yet
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{expense.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(expense.amount, currency)} {expense.frequency}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(expense.monthlyAmount, currency)}/month
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{getBankAccountIcon(expense.bankAccountId)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        from {getBankAccountName(expense.bankAccountId)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(expense)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
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
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Categorize your expenses as needs or wants and track payment sources</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingExpense(null);
            setFormData({ name: '', amount: '', category: 'need', frequency: 'monthly', bankAccountId: '' });
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Total Monthly Expenses</p>
            <p className="text-3xl font-bold">{formatCurrency(totalExpenses, currency)}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-red-200">Needs: {formatCurrency(totalNeeds, currency)}</span>
              <span className="text-red-200">Wants: {formatCurrency(totalWants, currency)}</span>
            </div>
          </div>
          <TrendingDown className="h-12 w-12 text-red-200" />
        </div>
      </div>

      {/* Add/Edit Expense Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expense Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rent, Groceries, Entertainment"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
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
                  Pay From *
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
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingExpense(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseCard
          title="Needs"
          expenses={needs}
          total={totalNeeds}
          color="text-blue-700"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <ExpenseCard
          title="Wants"
          expenses={wants}
          total={totalWants}
          color="text-purple-700"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Spending Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalExpenses > 0 ? ((totalNeeds / totalExpenses) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Needs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalExpenses > 0 ? ((totalWants / totalExpenses) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Wants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {expenses.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;