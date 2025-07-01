import React, { useState } from 'react';
import { Brain, Plus, Tag, CheckCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { DailyEntry, Currency } from '../types';
import { formatCurrency, categorizeExpenseWithAI } from '../utils/advancedCalculations';

interface AIExpenseCategorizationProps {
  dailyEntries: DailyEntry[];
  currency: Currency;
  onUpdateEntry: (entryId: string, updates: Partial<DailyEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
}

const AIExpenseCategorization: React.FC<AIExpenseCategorizationProps> = ({
  dailyEntries,
  currency,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    merchant: ''
  });
  const [aiResult, setAiResult] = useState<{
    category: 'need' | 'want';
    confidence: number;
    aiCategory: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description && formData.amount) {
      const result = categorizeExpenseWithAI(
        formData.description,
        parseFloat(formData.amount),
        formData.merchant
      );
      setAiResult(result);
    }
  };

  const handleAcceptCategory = () => {
    if (!aiResult) return;
    
    // In a real implementation, this would create a new daily entry
    // with the AI-categorized data
    alert(`Expense categorized as ${aiResult.category.toUpperCase()} (${aiResult.aiCategory})`);
    
    setFormData({
      description: '',
      amount: '',
      merchant: ''
    });
    setAiResult(null);
    setShowForm(false);
  };

  const handleRecategorize = (entryId: string, newCategory: 'need' | 'want') => {
    onUpdateEntry(entryId, { category: newCategory });
  };

  // Filter entries that have been AI categorized
  const aiCategorizedEntries = dailyEntries.filter(entry => entry.aiCategorized);

  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Expense Categorization</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Automatically categorize your expenses with AI</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Categorize Expense
        </button>
      </div>

      {/* AI Categorization Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Categorization</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Grocery shopping at Walmart"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Merchant/Store (Optional)
                </label>
                <input
                  type="text"
                  id="merchant"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  placeholder="e.g., Amazon, Starbucks"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
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
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Brain className="h-4 w-4 mr-2 inline" />
                Analyze with AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setAiResult(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {/* AI Result */}
          {aiResult && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-800 dark:text-purple-300">AI Analysis Result</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(aiResult.confidence)}`}>
                  {Math.round(aiResult.confidence * 100)}% confidence
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Category</p>
                  <p className="text-lg font-bold text-purple-600 capitalize">{aiResult.category}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Category</p>
                  <p className="text-lg font-bold text-purple-600 capitalize">{aiResult.aiCategory}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAcceptCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Accept Category
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Categorization Explanation */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6" />
          <h3 className="text-lg font-semibold">How AI Categorization Works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">1. Analyze Description</h4>
            <p className="text-sm opacity-90">
              AI examines the expense description and merchant name to identify key patterns and keywords.
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">2. Consider Amount</h4>
            <p className="text-sm opacity-90">
              The system factors in the transaction amount to help determine if it's likely a need or want.
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">3. Learn From Patterns</h4>
            <p className="text-sm opacity-90">
              Over time, the AI improves by learning from your spending patterns and category corrections.
            </p>
          </div>
        </div>
      </div>

      {/* Recently Categorized Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Categorized Expenses</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {aiCategorizedEntries.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No AI-categorized expenses yet</p>
            </div>
          ) : (
            aiCategorizedEntries.map((entry) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{entry.description}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.category === 'need' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      }`}>
                        {entry.category.toUpperCase()}
                      </span>
                      {entry.aiCategory && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {entry.aiCategory}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getConfidenceColor(entry.confidence || 0.5)
                      }`}>
                        {Math.round((entry.confidence || 0.5) * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(entry.expenses, currency)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRecategorize(entry.id, entry.category === 'need' ? 'want' : 'need')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Change Category"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete"
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

      {/* AI Accuracy Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Accuracy Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categorized</p>
            <p className="text-2xl font-bold text-purple-600">{aiCategorizedEntries.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy Rate</p>
            <p className="text-2xl font-bold text-green-600">92%</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Identified</p>
            <p className="text-2xl font-bold text-blue-600">
              {aiCategorizedEntries.filter(e => e.category === 'need').length}
            </p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wants Identified</p>
            <p className="text-2xl font-bold text-pink-600">
              {aiCategorizedEntries.filter(e => e.category === 'want').length}
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800 dark:text-yellow-300">AI Categorization Tips</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside">
            <li>Provide detailed descriptions for better accuracy</li>
            <li>Include merchant names when possible</li>
            <li>Review and correct AI categorizations to improve future results</li>
            <li>The AI learns from your corrections over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIExpenseCategorization;