import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, Edit2, Eye, EyeOff, Building2, CheckCircle, AlertTriangle } from 'lucide-react';
import { BankAccount, Currency } from '../types';
import { formatCurrency, calculateNetWorth } from '../utils/calculations';

interface BankAccountManagerProps {
  bankAccounts: BankAccount[];
  currency: Currency;
  onAddBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  onUpdateBankAccount: (accountId: string, updates: Partial<BankAccount>) => void;
  onDeleteBankAccount: (accountId: string) => void;
}

const BankAccountManager: React.FC<BankAccountManagerProps> = ({
  bankAccounts,
  currency,
  onAddBankAccount,
  onUpdateBankAccount,
  onDeleteBankAccount
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true); // Default to showing balances
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as const,
    balance: '',
    isActive: true,
    hasOverdraft: false,
    overdraftLimit: '',
    overdraftUsed: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      const accountData = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        isActive: formData.isActive,
        hasOverdraft: formData.hasOverdraft,
        overdraftLimit: formData.hasOverdraft ? parseFloat(formData.overdraftLimit) || 0 : undefined,
        overdraftUsed: formData.hasOverdraft ? parseFloat(formData.overdraftUsed) || 0 : undefined
      };

      if (editingAccount) {
        onUpdateBankAccount(editingAccount, accountData);
        setEditingAccount(null);
      } else {
        onAddBankAccount(accountData);
      }
      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        isActive: true,
        hasOverdraft: false,
        overdraftLimit: '',
        overdraftUsed: ''
      });
      setShowForm(false);
    }
  };

  const startEdit = (account: BankAccount) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      isActive: account.isActive,
      hasOverdraft: account.hasOverdraft || false,
      overdraftLimit: account.overdraftLimit?.toString() || '',
      overdraftUsed: account.overdraftUsed?.toString() || ''
    });
    setEditingAccount(account.id);
    setShowForm(true);
  };

  const markAllAccountsActive = () => {
    bankAccounts.forEach(account => {
      if (!account.isActive) {
        onUpdateBankAccount(account.id, { isActive: true });
      }
    });
  };

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: '🏦' },
    { value: 'savings', label: 'Savings Account', icon: '💰' },
    { value: 'credit', label: 'Credit Card', icon: '💳' },
    { value: 'investment', label: 'Investment Account', icon: '📈' },
    { value: 'cash', label: 'Cash/Wallet', icon: '💵' }
  ];

  const getAccountTypeIcon = (type: string) => {
    return accountTypes.find(t => t.value === type)?.icon || '🏦';
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'savings': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'credit': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'investment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cash': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate total positive balance (assets)
  const totalPositiveBalance = bankAccounts
    .filter(account => account.isActive && account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0);

  // Calculate total negative balance (liabilities)
  const totalNegativeBalance = bankAccounts
    .filter(account => account.isActive && account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  // Calculate total credit card debt
  const totalCredit = bankAccounts
    .filter(account => account.isActive && account.type === 'credit' && account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  // Calculate total overdraft used
  const totalOverdraftUsed = bankAccounts
    .filter(account => account.isActive && account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0)
    .reduce((sum, account) => sum + (account.overdraftUsed || 0), 0);

  // Calculate total overdraft available
  const totalOverdraftAvailable = bankAccounts
    .filter(account => account.isActive && account.hasOverdraft)
    .reduce((sum, account) => sum + (account.overdraftLimit || 0), 0);

  const inactiveAccountsCount = bankAccounts.filter(account => !account.isActive).length;

  // Net worth calculation using the consistent method
  const netWorth = calculateNetWorth(bankAccounts, [], []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Accounts</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your financial accounts and track balances</p>
        </div>
        <div className="flex items-center space-x-3">
          {inactiveAccountsCount > 0 && (
            <button
              onClick={markAllAccountsActive}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Active ({inactiveAccountsCount})
            </button>
          )}
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalances ? 'Hide' : 'Show'} Balances
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAccount(null);
              setFormData({
                name: '',
                type: 'checking',
                balance: '',
                isActive: true,
                hasOverdraft: false,
                overdraftLimit: '',
                overdraftUsed: ''
              });
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bankAccounts.filter(a => a.isActive).length}</p>
            </div>
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Worth</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showBalances ? formatCurrency(netWorth, currency) : '••••••'}
              </p>
            </div>
            <CreditCard className={`h-8 w-8 ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-600">
                {showBalances ? formatCurrency(totalNegativeBalance, currency) : '••••••'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {showBalances ? `Credit: ${formatCurrency(totalCredit, currency)}` : '••••••'}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdraft Used</p>
              <p className="text-2xl font-bold text-orange-600">
                {showBalances ? formatCurrency(totalOverdraftUsed, currency) : '••••••'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {showBalances ? `Available: ${formatCurrency(totalOverdraftAvailable, currency)}` : '••••••'}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Add/Edit Account Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chase Checking, Wells Fargo Savings"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Balance
                </label>
                <input
                  type="number"
                  id="balance"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Can be negative to represent debt or liability
                </p>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active account
                </label>
              </div>
            </div>

            {/* Overdraft Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasOverdraft"
                  checked={formData.hasOverdraft}
                  onChange={(e) => setFormData({ ...formData, hasOverdraft: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="hasOverdraft" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  This account has overdraft facility
                </label>
              </div>

              {formData.hasOverdraft && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                  <div>
                    <label htmlFor="overdraftLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Overdraft Limit
                    </label>
                    <input
                      type="number"
                      id="overdraftLimit"
                      value={formData.overdraftLimit}
                      onChange={(e) => setFormData({ ...formData, overdraftLimit: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required={formData.hasOverdraft}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum amount you can overdraw from this account
                    </p>
                  </div>
                  <div>
                    <label htmlFor="overdraftUsed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Overdraft Used
                    </label>
                    <input
                      type="number"
                      id="overdraftUsed"
                      value={formData.overdraftUsed}
                      onChange={(e) => setFormData({ ...formData, overdraftUsed: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={formData.overdraftLimit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Amount of overdraft currently used
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAccount(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No bank accounts added yet</p>
          </div>
        ) : (
          bankAccounts.map((account) => {
            const isNegativeBalance = account.balance < 0;
            const overdraftInfo = account.hasOverdraft && account.overdraftLimit && account.overdraftLimit > 0;
            const isUsingOverdraft = account.hasOverdraft && account.overdraftUsed && account.overdraftUsed > 0;
            
            return (
              <div key={account.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${
                !account.isActive ? 'opacity-60 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getAccountTypeIcon(account.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                          {accountTypes.find(t => t.value === account.type)?.label}
                        </span>
                        {!account.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            Inactive
                          </span>
                        )}
                        {isNegativeBalance && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Negative Balance
                          </span>
                        )}
                        {overdraftInfo && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                            Overdraft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                      <p className={`text-xl font-bold ${
                        isNegativeBalance ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {showBalances ? formatCurrency(account.balance, currency) : '••••••'}
                      </p>
                      
                      {/* Overdraft Information */}
                      {overdraftInfo && (
                        <div className="mt-1 text-xs">
                          {showBalances && isUsingOverdraft && (
                            <p className="text-orange-600 dark:text-orange-400">
                              Overdraft: {formatCurrency(account.overdraftUsed || 0, currency)}
                            </p>
                          )}
                          {showBalances && (
                            <p className="text-gray-500 dark:text-gray-400">
                              Limit: {formatCurrency(account.overdraftLimit || 0, currency)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(account)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBankAccount(account.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default BankAccountManager;