import React, { useState } from 'react';
import { Plus, Briefcase, TrendingUp, DollarSign, Target, Calculator, ArrowRight, Settings, Brain, Trash2 } from 'lucide-react';
import { BusinessEntry, BankAccount, FinancialGoal, Currency, BusinessBudgetItem, UserPreferences } from '../types';
import { formatCurrency } from '../utils/calculations';

interface BusinessManagerProps {
  businessEntries: BusinessEntry[];
  bankAccounts: BankAccount[];
  goals: FinancialGoal[];
  currency: Currency;
  preferences: UserPreferences;
  onAddBusinessEntry: (entry: Omit<BusinessEntry, 'id'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
}

const BusinessManager: React.FC<BusinessManagerProps> = ({
  businessEntries,
  bankAccounts,
  goals,
  currency,
  preferences,
  onAddBusinessEntry,
  onUpdateGoal
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BusinessBudgetItem[]>([
    { id: '1', name: 'Marketing', percentage: 10, amount: 0, priority: 'high', isAutoAllocated: false },
    { id: '2', name: 'Operations', percentage: 15, amount: 0, priority: 'high', isAutoAllocated: false },
    { id: '3', name: 'Emergency Fund', percentage: 5, amount: 0, priority: 'medium', isAutoAllocated: false },
  ]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sales: '',
    stockValue: '',
    description: '',
    profitAccountId: '',
    profitToGoalPercentage: '10',
    selectedGoalId: ''
  });

  // Filter accounts properly - only active accounts
  const activeAccounts = bankAccounts.filter(account => account.isActive === true);
  const businessAccounts = activeAccounts; // All active accounts can be used for business
  const availableGoals = goals.filter(goal => goal.priority === 'high' || goal.priority === 'medium');

  // Calculate business metrics
  const totalSales = businessEntries.reduce((sum, entry) => sum + entry.sales, 0);
  const totalStockValue = businessEntries.reduce((sum, entry) => sum + entry.stockValue, 0);
  const totalProfit = businessEntries.reduce((sum, entry) => sum + entry.profit, 0);
  const totalProfitToGoals = businessEntries.reduce((sum, entry) => sum + entry.profitToGoal, 0);
  const totalBudgetAllocated = businessEntries.reduce((sum, entry) => 
    sum + (entry.budgetItems?.reduce((itemSum, item) => itemSum + item.amount, 0) || 0), 0);

  const recentEntries = businessEntries.slice(-5).reverse();

  // Auto-allocate budget based on financial health and preferences
  const autoAllocateBudget = (salesAmount: number) => {
    const totalPercentage = budgetItems.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage > 100) {
      alert('Total budget allocation cannot exceed 100%');
      return;
    }

    // AI-based allocation considering financial health and strategy
    const isDebtFocused = preferences.strategy === 'debt-focused';
    const isSavingsFocused = preferences.strategy === 'savings-focused';
    
    const updatedItems = budgetItems.map(item => {
      let adjustedPercentage = item.percentage;
      
      // Adjust based on strategy and priority
      if (isDebtFocused && item.name.toLowerCase().includes('emergency')) {
        adjustedPercentage = Math.max(2, item.percentage * 0.7); // Reduce emergency fund allocation
      } else if (isSavingsFocused && item.priority === 'high') {
        adjustedPercentage = Math.min(25, item.percentage * 1.2); // Increase high priority allocations
      }
      
      return {
        ...item,
        percentage: adjustedPercentage,
        amount: (salesAmount * adjustedPercentage) / 100,
        isAutoAllocated: true
      };
    });
    
    setBudgetItems(updatedItems);
  };

  const addBudgetItem = () => {
    const newItem: BusinessBudgetItem = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
      amount: 0,
      priority: 'medium',
      isAutoAllocated: false
    };
    setBudgetItems([...budgetItems, newItem]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BusinessBudgetItem>) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sales && formData.stockValue && formData.profitAccountId) {
      const sales = parseFloat(formData.sales);
      const stockValue = parseFloat(formData.stockValue);
      
      // Calculate total budget allocation
      const totalBudgetAmount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
      const adjustedSales = sales - totalBudgetAmount;
      
      const profit = adjustedSales - stockValue;
      const profitToGoalPercentage = parseFloat(formData.profitToGoalPercentage) / 100;
      const profitToGoal = profit * profitToGoalPercentage;

      onAddBusinessEntry({
        date: formData.date,
        sales,
        stockValue,
        profit,
        profitToGoal,
        profitToGoalPercentage,
        description: formData.description,
        profitAccountId: formData.profitAccountId,
        selectedGoalId: formData.selectedGoalId || undefined,
        budgetItems: budgetItems.filter(item => item.amount > 0)
      });

      // Update goal if selected
      if (formData.selectedGoalId && profitToGoal > 0) {
        const selectedGoal = goals.find(g => g.id === formData.selectedGoalId);
        if (selectedGoal) {
          onUpdateGoal(formData.selectedGoalId, {
            currentAmount: selectedGoal.currentAmount + profitToGoal
          });
        }
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        sales: '',
        stockValue: '',
        description: '',
        profitAccountId: '',
        profitToGoalPercentage: '10',
        selectedGoalId: ''
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

  const getGoalName = (goalId?: string) => {
    if (!goalId) return 'No goal selected';
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.name : 'Unknown Goal';
  };

  // Update budget item amounts when sales amount changes
  React.useEffect(() => {
    if (formData.sales) {
      const salesAmount = parseFloat(formData.sales);
      setBudgetItems(prev => prev.map(item => ({
        ...item,
        amount: (salesAmount * item.percentage) / 100
      })));
    }
  }, [formData.sales]);

  // Debug log to check accounts
  console.log('All bank accounts:', bankAccounts);
  console.log('Active accounts:', activeAccounts);
  console.log('Business accounts for selection:', businessAccounts);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Business Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Track sales, manage budgets, and allocate to goals</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setShowBudgetSettings(!showBudgetSettings)}
            className="inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Budget Settings
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Business Entry
          </button>
        </div>
      </div>

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-yellow-700">
            Total Bank Accounts: {bankAccounts.length} | 
            Active Accounts: {activeAccounts.length} | 
            Available for Business: {businessAccounts.length}
          </p>
          {activeAccounts.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              No active accounts found. Please ensure you have active bank accounts set up.
            </p>
          )}
        </div>
      )}

      {/* Advanced Budget Settings */}
      {showBudgetSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Budget Allocation</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => formData.sales && autoAllocateBudget(parseFloat(formData.sales))}
                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm"
              >
                <Brain className="h-4 w-4 mr-1" />
                AI Auto-Allocate
              </button>
              <button
                onClick={addBudgetItem}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {budgetItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget Item
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateBudgetItem(item.id, { name: e.target.value })}
                    placeholder="e.g., Marketing"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={item.percentage}
                    onChange={(e) => updateBudgetItem(item.id, { percentage: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(item.amount, currency)}
                    readOnly
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={item.priority}
                    onChange={(e) => updateBudgetItem(item.id, { priority: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.isAutoAllocated}
                      onChange={(e) => updateBudgetItem(item.id, { isAutoAllocated: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label className="ml-1 text-xs text-gray-700 dark:text-gray-300">
                      AI Managed
                    </label>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeBudgetItem(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Total Budget Allocation:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {budgetItems.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                </span>
              </div>
              {budgetItems.reduce((sum, item) => sum + item.percentage, 0) > 100 && (
                <p className="text-xs text-red-600 mt-1">
                  Warning: Total allocation exceeds 100%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(totalSales, currency)}</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stock Value</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(totalStockValue, currency)}</p>
            </div>
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalProfit, currency)}</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit to Goals</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatCurrency(totalProfitToGoals, currency)}</p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Allocated</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{formatCurrency(totalBudgetAllocated, currency)}</p>
            </div>
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Add Business Entry Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Business Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Daily sales, Product launch"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sales" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sales Amount *
                </label>
                <input
                  type="number"
                  id="sales"
                  value={formData.sales}
                  onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="stockValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock/Cost Value *
                </label>
                <input
                  type="number"
                  id="stockValue"
                  value={formData.stockValue}
                  onChange={(e) => setFormData({ ...formData, stockValue: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Budget Allocation Display */}
            {formData.sales && budgetItems.some(item => item.amount > 0) && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Budget Allocation Breakdown:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {budgetItems.filter(item => item.amount > 0).map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-indigo-700 dark:text-indigo-400">{item.name}:</span>
                      <span className="font-medium text-indigo-600">{formatCurrency(item.amount, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                  <div className="flex justify-between font-medium">
                    <span className="text-indigo-800 dark:text-indigo-300">Total Budget:</span>
                    <span className="text-indigo-600">{formatCurrency(budgetItems.reduce((sum, item) => sum + item.amount, 0), currency)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-indigo-800 dark:text-indigo-300">Available for Profit:</span>
                    <span className="text-indigo-600">
                      {formatCurrency(parseFloat(formData.sales) - budgetItems.reduce((sum, item) => sum + item.amount, 0), currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Profit Calculation Display */}
            {formData.sales && formData.stockValue && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">Calculated Profit:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      (parseFloat(formData.sales) - budgetItems.reduce((sum, item) => sum + item.amount, 0)) - parseFloat(formData.stockValue),
                      currency
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profitAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profit Account *
                </label>
                <select
                  id="profitAccountId"
                  value={formData.profitAccountId}
                  onChange={(e) => setFormData({ ...formData, profitAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Account</option>
                  {businessAccounts.length === 0 ? (
                    <option value="" disabled>No active accounts available</option>
                  ) : (
                    businessAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {getBankAccountIcon(account.id)} {account.name} ({account.type})
                      </option>
                    ))
                  )}
                </select>
                {businessAccounts.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please add and activate bank accounts first
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="profitToGoalPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profit to Goal (%)
                </label>
                <input
                  type="number"
                  id="profitToGoalPercentage"
                  value={formData.profitToGoalPercentage}
                  onChange={(e) => setFormData({ ...formData, profitToGoalPercentage: e.target.value })}
                  placeholder="10"
                  step="1"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="selectedGoalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Goal (Optional)
              </label>
              <select
                id="selectedGoalId"
                value={formData.selectedGoalId}
                onChange={(e) => setFormData({ ...formData, selectedGoalId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No specific goal</option>
                {availableGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} - {formatCurrency(goal.currentAmount, currency)}/{formatCurrency(goal.targetAmount, currency)}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal Allocation Display */}
            {formData.sales && formData.stockValue && formData.profitToGoalPercentage && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Amount to Goal:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(
                      ((parseFloat(formData.sales) - budgetItems.reduce((sum, item) => sum + item.amount, 0)) - parseFloat(formData.stockValue)) * 
                      (parseFloat(formData.profitToGoalPercentage) / 100),
                      currency
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={businessAccounts.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Recent Business Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Business Entries</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {recentEntries.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No business entries yet. Start tracking your business performance!</p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {entry.description && (
                          <span className="text-sm text-gray-600 dark:text-gray-300">{entry.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${entry.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Profit: {formatCurrency(entry.profit, currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Sales: </span>
                      <span className="font-medium text-blue-600">{formatCurrency(entry.sales, currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Stock: </span>
                      <span className="font-medium text-orange-600">{formatCurrency(entry.stockValue, currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Budget: </span>
                      <span className="font-medium text-indigo-600">
                        {formatCurrency(entry.budgetItems?.reduce((sum, item) => sum + item.amount, 0) || 0, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">To Goal: </span>
                      <span className="font-medium text-purple-600">{formatCurrency(entry.profitToGoal, currency)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {getBankAccountIcon(entry.profitAccountId)} → {getBankAccountName(entry.profitAccountId)}
                    </span>
                    {entry.selectedGoalId && (
                      <div className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>{getGoalName(entry.selectedGoalId)} ({entry.profitToGoalPercentage}%)</span>
                      </div>
                    )}
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

export default BusinessManager;