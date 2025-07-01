import React, { useState } from 'react';
import { Plus, FileText, Trash2, Check, Calendar, AlertTriangle } from 'lucide-react';
import { Bill, BankAccount } from '../types';
import { formatCurrency, formatDate, getUpcomingBills } from '../utils/calculations';

interface BillTrackerProps {
  bills: Bill[];
  bankAccounts: BankAccount[];
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
  onDeleteBill: (billId: string) => void;
  onUpdateBillPayment: (billId: string, isPaid: boolean) => void;
}

const BillTracker: React.FC<BillTrackerProps> = ({ 
  bills, 
  bankAccounts,
  onAddBill, 
  onDeleteBill,
  onUpdateBillPayment
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly' as const,
    category: 'utility' as const,
    isPaid: false,
    bankAccountId: ''
  });

  const upcomingBills = getUpcomingBills(bills);
  const paidBills = bills.filter(bill => bill.isPaid);
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const activeAccounts = bankAccounts.filter(account => account.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.amount && formData.dueDate) {
      onAddBill({
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        frequency: formData.frequency,
        category: formData.category,
        isPaid: formData.isPaid,
        bankAccountId: formData.bankAccountId || undefined
      });
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly',
        category: 'utility',
        isPaid: false,
        bankAccountId: ''
      });
      setShowForm(false);
    }
  };

  const categories = [
    { value: 'utility', label: 'Utility' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'utility': return 'bg-blue-100 text-blue-800';
      case 'subscription': return 'bg-purple-100 text-purple-800';
      case 'insurance': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return { color: 'text-red-600', label: 'Overdue', priority: 1 };
    if (daysUntilDue <= 3) return { color: 'text-red-600', label: 'Urgent', priority: 2 };
    if (daysUntilDue <= 7) return { color: 'text-orange-600', label: 'Due Soon', priority: 3 };
    return { color: 'text-gray-600', label: 'On Track', priority: 4 };
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bill Tracker</h2>
          <p className="text-gray-600 mt-1">Keep track of all your recurring bills and payment sources</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </button>
      </div>

      {/* Bills Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">{paidBills.length}</p>
            </div>
            <Check className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-orange-600">{upcomingBills.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Add Bill Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Bill</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electric Bill, Netflix"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bankAccountId" className="block text-sm font-medium text-gray-700 mb-1">
                  Pay From
                </label>
                <select
                  id="bankAccountId"
                  value={formData.bankAccountId}
                  onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                Mark as paid
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Add Bill
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        {bills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bills added yet</p>
          </div>
        ) : (
          bills
            .sort((a, b) => {
              if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
              const urgencyA = getUrgencyLevel(a.dueDate);
              const urgencyB = getUrgencyLevel(b.dueDate);
              return urgencyA.priority - urgencyB.priority;
            })
            .map((bill) => {
              const urgency = getUrgencyLevel(bill.dueDate);
              
              return (
                <div key={bill.id} className={`bg-white rounded-lg shadow-sm border p-4 ${
                  bill.isPaid ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-lg font-semibold ${
                          bill.isPaid ? 'text-green-700 line-through' : 'text-gray-900'
                        }`}>
                          {bill.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bill.category)}`}>
                          {bill.category}
                        </span>
                        {!bill.isPaid && (
                          <span className={`text-sm font-medium ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`text-lg font-bold ${
                          bill.isPaid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(bill.amount)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Due: {formatDate(bill.dueDate)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {bill.frequency}
                        </span>
                        {bill.bankAccountId && (
                          <span className="text-sm text-gray-500">
                            {getBankAccountIcon(bill.bankAccountId)} from {getBankAccountName(bill.bankAccountId)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateBillPayment(bill.id, !bill.isPaid)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          bill.isPaid
                            ? 'text-green-600 bg-green-100 hover:bg-green-200'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default BillTracker;