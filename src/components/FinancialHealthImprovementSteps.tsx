import React, { useState } from 'react';
import { Target, CheckCircle, Clock, ArrowUp, AlertTriangle, Zap, Award, Shield } from 'lucide-react';
import { HealthImprovementStep, EmergencyPreparedness, Currency } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface FinancialHealthImprovementStepsProps {
  improvementSteps: HealthImprovementStep[];
  emergencyPreparedness: EmergencyPreparedness;
  currency: Currency;
  onCompleteStep: (stepId: string) => void;
}

const FinancialHealthImprovementSteps: React.FC<FinancialHealthImprovementStepsProps> = ({
  improvementSteps,
  emergencyPreparedness,
  currency,
  onCompleteStep
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Steps', icon: Target },
    { value: 'emergency', label: 'Emergency Fund', icon: Shield },
    { value: 'debt', label: 'Debt Reduction', icon: Zap },
    { value: 'savings', label: 'Savings', icon: Award },
    { value: 'income', label: 'Income', icon: ArrowUp },
    { value: 'expenses', label: 'Expenses', icon: AlertTriangle }
  ];

  const filteredSteps = activeCategory === 'all' 
    ? improvementSteps 
    : improvementSteps.filter(step => step.category === activeCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.icon : Target;
  };

  const getEmergencyLevelColor = (level: string) => {
    switch (level) {
      case 'well-prepared': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'prepared': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'basic': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'unprepared': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Health Improvement</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Actionable steps to improve your financial health</p>
        </div>
      </div>

      {/* Emergency Preparedness Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Preparedness</h3>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEmergencyLevelColor(emergencyPreparedness.level)}`}>
              {emergencyPreparedness.level.toUpperCase().replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{emergencyPreparedness.score}/100</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${emergencyPreparedness.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{emergencyPreparedness.emergencyFundMonths.toFixed(1)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Months of Expenses</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{formatCurrency(emergencyPreparedness.liquidAssets, currency)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Liquid Assets</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">{emergencyPreparedness.debtToIncomeRatio.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Recommendations:</h4>
          {emergencyPreparedness.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Improvement Action Plan</h3>
        </div>
        <div className="p-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <CategoryIcon className="h-4 w-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
          
          {/* Steps List */}
          <div className="space-y-4">
            {filteredSteps.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No improvement steps in this category</p>
              </div>
            ) : (
              filteredSteps.map((step) => {
                const StepIcon = getCategoryIcon(step.category);
                
                return (
                  <div 
                    key={step.id} 
                    className={`border rounded-lg p-4 ${
                      step.completed 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          step.completed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {step.completed ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className={`font-medium ${
                            step.completed 
                              ? 'text-green-800 dark:text-green-300 line-through' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            step.completed 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {step.description}
                          </p>
                          <div className="flex flex-wrap items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(step.impact)}`}>
                              {step.impact.toUpperCase()} IMPACT
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                              {step.difficulty.toUpperCase()} DIFFICULTY
                            </span>
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.estimatedTimeframe}
                            </span>
                            <span className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              +{step.potentialScoreIncrease} points
                            </span>
                          </div>
                        </div>
                      </div>
                      {!step.completed && (
                        <button
                          onClick={() => onCompleteStep(step.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Steps</p>
            <p className="text-2xl font-bold text-blue-600">{improvementSteps.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {improvementSteps.filter(step => step.completed).length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">
              {improvementSteps.filter(step => !step.completed).length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Potential Score Increase</p>
            <p className="text-2xl font-bold text-purple-600">
              +{improvementSteps.filter(step => !step.completed).reduce((sum, step) => sum + step.potentialScoreIncrease, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthImprovementSteps;