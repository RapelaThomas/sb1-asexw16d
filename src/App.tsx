import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BankAccountManager from './components/BankAccountManager';
import DailyTracker from './components/DailyTracker';
import BusinessManager from './components/BusinessManager';
import TransferManager from './components/TransferManager';
import IncomeTracker from './components/IncomeTracker';
import ExpenseTracker from './components/ExpenseTracker';
import LoanManager from './components/LoanManager';
import BillTracker from './components/BillTracker';
import GoalManager from './components/GoalManager';
import AutoAllocation from './components/AutoAllocation';
import SmartRecommendations from './components/SmartRecommendations';
import DebtRecommendations from './components/DebtRecommendations';
import FinancialTrendTracker from './components/FinancialTrendTracker';
import ExpectedPaymentManager from './components/ExpectedPaymentManager';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { useFinancialData } from './hooks/useFinancialData';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses,
  calculateFinancialHealth,
  calculateAutoAllocation,
  calculateNetWorth
} from './utils/calculations';

// New components
import CashFlowCalendar from './components/CashFlowCalendar';
import RecurringTransactions from './components/RecurringTransactions';
import SpendingPatternAnalysis from './components/SpendingPatternAnalysis';
import BillNegotiationAssistant from './components/BillNegotiationAssistant';
import FinancialHealthImprovementSteps from './components/FinancialHealthImprovementSteps';
import GoalForecastingView from './components/GoalForecastingView';
import AIExpenseCategorization from './components/AIExpenseCategorization';
import BudgetCategoryOptimization from './components/BudgetCategoryOptimization';
import CelebrationModal from './components/CelebrationModal';

// Advanced calculations
import {
  generateRecurringTransactions,
  generateGoalForecast,
  generateCashFlowCalendar,
  analyzeSpendingPatterns,
  generateHealthImprovementSteps,
  calculateEmergencyPreparedness,
  generateBillNegotiationOpportunities,
  generateCelebrations
} from './utils/advancedCalculations';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeCelebration, setActiveCelebration] = useState<any>(null);
  
  const {
    loading: dataLoading,
    bankAccounts,
    incomes,
    expenses,
    loans,
    bills,
    dailyEntries,
    businessEntries,
    transfers,
    goals,
    expectedPayments,
    preferences,
    challenges,
    userProgress,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addLoan,
    updateLoan,
    deleteLoan,
    addBill,
    updateBill,
    deleteBill,
    addDailyEntry,
    updateDailyEntry,
    deleteDailyEntry,
    addBusinessEntry,
    updateBusinessEntry,
    deleteBusinessEntry,
    addTransfer,
    deleteTransfer,
    addGoal,
    updateBillPayment,
    updateGoal,
    updatePreferences,
    deleteGoal,
    addExpectedPayment,
    updateExpectedPayment,
    markExpectedPaymentAsPaid,
    deleteExpectedPayment,
    completeChallenge
  } = useFinancialData();

  // Calculate financial health and auto allocation with bank accounts
  const financialHealth = useMemo(() => 
    calculateFinancialHealth(incomes, expenses, loans, dailyEntries, businessEntries, goals, bankAccounts, expectedPayments),
    [incomes, expenses, loans, dailyEntries, businessEntries, goals, bankAccounts, expectedPayments]
  );

  const autoAllocation = useMemo(() => {
    const monthlyIncome = calculateTotalMonthlyIncome(incomes);
    const monthlyExpenses = calculateTotalMonthlyExpenses(expenses);
    return calculateAutoAllocation(
      monthlyIncome,
      monthlyExpenses,
      loans,
      goals,
      businessEntries,
      preferences,
      financialHealth,
      bankAccounts
    );
  }, [incomes, expenses, loans, goals, businessEntries, preferences, financialHealth, bankAccounts]);

  // Generate advanced data
  const recurringTransactions = useMemo(() => 
    generateRecurringTransactions(incomes, expenses, bills),
    [incomes, expenses, bills]
  );

  const cashFlowEvents = useMemo(() => 
    generateCashFlowCalendar(incomes, expenses, bills, loans, expectedPayments, goals),
    [incomes, expenses, bills, loans, expectedPayments, goals]
  );

  const spendingPatterns = useMemo(() => 
    analyzeSpendingPatterns(expenses, dailyEntries),
    [expenses, dailyEntries]
  );

  const healthImprovementSteps = useMemo(() => 
    generateHealthImprovementSteps(financialHealth, incomes, expenses, loans, bankAccounts),
    [financialHealth, incomes, expenses, loans, bankAccounts]
  );

  const emergencyPreparedness = useMemo(() => 
    calculateEmergencyPreparedness(bankAccounts, incomes, expenses, loans),
    [bankAccounts, incomes, expenses, loans]
  );

  const billNegotiations = useMemo(() => 
    generateBillNegotiationOpportunities(bills, expenses),
    [bills, expenses]
  );

  // Enhanced goals with forecasting
  const enhancedGoals = useMemo(() => {
    const totalIncome = calculateTotalMonthlyIncome(incomes);
    const totalExpenses = calculateTotalMonthlyExpenses(expenses);
    const savingsRate = financialHealth.savingsRate;
    
    return goals.map(goal => ({
      ...goal,
      forecast: generateGoalForecast(goal, totalIncome, totalExpenses, savingsRate)
    }));
  }, [goals, incomes, expenses, financialHealth.savingsRate]);

  // Check for celebrations
  useEffect(() => {
    if (userProgress) {
      const celebrations = generateCelebrations(goals, userProgress, financialHealth, []);
      if (celebrations.length > 0) {
        setActiveCelebration(celebrations[0]);
      }
    }
  }, [goals, userProgress, financialHealth]);

  const handleAcknowledgeCelebration = (id: string) => {
    // In a real implementation, this would update the database
    setActiveCelebration(null);
  };

  // Generate recurring transactions
  const handleGenerateTransactions = () => {
    // In a real implementation, this would create actual transactions
    alert('Recurring transactions generated successfully!');
  };

  // Handle bill negotiation
  const handleMarkNegotiated = (billId: string, success: boolean, newAmount?: number) => {
    if (success && newAmount !== undefined) {
      updateBill(billId, { 
        amount: newAmount,
        lastNegotiated: new Date().toISOString().split('T')[0]
      });
    } else {
      updateBill(billId, { 
        lastNegotiated: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Handle health improvement step completion
  const handleCompleteHealthStep = (stepId: string) => {
    // In a real implementation, this would update the database
    alert(`Health improvement step ${stepId} completed!`);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <Auth />;
  }

  // Show loading screen while loading financial data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your financial data...</p>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          incomes={incomes} 
          expenses={expenses} 
          loans={loans} 
          bills={bills}
          businessEntries={businessEntries}
          goals={goals}
          currency={preferences.currency}
          bankAccounts={bankAccounts}
          challenges={challenges}
          userProgress={userProgress}
          expectedPayments={expectedPayments}
          onCompleteChallenge={completeChallenge}
          onMarkExpectedPaymentAsPaid={markExpectedPaymentAsPaid}
        />;
      case 'accounts':
        return <BankAccountManager 
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddBankAccount={addBankAccount}
          onUpdateBankAccount={updateBankAccount}
          onDeleteBankAccount={deleteBankAccount}
        />;
      case 'transfers':
        return <TransferManager 
          transfers={transfers}
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddTransfer={addTransfer}
          onDeleteTransfer={deleteTransfer}
        />;
      case 'daily':
        return <DailyTracker 
          dailyEntries={dailyEntries} 
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddEntry={addDailyEntry}
          onUpdateEntry={updateDailyEntry}
          onDeleteEntry={deleteDailyEntry}
        />;
      case 'business':
        return <BusinessManager 
          businessEntries={businessEntries}
          bankAccounts={bankAccounts}
          goals={goals}
          currency={preferences.currency}
          preferences={preferences}
          onAddBusinessEntry={addBusinessEntry}
          onUpdateBusinessEntry={updateBusinessEntry}
          onDeleteBusinessEntry={deleteBusinessEntry}
          onUpdateGoal={updateGoal}
        />;
      case 'income':
        return <IncomeTracker 
          incomes={incomes} 
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddIncome={addIncome}
          onUpdateIncome={updateIncome}
          onDeleteIncome={deleteIncome} 
        />;
      case 'expenses':
        return <ExpenseTracker 
          expenses={expenses} 
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddExpense={addExpense}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense} 
        />;
      case 'loans':
        return <LoanManager 
          loans={loans} 
          currency={preferences.currency}
          onAddLoan={addLoan}
          onUpdateLoan={updateLoan}
          onDeleteLoan={deleteLoan} 
        />;
      case 'bills':
        return <BillTracker 
          bills={bills} 
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddBill={addBill}
          onUpdateBill={updateBill}
          onDeleteBill={deleteBill}
          onUpdateBillPayment={updateBillPayment}
        />;
      case 'goals':
        return <GoalManager 
          goals={goals}
          currency={preferences.currency}
          onAddGoal={addGoal}
          onUpdateGoal={updateGoal}
          onDeleteGoal={deleteGoal}
        />;
      case 'expected-payments':
        return <ExpectedPaymentManager
          expectedPayments={expectedPayments}
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddExpectedPayment={addExpectedPayment}
          onUpdateExpectedPayment={updateExpectedPayment}
          onMarkAsPaid={markExpectedPaymentAsPaid}
          onDeleteExpectedPayment={deleteExpectedPayment}
        />;
      case 'allocation':
        return <AutoAllocation 
          preferences={preferences}
          allocation={autoAllocation}
          financialHealth={financialHealth}
          currency={preferences.currency}
          bankAccounts={bankAccounts}
          onUpdatePreferences={updatePreferences}
        />;
      case 'recommendations':
        return <SmartRecommendations 
          incomes={incomes}
          expenses={expenses}
          loans={loans}
          bills={bills}
          dailyEntries={dailyEntries}
          businessEntries={businessEntries}
          goals={goals}
          preferences={preferences}
          currency={preferences.currency}
          bankAccounts={bankAccounts}
          expectedPayments={expectedPayments}
        />;
      case 'strategy':
        return <DebtRecommendations 
          loans={loans} 
          incomes={incomes} 
          expenses={expenses}
          currency={preferences.currency}
          preferences={preferences}
          bankAccounts={bankAccounts}
          onUpdatePreferences={updatePreferences}
        />;
      case 'trends':
        return <FinancialTrendTracker 
          incomes={incomes}
          expenses={expenses}
          loans={loans}
          dailyEntries={dailyEntries}
          businessEntries={businessEntries}
          currency={preferences.currency}
          bankAccounts={bankAccounts}
          expectedPayments={expectedPayments}
        />;
      case 'settings':
        return <Settings 
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
        />;
      case 'admin':
        return <AdminDashboard />;
        
      // New views
      case 'recurring-transactions':
        return <RecurringTransactions
          recurringTransactions={recurringTransactions}
          bankAccounts={bankAccounts}
          currency={preferences.currency}
          onAddRecurringTransaction={() => {}}
          onUpdateRecurringTransaction={() => {}}
          onDeleteRecurringTransaction={() => {}}
          onGenerateTransactions={handleGenerateTransactions}
        />;
      case 'cash-flow-calendar':
        return <CashFlowCalendar
          events={cashFlowEvents}
          currency={preferences.currency}
        />;
      case 'spending-patterns':
        return <SpendingPatternAnalysis
          spendingPatterns={spendingPatterns}
          expenses={expenses}
          dailyEntries={dailyEntries}
          currency={preferences.currency}
        />;
      case 'health-improvement':
        return <FinancialHealthImprovementSteps
          improvementSteps={healthImprovementSteps}
          emergencyPreparedness={emergencyPreparedness}
          currency={preferences.currency}
          onCompleteStep={handleCompleteHealthStep}
        />;
      case 'budget-optimization':
        return <BudgetCategoryOptimization
          expenses={expenses}
          incomes={incomes}
          currency={preferences.currency}
          onUpdateExpense={updateExpense}
        />;
      case 'bill-negotiation':
        return <BillNegotiationAssistant
          negotiations={billNegotiations}
          bills={bills}
          currency={preferences.currency}
          onMarkNegotiated={handleMarkNegotiated}
          onDeleteNegotiation={() => {}}
        />;
      case 'goal-forecasting':
        return <GoalForecastingView
          goals={enhancedGoals}
          currency={preferences.currency}
          onUpdateGoal={updateGoal}
        />;
      case 'ai-categorization':
        return <AIExpenseCategorization
          dailyEntries={dailyEntries}
          currency={preferences.currency}
          onUpdateEntry={updateDailyEntry}
          onDeleteEntry={deleteDailyEntry}
        />;
      default:
        return <Dashboard 
          incomes={incomes} 
          expenses={expenses} 
          loans={loans} 
          bills={bills}
          businessEntries={businessEntries}
          goals={goals}
          currency={preferences.currency}
          bankAccounts={bankAccounts}
          challenges={challenges}
          userProgress={userProgress}
          expectedPayments={expectedPayments}
          onCompleteChallenge={completeChallenge}
          onMarkExpectedPaymentAsPaid={markExpectedPaymentAsPaid}
        />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
      
      {/* Celebration Modal */}
      {activeCelebration && (
        <CelebrationModal
          celebration={activeCelebration}
          onClose={() => setActiveCelebration(null)}
          onAcknowledge={handleAcknowledgeCelebration}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider initialTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;