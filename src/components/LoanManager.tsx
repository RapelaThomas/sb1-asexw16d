import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, AlertCircle, Calendar, Edit2 } from 'lucide-react';
import { Loan, Currency } from '../types';
import { formatCurrency, formatDate, calculateTotalDebt, calculateInterestPerMonth } from '../utils/calculations';

interface LoanManagerProps {
  loans: Loan[];
  currency: Currency;
  onAddLoan: (loan: Omit<Loan, 'id'>) => void;
  onUpdateLoan: (loanId: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (loanId: string) => void;
}

const LoanManager: React.FC<LoanManagerProps> = ({ 
  loans, 
  currency,
  onAddLoan, 
  onUpdateLoan,
  onDeleteLoan 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    startDate: new Date().toISOString().split('T')[0],
    loanPeriodMonths: '12',
    penaltyRate: '',
    otherCharges: '',
    lender: ''
  });

  const totalDebt = calculateTotalDebt(loans);
  const totalMinimumPayments = loans.reduce((sum, loan) => sum + loan.minimumPayment, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.currentBalance && formData.interestRate) {
      const loanData = {
        name: formData.name,
        principal: parseFloat(formData.principal) || parseFloat(formData.currentBalance),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        minimumPayment: parseFloat(formData.minimumPayment) || 0,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        loanPeriodMonths: parseInt(formData.loanPeriodMonths) || 12,
        penaltyRate: formData.penaltyRate ? parseFloat(formData.penaltyRate) : undefined,
        otherCharges: formData.otherCharges ? parseFloat(formData.otherCharges) : undefined,
        lender: formData.lender
      };

      if (editingLoan) {
        onUpdateLoan(editingLoan, loanData);
        setEditingLoan(null);
      } else {
        onAddLoan(loanData);
      }

      setFormData({
        name: '',
        principal: '',
        currentBalance: '',
        interestRate: '',
        minimumPayment: '',
        dueDate: '',
        startDate: new Date().toISOString().split('T')[0],
        loanPeriodMonths: '12',
        penaltyRate: '',
        otherCharges: '',
        lender: ''
      });
      setShowForm(false);
    }
  };

  const startEdit = (loan: Loan) => {
    setFormData({
      name: loan.name,
      principal: loan.principal.toString(),
      currentBalance: loan.currentBalance.toString(),
      interestRate: loan.interestRate.toString(),
      minimumPayment: loan.minimumPayment.toString(),
      dueDate: loan.dueDate,
      startDate: loan.startDate,
      loanPeriodMonths: loan.loanPeriodMonths.toString(),
      penaltyRate: loan.penaltyRate?.toString() || '',
      otherCharges: loan.otherCharges?.toString() || '',
      lender: loan.lender
    });
    setEditingLoan(loan.id);
    setShowForm(true);
  };

  const getUrgencyColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue <= 7) return 'text-red-600 bg-red-50';
    if (daysUntilDue <= 14) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loan Manager</h2>
          <p className="text-gray-600 mt-1">Track all your debts and loans</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingLoan(null);
            setFormData({
              name: '',
              principal: '',
              currentBalance: '',
              interestRate: '',
              minimumPayment: '',
              dueDate: '',
              startDate: new Date().toISOString().split('T')[0],
              loanPeriodMonths: '12',
              penaltyRate: '',
              otherCharges: '',
              lender: ''
            });
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </button>
      </div>

      {/* Debt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Debt</p>
              <p className="text-3xl font-bold">{formatCurrency(totalDebt, currency)}</p>
            </div>
            <CreditCard className="h-12 w-12 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Monthly Minimums</p>
              <p className="text-3xl font-bold">{formatCurrency(totalMinimumPayments, currency)}</p>
            </div>
            <Calendar className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Add/Edit Loan Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingLoan ? 'Edit Loan' : 'Add New Loan'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Credit Card, Personal Loan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="lender" className="block text-sm font-medium text-gray-700 mb-1">
                  Lender
                </label>
                <input
                  type="text"
                  id="lender"
                  value={formData.lender}
                  onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                  placeholder="e.g., Chase Bank, Wells Fargo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
                  Original Principal
                </label>
                <input
                  type="number"
                  id="principal"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance *
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
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
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Interest Rate (%) *
                </label>
                <input
                  type="number"
                  id="interestRate"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Payment
                </label>
                <input
                  type="number"
                  id="minimumPayment"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="loanPeriodMonths" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Period (months)
                </label>
                <input
                  type="number"
                  id="loanPeriodMonths"
                  value={formData.loanPeriodMonths}
                  onChange={(e) => setFormData({ ...formData, loanPeriodMonths: e.target.value })}
                  placeholder="12"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="penaltyRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Penalty Rate (%)
                </label>
                <input
                  type="number"
                  id="penaltyRate"
                  value={formData.penaltyRate}
                  onChange={(e) => setFormData({ ...formData, penaltyRate: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="otherCharges" className="block text-sm font-medium text-gray-700 mb-1">
                  Other Monthly Charges
                </label>
                <input
                  type="number"
                  id="otherCharges"
                  value={formData.otherCharges}
                  onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingLoan ? 'Update Loan' : 'Add Loan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLoan(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loans List */}
      <div className="space-y-4">
        {loans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No loans added yet</p>
          </div>
        ) : (
          loans.map((loan) => {
            const monthlyInterest = calculateInterestPerMonth(loan);
            const urgencyColor = getUrgencyColor(loan.dueDate);
            
            return (
              <div key={loan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{loan.name}</h3>
                    {loan.lender && (
                      <p className="text-gray-600">{loan.lender}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {loan.dueDate && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                        Due {formatDate(loan.dueDate)}
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(loan)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLoan(loan.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(loan.currentBalance, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Minimum Payment</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.minimumPayment, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Interest</p>
                    <p className="text-lg font-semibold text-orange-600">{formatCurrency(monthlyInterest, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Period</p>
                    <p className="text-lg font-semibold text-gray-900">{loan.loanPeriodMonths} months</p>
                  </div>
                </div>

                {(loan.penaltyRate || loan.otherCharges) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">Additional Charges</span>
                    </div>
                    <div className="mt-2 text-sm text-yellow-700">
                      {loan.penaltyRate && (
                        <span>Penalty Rate: {loan.penaltyRate}% | </span>
                      )}
                      {loan.otherCharges && (
                        <span>Other Charges: {formatCurrency(loan.otherCharges, currency)}/month</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LoanManager;