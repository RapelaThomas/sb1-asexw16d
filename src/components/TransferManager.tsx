import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Building2, AlertTriangle, Trash2 } from 'lucide-react';
import { Transfer, BankAccount, Currency } from '../types';
import { formatCurrency } from '../utils/calculations';

interface TransferManagerProps {
  transfers: Transfer[];
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  onDeleteTransfer: (transferId: string) => void;
}

const TransferManager: React.FC<TransferManagerProps> = ({
  transfers,
  bankAccounts,
  currency,
  onAddTransfer,
  onDeleteTransfer
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    isLoan: false
  });

  const activeAccounts = bankAccounts.filter(account => account.isActive);
  const businessAccounts = activeAccounts.filter(account => 
    account.name.toLowerCase().includes('business') || 
    account.type === 'checking'
  );
  const recentTransfers = transfers.slice(-10).reverse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromAccountId && formData.toAccountId && formData.amount) {
      const fromAccount = bankAccounts.find(acc => acc.id === formData.fromAccountId);
      
      // Check if transfer would exceed overdraft limit
      if (fromAccount) {
        const transferAmount = parseFloat(formData.amount);
        const newBalance = fromAccount.balance - transferAmount;
        
        // If balance would go negative and account doesn't have overdraft
        if (newBalance < 0 && (!fromAccount.hasOverdraft || !fromAccount.overdraftLimit)) {
          alert(`Insufficient funds in ${fromAccount.name}. Transfer amount exceeds available balance.`);
          return;
        }
        
        // If account has overdraft but transfer would exceed limit
        if (newBalance < 0 && fromAccount.hasOverdraft && fromAccount.overdraftLimit) {
          const overdraftNeeded = Math.abs(newBalance);
          if (overdraftNeeded > fromAccount.overdraftLimit) {
            alert(`Transfer amount exceeds available balance and overdraft limit for ${fromAccount.name}.`);
            return;
          }
        }
      }
      
      const isFromBusiness = businessAccounts.some(acc => acc.id === formData.fromAccountId);
      
      onAddTransfer({
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        isLoan: isFromBusiness || formData.isLoan,
        date: new Date().toISOString().split('T')[0]
      });

      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
        isLoan: false
      });
      setShowForm(false);
    }
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

  const getAccountBalance = (bankAccountId: string): string => {
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    if (!account) return formatCurrency(0, currency);
    
    let balanceDisplay = formatCurrency(account.balance, currency);
    
    // Add overdraft info if applicable
    if (account.hasOverdraft && account.overdraftLimit) {
      const overdraftUsed = account.overdraftUsed || 0;
      const overdraftAvailable = account.overdraftLimit - overdraftUsed;
      
      if (overdraftUsed > 0) {
        balanceDisplay += ` (${formatCurrency(overdraftAvailable, currency)} overdraft available)`;
      } else {
        balanceDisplay += ` (+${formatCurrency(account.overdraftLimit, currency)} overdraft)`;
      }
    }
    
    return balanceDisplay;
  };

  const totalTransfers = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  const loanTransfers = transfers.filter(transfer => transfer.isLoan);
  const totalLoans = loanTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);

  const isFromBusiness = formData.fromAccountId && 
    businessAccounts.some(acc => acc.id === formData.fromAccountId);

  // Get selected accounts for validation
  const fromAccount = formData.fromAccountId ? bankAccounts.find(acc => acc.id === formData.fromAccountId) : null;
  const toAccount = formData.toAccountId ? bankAccounts.find(acc => acc.id === formData.toAccountId) : null;
  
  // Calculate maximum transfer amount based on balance and overdraft
  const getMaxTransferAmount = (): number => {
    if (!fromAccount) return 0;
    
    if (fromAccount.hasOverdraft && fromAccount.overdraftLimit) {
      // If account has overdraft, max transfer is balance + available overdraft
      const overdraftUsed = fromAccount.overdraftUsed || 0;
      const availableOverdraft = fromAccount.overdraftLimit - overdraftUsed;
      return fromAccount.balance + availableOverdraft;
    } else {
      // Without overdraft, max transfer is just the balance
      return Math.max(0, fromAccount.balance);
    }
  };
  
  const maxTransferAmount = getMaxTransferAmount();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Account Transfers</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Transfer money between accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </button>
      </div>

      {/* Transfer Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transfers</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(totalTransfers, currency)}</p>
            </div>
            <ArrowLeftRight className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Loans</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totalLoans, currency)}</p>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{transfers.length}</p>
            </div>
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Transfer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Account *
                </label>
                <select
                  id="fromAccountId"
                  value={formData.fromAccountId}
                  onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Source Account</option>
                  {activeAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {getBankAccountIcon(account.id)} {account.name} - {getAccountBalance(account.id)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Account *
                </label>
                <select
                  id="toAccountId"
                  value={formData.toAccountId}
                  onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Destination Account</option>
                  {activeAccounts
                    .filter(account => account.id !== formData.fromAccountId)
                    .map(account => (
                    <option key={account.id} value={account.id}>
                      {getBankAccountIcon(account.id)} {account.name} - {getAccountBalance(account.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  max={maxTransferAmount > 0 ? maxTransferAmount : undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                {fromAccount && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum transfer: {formatCurrency(maxTransferAmount, currency)}
                    {fromAccount.hasOverdraft && fromAccount.overdraftLimit ? 
                      ` (includes ${formatCurrency(fromAccount.overdraftLimit - (fromAccount.overdraftUsed || 0), currency)} available overdraft)` : 
                      ''}
                  </p>
                )}
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
                  placeholder="e.g., Emergency fund transfer"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Overdraft Warning */}
            {fromAccount && parseFloat(formData.amount) > fromAccount.balance && fromAccount.hasOverdraft && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-300">Overdraft Notice</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-400 mt-1 text-sm">
                  This transfer will use {formatCurrency(parseFloat(formData.amount) - fromAccount.balance, currency)} of your overdraft facility.
                </p>
              </div>
            )}

            {/* Negative Balance Warning */}
            {fromAccount && parseFloat(formData.amount) > fromAccount.balance && !fromAccount.hasOverdraft && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800 dark:text-red-300">Negative Balance Warning</span>
                </div>
                <p className="text-red-700 dark:text-red-400 mt-1 text-sm">
                  This transfer will result in a negative balance of {formatCurrency(fromAccount.balance - parseFloat(formData.amount), currency)} in your account.
                </p>
              </div>
            )}

            {/* Business Transfer Warning */}
            {isFromBusiness && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-300">Business Transfer Notice</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-400 mt-1 text-sm">
                  This transfer is from a business account and will be automatically marked as a loan.
                </p>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLoan"
                checked={formData.isLoan || isFromBusiness}
                onChange={(e) => setFormData({ ...formData, isLoan: e.target.checked })}
                disabled={isFromBusiness}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="isLoan" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Mark as loan {isFromBusiness && '(automatically applied for business transfers)'}
              </label>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Transfer Funds
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

      {/* Recent Transfers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transfers</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {recentTransfers.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center">
              <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transfers yet. Start moving money between accounts!</p>
            </div>
          ) : (
            recentTransfers.map((transfer) => (
              <div key={transfer.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(transfer.date).toLocaleDateString()}
                      </span>
                      {transfer.description && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{transfer.description}</span>
                      )}
                      {transfer.isLoan && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                          Loan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                      <button
                        onClick={() => onDeleteTransfer(transfer.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>{getBankAccountIcon(transfer.fromAccountId)}</span>
                      <span className="ml-1">{getBankAccountName(transfer.fromAccountId)}</span>
                    </div>
                    <ArrowLeftRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                    <span className="text-gray-400 sm:hidden">↓</span>
                    <div className="flex items-center">
                      <span>{getBankAccountIcon(transfer.toAccountId)}</span>
                      <span className="ml-1">{getBankAccountName(transfer.toAccountId)}</span>
                    </div>
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

export default TransferManager;