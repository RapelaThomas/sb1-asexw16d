import React, { useState } from 'react';
import { Calendar, TrendingUp, Target, CheckCircle, AlertTriangle, Clock, ArrowRight, BarChart3 } from 'lucide-react';
import { FinancialGoal, Currency } from '../types';
import { formatCurrency, formatDate } from '../utils/advancedCalculations';

interface GoalForecastingViewProps {
  goals: FinancialGoal[];
  currency: Currency;
  onUpdateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
}

const GoalForecastingView: React.FC<GoalForecastingViewProps> = ({
  goals,
  currency,
  onUpdateGoal
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'contribution' | 'target'>('contribution');

  const handleApplyAdjustment = () => {
    if (!selectedGoal || !adjustmentAmount) return;
    
    const goal = goals.find(g => g.id === selectedGoal);
    if (!goal) return;
    
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount)) return;
    
    if (adjustmentType === 'contribution') {
      onUpdateGoal(selectedGoal, { currentAmount: goal.currentAmount + amount });
    } else {
      onUpdateGoal(selectedGoal, { targetAmount: amount });
    }
    
    setAdjustmentAmount('');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-blue-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goal Forecasting</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Predict when you'll reach your financial goals</p>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
          const forecast = goal.forecast;
          
          return (
            <div 
              key={goal.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${
                selectedGoal === goal.id ? 'border-blue-500 dark:border-blue-700 ring-2 ring-blue-500/50' : ''
              }`}
              onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {goal.category === 'emergency' ? '🛡️' :
                     goal.category === 'investment' ? '📈' :
                     goal.category === 'purchase' ? '🏠' :
                     goal.category === 'vacation' ? '✈️' : '🎯'}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.priority === 'high' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300' :
                  goal.priority === 'medium' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {goal.priority}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(goal.currentAmount, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(goal.targetAmount, currency)}</p>
                  </div>
                </div>
                
                {forecast && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Projected Completion
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(forecast.projectedCompletionDate)}
                      </span>
                      <span className={`text-sm font-medium ${getProbabilityColor(forecast.probabilityOfSuccess)}`}>
                        {forecast.probabilityOfSuccess}% probability
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Goal Forecast */}
      {selectedGoal && (() => {
        const goal = goals.find(g => g.id === selectedGoal);
        if (!goal || !goal.forecast) return null;
        
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detailed Forecast: {goal.name}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forecast Details */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Forecast Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Target Amount</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Current Progress</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {formatCurrency(goal.currentAmount, currency)} ({((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Monthly Contribution Needed</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {formatCurrency(goal.forecast.monthlyContributionNeeded, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Projected Completion Date</span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {formatDate(goal.forecast.projectedCompletionDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Success Probability</span>
                        <span className={`font-medium ${getProbabilityColor(goal.forecast.probabilityOfSuccess)}`}>
                          {goal.forecast.probabilityOfSuccess}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {goal.forecast.milestones.map((milestone, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            milestone.achieved 
                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              {milestone.achieved ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Target className="h-5 w-5 text-gray-500" />
                              )}
                              <span className={`font-medium ${
                                milestone.achieved 
                                  ? 'text-green-800 dark:text-green-300' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {milestone.percentage}% Complete
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(milestone.amount, currency)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {milestone.achieved 
                                ? `Achieved on ${formatDate(milestone.achievedDate || '')}` 
                                : `Estimated: ${formatDate(milestone.estimatedDate)}`
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Recommendations and Adjustments */}
                <div className="space-y-6">
                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
                    <div className="space-y-3">
                      {goal.forecast.recommendedAdjustments.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Make Adjustments */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Make Adjustments</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Adjustment Type
                        </label>
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="contribution"
                              checked={adjustmentType === 'contribution'}
                              onChange={() => setAdjustmentType('contribution')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor="contribution" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Add Contribution
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="target"
                              checked={adjustmentType === 'target'}
                              onChange={() => setAdjustmentType('target')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor="target" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Adjust Target
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="adjustmentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {adjustmentType === 'contribution' ? 'Contribution Amount' : 'New Target Amount'}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            id="adjustmentAmount"
                            value={adjustmentAmount}
                            onChange={(e) => setAdjustmentAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={handleApplyAdjustment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center">
                          <InfoIcon className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800 dark:text-blue-300">Adjustment Impact</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          {adjustmentType === 'contribution' 
                            ? 'Adding contributions will accelerate your progress and improve success probability.'
                            : 'Adjusting your target amount will change the timeline and required monthly contributions.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* What-If Scenarios */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">What-If Scenarios</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-indigo-200 dark:border-indigo-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          If you increase monthly contribution by 20%
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Complete 2 months earlier
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-indigo-200 dark:border-indigo-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          If you reduce target by 10%
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Complete 3 months earlier
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-indigo-200 dark:border-indigo-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          If market returns increase by 2%
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Complete 1 month earlier
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Forecasting Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forecasting Insights</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Consistency is Key</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Regular contributions, even small ones, significantly improve your chances of reaching goals on time.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Prioritize High-Impact Goals</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Focus on goals with the highest priority and impact on your overall financial health.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Adjust as Needed</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Regularly review and adjust your goals based on changing financial circumstances and priorities.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800 dark:text-yellow-300">Important Note</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Forecasts are based on current savings rates and financial behavior. Changes in income, expenses, or market conditions will affect these projections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for the info icon
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default GoalForecastingView;