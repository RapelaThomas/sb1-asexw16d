import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Trash2, Edit2 } from 'lucide-react';
import { FinancialGoal, Currency } from '../types';
import { formatCurrency, formatDate, calculateGoalProgress } from '../utils/calculations';

interface GoalManagerProps {
  goals: FinancialGoal[];
  currency: Currency;
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ 
  goals, 
  currency,
  onAddGoal, 
  onUpdateGoal,
  onDeleteGoal 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'other' as const,
    priority: 'medium' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.targetAmount && formData.targetDate) {
      if (editingGoal) {
        onUpdateGoal(editingGoal, {
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount) || 0,
          targetDate: formData.targetDate,
          category: formData.category,
          priority: formData.priority
        });
        setEditingGoal(null);
      } else {
        onAddGoal({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount) || 0,
          targetDate: formData.targetDate,
          category: formData.category,
          priority: formData.priority
        });
      }
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: 'other',
        priority: 'medium'
      });
      setShowForm(false);
    }
  };

  const startEdit = (goal: FinancialGoal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority
    });
    setEditingGoal(goal.id);
    setShowForm(true);
  };

  const categories = [
    { value: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
    { value: 'investment', label: 'Investment', icon: '📈' },
    { value: 'purchase', label: 'Major Purchase', icon: '🏠' },
    { value: 'vacation', label: 'Vacation', icon: '✈️' },
    { value: 'other', label: 'Other', icon: '🎯' }
  ];

  const priorities = [
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' }
  ];

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🎯';
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
          <p className="text-gray-600 mt-1">Set and track your financial targets</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingGoal(null);
            setFormData({
              name: '',
              targetAmount: '',
              currentAmount: '',
              targetDate: '',
              category: 'other',
              priority: 'medium'
            });
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Goals</p>
          <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Target Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0), currency)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Current Progress</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0), currency)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-purple-600">
            {goals.length > 0 
              ? Math.round((goals.reduce((sum, goal) => sum + goal.currentAmount, 0) / 
                  goals.reduce((sum, goal) => sum + goal.targetAmount, 0)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Add/Edit Goal Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, New Car"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount *
                </label>
                <input
                  type="number"
                  id="targetAmount"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount
                </label>
                <input
                  type="number"
                  id="currentAmount"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  id="targetDate"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No goals set yet. Start by adding your first financial goal!</p>
          </div>
        ) : (
          goals
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .map((goal) => {
              const progress = calculateGoalProgress(goal);
              
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{goal.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority} priority
                          </span>
                          <span className="text-sm text-gray-500">
                            Due: {formatDate(goal.targetDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(progress.progressPercentage || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Goal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Amount</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(goal.currentAmount, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Target Amount</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(goal.targetAmount, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(goal.targetAmount - goal.currentAmount, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Required</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {formatCurrency(progress.monthlyRequired || 0, currency)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Time Remaining */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {progress.monthsRemaining || 0} months remaining
                        {(progress.monthsRemaining || 0) <= 3 && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Due Soon
                          </span>
                        )}
                      </span>
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

export default GoalManager;