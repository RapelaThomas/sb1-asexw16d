import React, { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  Target,
  Calendar,
  Settings,
  Brain,
  Zap,
  Building2,
  LogOut,
  Menu,
  X,
  Briefcase,
  ArrowLeftRight,
  User,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Banknote,
  Shield,
  Clock,
  Repeat,
  Lightbulb,
  Sparkles,
  Tag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const RTMoneyMasterLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg`}>
    <div className="relative">
      <Banknote className="h-5 w-5 text-white" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  // Check if user is admin
  const ADMIN_EMAIL = 'rapelathomas@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSignOut = async () => {
    await signOut();
  };

  const navSections = [
    {
      id: 'main',
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trends', label: 'Trends', icon: BarChart3 },
        { id: 'accounts', label: 'Accounts', icon: Building2 },
        { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
      ]
    },
    {
      id: 'tracking',
      label: 'Tracking',
      items: [
        { id: 'daily', label: 'Daily Tracker', icon: Calendar },
        { id: 'recurring-transactions', label: 'Recurring', icon: Repeat },
        { id: 'cash-flow-calendar', label: 'Cash Flow Calendar', icon: Calendar },
        { id: 'business', label: 'Business', icon: Briefcase },
        { id: 'income', label: 'Income', icon: TrendingUp },
        { id: 'expenses', label: 'Expenses', icon: TrendingDown },
        { id: 'expected-payments', label: 'Expected Payments', icon: Clock },
      ]
    },
    {
      id: 'analysis',
      label: 'Analysis',
      items: [
        { id: 'spending-patterns', label: 'Spending Patterns', icon: BarChart3 },
        { id: 'budget-optimization', label: 'Budget Optimization', icon: Sparkles },
        { id: 'ai-categorization', label: 'AI Categorization', icon: Tag },
      ]
    },
    {
      id: 'debt',
      label: 'Debt & Bills',
      items: [
        { id: 'loans', label: 'Loans', icon: CreditCard },
        { id: 'bills', label: 'Bills', icon: FileText },
        { id: 'strategy', label: 'Debt Strategy', icon: Target },
        { id: 'bill-negotiation', label: 'Bill Negotiation', icon: Lightbulb },
      ]
    },
    {
      id: 'planning',
      label: 'Planning',
      items: [
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'goal-forecasting', label: 'Goal Forecasting', icon: TrendingUp },
        { id: 'allocation', label: 'Auto Allocation', icon: Zap },
        { id: 'recommendations', label: 'AI Insights', icon: Brain },
        { id: 'health-improvement', label: 'Health Improvement', icon: Zap },
      ]
    }
  ];

  const handleNavClick = (itemId: string) => {
    onViewChange(itemId);
    setIsMobileMenuOpen(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <RTMoneyMasterLogo className="h-10 w-10 mr-3" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  RT MoneyMaster
                </h1>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Smart Financial Management</span>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:hidden">
                RT MoneyMaster
              </h1>
            </div>
            
            {/* Desktop Menu - Compact */}
            <div className="hidden xl:flex items-center space-x-1">
              {navSections.map((section) => (
                <div key={section.id} className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    {section.label}
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors duration-200 ${
                            currentView === item.id
                              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Desktop User Menu */}
              <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4 ml-4">
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`p-2 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentView === 'settings'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>

                {/* Admin Dashboard Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`p-2 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      currentView === 'admin'
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    title="Admin Dashboard"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden xl:block text-sm">{user?.email?.split('@')[0]}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        {user?.email}
                        {isAdmin && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Administrator</div>
                        )}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="xl:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                {navSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    >
                      <span>{section.label}</span>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.includes(section.id) && (
                      <div className="pl-4 space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                                currentView === item.id
                                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full flex items-center px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                      currentView === 'settings'
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className={`w-full flex items-center px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                        currentView === 'admin'
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Shield className="h-5 w-5 mr-3" />
                      Admin Dashboard
                    </button>
                  )}

                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {user?.email}
                    {isAdmin && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Administrator</div>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;