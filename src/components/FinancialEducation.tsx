import React, { useState } from 'react';
import { Book, Bookmark, CheckCircle, ChevronRight, Clock, Award, Brain, Zap, ArrowRight, Search } from 'lucide-react';
import { FinancialEducation as FinancialEducationItem } from '../types';

interface FinancialEducationProps {
  educationItems: FinancialEducationItem[];
  onCompleteEducation: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}

const FinancialEducation: React.FC<FinancialEducationProps> = ({
  educationItems,
  onCompleteEducation,
  onUpdateProgress
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'budgeting', label: 'Budgeting' },
    { value: 'investing', label: 'Investing' },
    { value: 'debt', label: 'Debt Management' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit' },
    { value: 'taxes', label: 'Taxes' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const filteredItems = educationItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keyTakeaways.some(takeaway => takeaway.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return '💰';
      case 'investing': return '📈';
      case 'debt': return '⚡';
      case 'savings': return '🏦';
      case 'credit': return '💳';
      case 'taxes': return '📝';
      default: return '📊';
    }
  };

  const handleMarkComplete = (id: string) => {
    onCompleteEducation(id);
    setActiveItem(null);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    onUpdateProgress(id, progress);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Education</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Personalized learning to improve your financial knowledge</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Education Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <Book className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Modules</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-[600px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No education modules found</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    activeItem === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getCategoryIcon(item.category)}</span>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                        </span>
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.estimatedTime} min
                        </span>
                        {item.completed && (
                          <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                      activeItem === item.id ? 'transform rotate-90' : ''
                    }`} />
                  </div>
                  
                  {/* Progress Bar */}
                  {!item.completed && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Education Content */}
        <div className="lg:col-span-2">
          {activeItem ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {(() => {
                const item = educationItems.find(i => i.id === activeItem);
                if (!item) return null;
                
                return (
                  <>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                          </span>
                          <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.estimatedTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300">{item.content}</p>
                        
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-6 flex items-center">
                          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                          Key Takeaways
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {item.keyTakeaways.map((takeaway, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-6 flex items-center">
                          <Brain className="h-5 w-5 text-blue-500 mr-2" />
                          Action Items
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {item.actionItems.map((action, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRight className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Progress Controls */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                        {!item.completed ? (
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <span>Your Progress</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleUpdateProgress(item.id, Math.min(100, item.progress + 25))}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                              >
                                Update Progress
                              </button>
                              <button
                                onClick={() => handleMarkComplete(item.id)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                              >
                                Mark as Complete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
                            <Award className="h-6 w-6 text-green-600 mr-3" />
                            <div>
                              <h4 className="font-medium text-green-800 dark:text-green-300">Module Completed!</h4>
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Great job! You've completed this learning module.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Learning Module</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a module from the list to start learning and improving your financial knowledge.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Learning Progress</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {educationItems.filter(item => item.completed).length}/{educationItems.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-green-600">
                {educationItems.filter(item => !item.completed && item.progress > 0).length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</p>
              <p className="text-2xl font-bold text-purple-600">
                {educationItems.filter(item => !item.completed && item.progress === 0).length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(
                  (educationItems.reduce((sum, item) => sum + (item.completed ? 100 : item.progress), 0) / 
                  (educationItems.length * 100)) * 100
                )}%
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Recommended Next Steps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {educationItems
                .filter(item => !item.completed)
                .sort((a, b) => {
                  // Prioritize in-progress items, then by difficulty
                  if (a.progress > 0 && b.progress === 0) return -1;
                  if (a.progress === 0 && b.progress > 0) return 1;
                  
                  const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
                  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                })
                .slice(0, 2)
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveItem(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                          </span>
                          <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.estimatedTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.progress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialEducation;