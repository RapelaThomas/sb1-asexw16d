import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, Trash2, Edit2, CheckCircle, AlertTriangle, Clock, User } from 'lucide-react';
import { ExpectedPayment, BankAccount, Currency } from '../types';
import { formatCurrency, formatDate, getUpcomingExpectedPayments, getOverdueExpectedPayments } from '../utils/calculations';

interface ExpectedPaymentManagerProps {
  expectedPayments: ExpectedPayment[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddExpectedPayment: (payment: Omit<ExpectedPayment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'overdueReminders'>) => void;
  onUpdateExpectedPayment: (paymentId: string, updates: Partial<ExpectedPayment>) => void;
  onMarkAsPaid: (paymentId: string, isPaid: boolean) => void;
  onDeleteExpectedPayment: (paymentId: string) => void;
}

const ExpectedPaymentManager: React.FC<ExpectedPaymentManagerProps> = ({
  expectedPayments,
  bankAccounts,
  currency,
  onAddExpectedPayment,
  onUpdateExpectedPayment,
  onMarkAsPaid,
  onDeleteExpectedPayment
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'income' as const,
    name: '',
    amount: '',
    expectedDate: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    personName: '',
    description: '',
    isPaid: false,
    paidDate: ''
  });

  const activeAccounts = bankAccounts.filter(account => account.isActive);
  const overduePayments = getOverdueExpectedPayments(expectedPayments);
  const upcomingPayments = getUpcomingExpectedPayments(expectedPayments, 14);
  const paidPayments = expectedPayments.filter(payment => payment.isPaid);
  
  // Calculate totals
  const totalExpectedIncome = expectedPayments
    .filter(payment => payment.type === 'income' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalExpectedExpenses = expectedPayments
    .filter(payment => payment.type === 'expense' && !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalOverdueIncome = overduePayments
    .filter(payment => payment.type === 'income')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalOverdueExpenses = overduePayments
    .filter(payment => payment.type === 'expense')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.amount && formData.expectedDate && formData.bankAccountId) {
      const paymentData = {
        type: formData.type,
        name: formData.name,
        amount: parseFloat(formData.amount),
        expectedDate: formData.expectedDate,
        bankAccountId: formData.bankAccountId,
        personName: formData.personName,
        description: formData.description,
        isPaid: formData.isPaid,
        paidDate: formData.isPaid ? (formData.paidDate || new Date().toISOString().split('T')[0]) : undefined
      };

      if (editingPayment) {
        onUpdateExpectedPayment(editingPayment, paymentData);
        setEditingPayment(null);
      } else {
        onAddExpectedPayment(paymentData);
      }

      setFormData({
        type: 'income',
        name: '',
        amount: '',
        expectedDate: new Date().toISOString().split('T')[0],
        bankAccountId: '',
        personName: '',
        description: '',
        isPaid: false,
        paidDate: ''
      });
      setShowForm(false);
    }
  };

  const startEdit = (payment: ExpectedPayment) => {
    setFormData({
      type: payment.type,
      name: payment.name,
      amount: payment.amount.toString(),
      expectedDate: payment.expectedDate,
      bankAccountId: payment.bankAccountId,
      personName: payment.personName || '',
      description: payment.description,
      isPaid: payment.isPaid,
      paidDate: payment.paidDate || ''
    });
    setEditingPayment(payment.id);
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

  const getUrgencyLevel = (expectedDate: string) => {
    const due = new Date(expectedDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return { color: 'text-red-600', label: 'Overdue', priority: 1 };
    if (daysUntilDue <= 3) return { color: 'text-red-600', label: 'Urgent', priority: 2 };
    if (daysUntilDue <= 7) return { color: 'text-orange-600', label: 'Due Soon', priority: 3 };
    return { color: 'text-gray-600', label: 'On Track', priority: 4 };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expected Payments</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track money you expect to receive or pay out</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expected Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalExpectedIncome, currency)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpectedExpenses, currency)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Income</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOverdueIncome, currency)}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Expenses</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOverdueExpenses, currency)}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingPayment ? 'Edit Expected Payment' : 'Add Expected Payment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Client Payment, Loan to Friend"
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="income">Income (Money Coming In)</option>
                  <option value="expense">Expense (Money Going Out)</option>
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
                <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Date *
                </label>
                <input
                  type="date"
                  id="expectedDate"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
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
            </div>

            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Person/Entity Name
              </label>
              <input
                type="text"
                id="personName"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                placeholder="e.g., John Doe, ABC Company"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.type === 'income' ? 'Who is paying you?' : 'Who are you paying?'}
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this payment"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Already paid/received
              </label>
            </div>

            {formData.isPaid && (
              <div>
                <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Paid/Received
                </label>
                <input
                  type="date"
                  id="paidDate"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingPayment ? 'Update Payment' : 'Add Payment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPayment(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Overdue Payments</h3>
            </div>
          </div>
          <div className="divide-y divide-red-200 dark:divide-red-800">
            {overduePayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{payment.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {payment.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        Overdue
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-lg font-bold ${
                        payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount, currency)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expected: {formatDate(payment.expectedDate)}
                      </span>
                      {payment.personName && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {payment.personName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{getBankAccountIcon(payment.bankAccountId)}</span>
                      <span className="ml-1">
                        {payment.type === 'income' ? 'To: ' : 'From: '}{getBankAccountName(payment.bankAccountId)}
                      </span>
                    </div>
                    {payment.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{payment.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onMarkAsPaid(payment.id, true)}
                      className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                      title="Mark as Paid"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => startEdit(payment)}
                      className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpectedPayment(payment.id)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Payments</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {upcomingPayments.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No upcoming expected payments</p>
            </div>
          ) : (
            upcomingPayments.map((payment) => {
              const urgency = getUrgencyLevel(payment.expectedDate);
              
              return (
                <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{payment.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {payment.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                        <span className={`text-sm font-medium ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-lg font-bold ${
                          payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount, currency)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Expected: {formatDate(payment.expectedDate)}
                        </span>
                        {payment.personName && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {payment.personName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{getBankAccountIcon(payment.bankAccountId)}</span>
                        <span className="ml-1">
                          {payment.type === 'income' ? 'To: ' : 'From: '}{getBankAccountName(payment.bankAccountId)}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{payment.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onMarkAsPaid(payment.id, true)}
                        className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                        title="Mark as Paid"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => startEdit(payment)}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpectedPayment(payment.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Paid/Received Payments */}
      {paidPayments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Payments</h3>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                {paidPayments.length} payments
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {paidPayments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white line-through">{payment.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {payment.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-lg font-bold text-gray-500 dark:text-gray-400 line-through">
                        {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount, currency)}
                      </span>
                      {payment.paidDate && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Paid: {formatDate(payment.paidDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onMarkAsPaid(payment.id, false)}
                      className="p-2 rounded-full text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                      title="Mark as Unpaid"
                    >
                      <Clock className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpectedPayment(payment.id)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {paidPayments.length > 5 && (
              <div className="px-6 py-3 text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Completed Payments ({paidPayments.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpectedPaymentManager;