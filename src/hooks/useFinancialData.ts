import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  Income, 
  Expense, 
  BankAccount, 
  Loan, 
  Bill, 
  DailyEntry, 
  BusinessEntry, 
  FinancialGoal, 
  UserPreferences,
  Transfer,
  Challenge,
  UserProgress,
  Currency,
  ExpectedPayment
} from '../types';
import { calculateMonthlyAmount } from '../utils/calculations';

export const useFinancialData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [businessEntries, setBusinessEntries] = useState<BusinessEntry[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [expectedPayments, setExpectedPayments] = useState<ExpectedPayment[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    strategy: 'balanced',
    riskTolerance: 'moderate',
    emergencyFundMonths: 6,
    autoAllocate: true,
    reminderTime: '09:00',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    autoSuggestStrategy: false
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Helper functions for bank account mapping
  const mapDbBankAccountToClient = (dbAccount: any): BankAccount => ({
    id: dbAccount.id,
    userId: dbAccount.user_id,
    name: dbAccount.name,
    type: dbAccount.type,
    balance: dbAccount.balance,
    isActive: dbAccount.is_active,
    createdAt: dbAccount.created_at,
    updatedAt: dbAccount.updated_at,
    hasOverdraft: dbAccount.has_overdraft,
    overdraftLimit: dbAccount.overdraft_limit,
    overdraftUsed: dbAccount.overdraft_used
  });

  const mapClientBankAccountToDb = (clientAccount: Partial<BankAccount>) => {
    const dbAccount: any = {};
    
    if (clientAccount.name !== undefined) dbAccount.name = clientAccount.name;
    if (clientAccount.type !== undefined) dbAccount.type = clientAccount.type;
    if (clientAccount.balance !== undefined) dbAccount.balance = clientAccount.balance;
    if (clientAccount.isActive !== undefined) dbAccount.is_active = clientAccount.isActive;
    if (clientAccount.hasOverdraft !== undefined) dbAccount.has_overdraft = clientAccount.hasOverdraft;
    if (clientAccount.overdraftLimit !== undefined) dbAccount.overdraft_limit = clientAccount.overdraftLimit;
    if (clientAccount.overdraftUsed !== undefined) dbAccount.overdraft_used = clientAccount.overdraftUsed;
    
    return dbAccount;
  };

  // Load all financial data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBankAccounts(),
        loadIncomes(),
        loadExpenses(),
        loadLoans(),
        loadBills(),
        loadDailyEntries(),
        loadBusinessEntries(),
        loadTransfers(),
        loadGoals(),
        loadExpectedPayments(),
        loadPreferences(),
        loadChallenges(),
        loadUserProgress()
      ]);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bank Accounts
  const loadBankAccounts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading bank accounts:', error);
      return;
    }
    
    setBankAccounts((data || []).map(mapDbBankAccountToClient));
  };

  const addBankAccount = async (account: Omit<BankAccount, 'id'>) => {
    if (!user) return;
    
    const dbAccount = mapClientBankAccountToDb(account);
    dbAccount.user_id = user.id;
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([dbAccount])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bank account:', error);
      return;
    }
    
    setBankAccounts(prev => [mapDbBankAccountToClient(data), ...prev]);
  };

  const updateBankAccount = async (accountId: string, updates: Partial<BankAccount>) => {
    if (!user) return;
    
    const dbUpdates = mapClientBankAccountToDb(updates);
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(dbUpdates)
      .eq('id', accountId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bank account:', error);
      return;
    }
    
    setBankAccounts(prev => prev.map(acc => acc.id === accountId ? mapDbBankAccountToClient(data) : acc));
  };

  const deleteBankAccount = async (accountId: string) => {
    if (!user) return;
    
    // Check if account is used in other tables
    const tables = [
      { name: 'incomes', field: 'bank_account_id' },
      { name: 'expenses', field: 'bank_account_id' },
      { name: 'bills', field: 'bank_account_id' },
      { name: 'daily_entries', field: 'income_bank_account_id' },
      { name: 'daily_entries', field: 'expense_bank_account_id' },
      { name: 'business_entries', field: 'profit_account_id' },
      { name: 'transfers', field: 'from_account_id' },
      { name: 'transfers', field: 'to_account_id' },
      { name: 'expected_payments', field: 'bank_account_id' }
    ];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table.name)
        .select(table.field, { count: 'exact', head: true })
        .eq(table.field, accountId);
      
      if (error) {
        console.error(`Error checking ${table.name}:`, error);
        return;
      }
      
      if (count && count > 0) {
        alert(`This account is used in ${table.name}. Please update those entries first.`);
        return;
      }
    }
    
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting bank account:', error);
      return;
    }
    
    setBankAccounts(prev => prev.filter(acc => acc.id !== accountId));
  };

  // Incomes
  const loadIncomes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading incomes:', error);
      return;
    }
    
    setIncomes(data || []);
  };

  const addIncome = async (income: Omit<Income, 'id' | 'monthlyAmount'>) => {
    if (!user) return;
    
    const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
    
    const { data, error } = await supabase
      .from('incomes')
      .insert([{ ...income, monthly_amount: monthlyAmount, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding income:', error);
      return;
    }
    
    setIncomes(prev => [{ ...data, monthlyAmount: data.monthly_amount }, ...prev]);
  };

  const updateIncome = async (incomeId: string, updates: Partial<Income>) => {
    if (!user) return;
    
    const dbUpdates: any = { ...updates };
    
    // Recalculate monthly amount if amount or frequency changed
    if (updates.amount !== undefined || updates.frequency !== undefined) {
      const currentIncome = incomes.find(i => i.id === incomeId);
      if (currentIncome) {
        const amount = updates.amount !== undefined ? updates.amount : currentIncome.amount;
        const frequency = updates.frequency !== undefined ? updates.frequency : currentIncome.frequency;
        dbUpdates.monthly_amount = calculateMonthlyAmount(amount, frequency);
      }
    }
    
    const { data, error } = await supabase
      .from('incomes')
      .update(dbUpdates)
      .eq('id', incomeId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating income:', error);
      return;
    }
    
    setIncomes(prev => prev.map(inc => inc.id === incomeId ? { ...data, monthlyAmount: data.monthly_amount } : inc));
  };

  const deleteIncome = async (incomeId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting income:', error);
      return;
    }
    
    setIncomes(prev => prev.filter(inc => inc.id !== incomeId));
  };

  // Expenses
  const loadExpenses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading expenses:', error);
      return;
    }
    
    setExpenses(data || []);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'monthlyAmount'>) => {
    if (!user) return;
    
    const monthlyAmount = calculateMonthlyAmount(expense.amount, expense.frequency);
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, monthly_amount: monthlyAmount, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding expense:', error);
      return;
    }
    
    setExpenses(prev => [{ ...data, monthlyAmount: data.monthly_amount }, ...prev]);
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!user) return;
    
    const dbUpdates: any = { ...updates };
    
    // Recalculate monthly amount if amount or frequency changed
    if (updates.amount !== undefined || updates.frequency !== undefined) {
      const currentExpense = expenses.find(e => e.id === expenseId);
      if (currentExpense) {
        const amount = updates.amount !== undefined ? updates.amount : currentExpense.amount;
        const frequency = updates.frequency !== undefined ? updates.frequency : currentExpense.frequency;
        dbUpdates.monthly_amount = calculateMonthlyAmount(amount, frequency);
      }
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expense:', error);
      return;
    }
    
    setExpenses(prev => prev.map(exp => exp.id === expenseId ? { ...data, monthlyAmount: data.monthly_amount } : exp));
  };

  const deleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }
    
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  // Loans
  const loadLoans = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading loans:', error);
      return;
    }
    
    setLoans(data || []);
  };

  const addLoan = async (loan: Omit<Loan, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('loans')
      .insert([{ ...loan, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding loan:', error);
      return;
    }
    
    setLoans(prev => [data, ...prev]);
  };

  const updateLoan = async (loanId: string, updates: Partial<Loan>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', loanId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating loan:', error);
      return;
    }
    
    setLoans(prev => prev.map(loan => loan.id === loanId ? data : loan));
  };

  const deleteLoan = async (loanId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting loan:', error);
      return;
    }
    
    setLoans(prev => prev.filter(loan => loan.id !== loanId));
  };

  // Bills
  const loadBills = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error loading bills:', error);
      return;
    }
    
    setBills(data || []);
  };

  const addBill = async (bill: Omit<Bill, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bills')
      .insert([{ ...bill, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bill:', error);
      return;
    }
    
    setBills(prev => [...prev, data].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const updateBill = async (billId: string, updates: Partial<Bill>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', billId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bill:', error);
      return;
    }
    
    setBills(prev => prev.map(bill => bill.id === billId ? data : bill)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const updateBillPayment = async (billId: string, isPaid: boolean) => {
    return updateBill(billId, { isPaid });
  };

  const deleteBill = async (billId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting bill:', error);
      return;
    }
    
    setBills(prev => prev.filter(bill => bill.id !== billId));
  };

  // Daily Entries
  const loadDailyEntries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading daily entries:', error);
      return;
    }
    
    setDailyEntries(data || []);
  };

  const addDailyEntry = async (entry: Omit<DailyEntry, 'id'>) => {
    if (!user) return;
    
    // Check if entry for this date already exists
    const existingEntry = dailyEntries.find(e => e.date === entry.date);
    
    if (existingEntry) {
      // Update existing entry
      return updateDailyEntry(existingEntry.id, entry);
    }
    
    const { data, error } = await supabase
      .from('daily_entries')
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding daily entry:', error);
      return;
    }
    
    setDailyEntries(prev => [data, ...prev]);
    
    // Update user progress - increment streak
    if (userProgress) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let streak = userProgress.streak;
      let longestStreak = userProgress.longestStreak;
      
      if (entry.date === today) {
        // Check if yesterday had an entry
        const hasYesterdayEntry = dailyEntries.some(e => e.date === yesterday);
        
        if (hasYesterdayEntry || streak === 0) {
          streak += 1;
          longestStreak = Math.max(longestStreak, streak);
          
          await supabase
            .from('user_progress')
            .update({
              streak,
              longest_streak: longestStreak,
              last_activity_date: today
            })
            .eq('user_id', user.id);
          
          setUserProgress(prev => prev ? { ...prev, streak, longestStreak, lastActivityDate: today } : null);
        }
      }
    }
  };

  const updateDailyEntry = async (entryId: string, updates: Partial<DailyEntry>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('daily_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating daily entry:', error);
      return;
    }
    
    setDailyEntries(prev => prev.map(entry => entry.id === entryId ? data : entry));
  };

  const deleteDailyEntry = async (entryId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting daily entry:', error);
      return;
    }
    
    setDailyEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Business Entries
  const loadBusinessEntries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('business_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading business entries:', error);
      return;
    }
    
    setBusinessEntries(data || []);
  };

  const addBusinessEntry = async (entry: Omit<BusinessEntry, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('business_entries')
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding business entry:', error);
      return;
    }
    
    setBusinessEntries(prev => [data, ...prev]);
  };

  const updateBusinessEntry = async (entryId: string, updates: Partial<BusinessEntry>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('business_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating business entry:', error);
      return;
    }
    
    setBusinessEntries(prev => prev.map(entry => entry.id === entryId ? data : entry));
  };

  const deleteBusinessEntry = async (entryId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('business_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting business entry:', error);
      return;
    }
    
    setBusinessEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Transfers
  const loadTransfers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading transfers:', error);
      return;
    }
    
    setTransfers(data || []);
  };

  const addTransfer = async (transfer: Omit<Transfer, 'id'>) => {
    if (!user) return;
    
    // Start a transaction to update account balances
    const fromAccount = bankAccounts.find(acc => acc.id === transfer.fromAccountId);
    const toAccount = bankAccounts.find(acc => acc.id === transfer.toAccountId);
    
    if (!fromAccount || !toAccount) {
      console.error('Source or destination account not found');
      return;
    }
    
    // Calculate new balances
    const fromBalance = fromAccount.balance - transfer.amount;
    let fromOverdraftUsed = fromAccount.overdraftUsed || 0;
    
    // If balance goes negative and account has overdraft
    if (fromBalance < 0 && fromAccount.hasOverdraft) {
      const overdraftNeeded = Math.abs(fromBalance);
      fromOverdraftUsed = Math.min(fromOverdraftUsed + overdraftNeeded, fromAccount.overdraftLimit || 0);
    }
    
    const toBalance = toAccount.balance + transfer.amount;
    
    try {
      // Insert transfer record
      const { data, error } = await supabase
        .from('transfers')
        .insert([{ ...transfer, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update source account
      const { error: fromError } = await supabase
        .from('bank_accounts')
        .update({ 
          balance: fromBalance,
          overdraft_used: fromAccount.hasOverdraft ? fromOverdraftUsed : undefined
        })
        .eq('id', fromAccount.id)
        .eq('user_id', user.id);
      
      if (fromError) throw fromError;
      
      // Update destination account
      const { error: toError } = await supabase
        .from('bank_accounts')
        .update({ balance: toBalance })
        .eq('id', toAccount.id)
        .eq('user_id', user.id);
      
      if (toError) throw toError;
      
      // Update local state
      setTransfers(prev => [data, ...prev]);
      setBankAccounts(prev => prev.map(acc => {
        if (acc.id === fromAccount.id) {
          return { 
            ...acc, 
            balance: fromBalance,
            overdraftUsed: fromAccount.hasOverdraft ? fromOverdraftUsed : acc.overdraftUsed
          };
        }
        if (acc.id === toAccount.id) {
          return { ...acc, balance: toBalance };
        }
        return acc;
      }));
      
    } catch (error) {
      console.error('Error processing transfer:', error);
    }
  };

  const deleteTransfer = async (transferId: string) => {
    if (!user) return;
    
    // Get the transfer details
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) {
      console.error('Transfer not found');
      return;
    }
    
    // Get the accounts
    const fromAccount = bankAccounts.find(acc => acc.id === transfer.fromAccountId);
    const toAccount = bankAccounts.find(acc => acc.id === transfer.toAccountId);
    
    if (!fromAccount || !toAccount) {
      console.error('Source or destination account not found');
      return;
    }
    
    // Calculate reversed balances
    const fromBalance = fromAccount.balance + transfer.amount;
    let fromOverdraftUsed = fromAccount.overdraftUsed || 0;
    
    // If account has overdraft and was using it, reduce the overdraft used
    if (fromAccount.hasOverdraft && fromOverdraftUsed > 0) {
      const currentNegativeBalance = Math.min(0, fromAccount.balance);
      if (currentNegativeBalance < 0) {
        // First apply to negative balance
        const remainingAmount = transfer.amount - Math.abs(currentNegativeBalance);
        if (remainingAmount > 0) {
          // Then reduce overdraft used
          fromOverdraftUsed = Math.max(0, fromOverdraftUsed - remainingAmount);
        }
      } else {
        // Just reduce overdraft used
        fromOverdraftUsed = Math.max(0, fromOverdraftUsed - transfer.amount);
      }
    }
    
    const toBalance = toAccount.balance - transfer.amount;
    
    try {
      // Delete transfer record
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', transferId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update source account
      const { error: fromError } = await supabase
        .from('bank_accounts')
        .update({ 
          balance: fromBalance,
          overdraft_used: fromAccount.hasOverdraft ? fromOverdraftUsed : undefined
        })
        .eq('id', fromAccount.id)
        .eq('user_id', user.id);
      
      if (fromError) throw fromError;
      
      // Update destination account
      const { error: toError } = await supabase
        .from('bank_accounts')
        .update({ balance: toBalance })
        .eq('id', toAccount.id)
        .eq('user_id', user.id);
      
      if (toError) throw toError;
      
      // Update local state
      setTransfers(prev => prev.filter(t => t.id !== transferId));
      setBankAccounts(prev => prev.map(acc => {
        if (acc.id === fromAccount.id) {
          return { 
            ...acc, 
            balance: fromBalance,
            overdraftUsed: fromAccount.hasOverdraft ? fromOverdraftUsed : acc.overdraftUsed
          };
        }
        if (acc.id === toAccount.id) {
          return { ...acc, balance: toBalance };
        }
        return acc;
      }));
      
    } catch (error) {
      console.error('Error deleting transfer:', error);
    }
  };

  // Expected Payments
  const loadExpectedPayments = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('expected_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('expected_date', { ascending: true });
    
    if (error) {
      console.error('Error loading expected payments:', error);
      return;
    }
    
    setExpectedPayments(data ? data.map(payment => ({
      id: payment.id,
      type: payment.type,
      name: payment.name,
      amount: payment.amount,
      expectedDate: payment.expected_date,
      bankAccountId: payment.bank_account_id,
      personName: payment.person_name,
      description: payment.description,
      isPaid: payment.is_paid,
      paidDate: payment.paid_date,
      reminderSent: payment.reminder_sent,
      overdueReminders: payment.overdue_reminders,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    })) : []);
  };

  const addExpectedPayment = async (payment: Omit<ExpectedPayment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'overdueReminders'>) => {
    if (!user) return;
    
    const dbPayment = {
      user_id: user.id,
      type: payment.type,
      name: payment.name,
      amount: payment.amount,
      expected_date: payment.expectedDate,
      bank_account_id: payment.bankAccountId,
      person_name: payment.personName,
      description: payment.description,
      is_paid: payment.isPaid,
      paid_date: payment.paidDate,
      reminder_sent: false,
      overdue_reminders: 0
    };
    
    const { data, error } = await supabase
      .from('expected_payments')
      .insert([dbPayment])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding expected payment:', error);
      return;
    }
    
    setExpectedPayments(prev => [...prev, {
      id: data.id,
      type: data.type,
      name: data.name,
      amount: data.amount,
      expectedDate: data.expected_date,
      bankAccountId: data.bank_account_id,
      personName: data.person_name,
      description: data.description,
      isPaid: data.is_paid,
      paidDate: data.paid_date,
      reminderSent: data.reminder_sent,
      overdueReminders: data.overdue_reminders,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }].sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()));
  };

  const updateExpectedPayment = async (paymentId: string, updates: Partial<ExpectedPayment>) => {
    if (!user) return;
    
    const dbUpdates: any = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.expectedDate !== undefined) dbUpdates.expected_date = updates.expectedDate;
    if (updates.bankAccountId !== undefined) dbUpdates.bank_account_id = updates.bankAccountId;
    if (updates.personName !== undefined) dbUpdates.person_name = updates.personName;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
    if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;
    if (updates.reminderSent !== undefined) dbUpdates.reminder_sent = updates.reminderSent;
    if (updates.overdueReminders !== undefined) dbUpdates.overdue_reminders = updates.overdueReminders;
    
    const { data, error } = await supabase
      .from('expected_payments')
      .update(dbUpdates)
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expected payment:', error);
      return;
    }
    
    setExpectedPayments(prev => prev.map(payment => 
      payment.id === paymentId ? {
        id: data.id,
        type: data.type,
        name: data.name,
        amount: data.amount,
        expectedDate: data.expected_date,
        bankAccountId: data.bank_account_id,
        personName: data.person_name,
        description: data.description,
        isPaid: data.is_paid,
        paidDate: data.paid_date,
        reminderSent: data.reminder_sent,
        overdueReminders: data.overdue_reminders,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : payment
    ));
  };

  const markExpectedPaymentAsPaid = async (paymentId: string, isPaid: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    return updateExpectedPayment(paymentId, { 
      isPaid, 
      paidDate: isPaid ? today : undefined 
    });
  };

  const deleteExpectedPayment = async (paymentId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('expected_payments')
      .delete()
      .eq('id', paymentId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting expected payment:', error);
      return;
    }
    
    setExpectedPayments(prev => prev.filter(payment => payment.id !== paymentId));
  };

  // Financial Goals
  const loadGoals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading goals:', error);
      return;
    }
    
    setGoals(data || []);
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('financial_goals')
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding goal:', error);
      return;
    }
    
    setGoals(prev => [data, ...prev]);
  };

  const updateGoal = async (goalId: string, updates: Partial<FinancialGoal>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating goal:', error);
      return;
    }
    
    setGoals(prev => prev.map(goal => goal.id === goalId ? data : goal));
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    
    // Check if goal is used in business entries
    const { count, error: countError } = await supabase
      .from('business_entries')
      .select('selected_goal_id', { count: 'exact', head: true })
      .eq('selected_goal_id', goalId);
    
    if (countError) {
      console.error('Error checking goal usage:', countError);
      return;
    }
    
    if (count && count > 0) {
      alert('This goal is used in business entries. Please update those entries first.');
      return;
    }
    
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting goal:', error);
      return;
    }
    
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  // User Preferences
  const loadPreferences = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading preferences:', error);
      return;
    }
    
    if (data) {
      // Parse currency from JSON string
      let currency: Currency = { code: 'USD', symbol: '$', name: 'US Dollar' };
      try {
        if (data.currency) {
          currency = typeof data.currency === 'string' ? JSON.parse(data.currency) : data.currency;
        }
      } catch (e) {
        console.error('Error parsing currency:', e);
      }
      
      setPreferences({
        strategy: data.strategy || 'balanced',
        riskTolerance: data.risk_tolerance || 'moderate',
        emergencyFundMonths: data.emergency_fund_months || 6,
        autoAllocate: data.auto_allocate !== undefined ? data.auto_allocate : true,
        reminderTime: data.reminder_time || '09:00',
        currency,
        debtStrategy: data.debt_strategy,
        autoSuggestStrategy: data.auto_suggest_strategy || false
      });
    } else {
      // Create default preferences
      createDefaultPreferences();
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;
    
    const defaultPrefs = {
      user_id: user.id,
      strategy: 'balanced',
      risk_tolerance: 'moderate',
      emergency_fund_months: 6,
      auto_allocate: true,
      reminder_time: '09:00',
      currency: JSON.stringify({ code: 'USD', symbol: '$', name: 'US Dollar' }),
      auto_suggest_strategy: false
    };
    
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([defaultPrefs])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default preferences:', error);
      return;
    }
    
    setPreferences({
      strategy: data.strategy,
      riskTolerance: data.risk_tolerance,
      emergencyFundMonths: data.emergency_fund_months,
      autoAllocate: data.auto_allocate,
      reminderTime: data.reminder_time,
      currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
      autoSuggestStrategy: data.auto_suggest_strategy
    });
  };

  const updatePreferences = async (newPreferences: UserPreferences) => {
    if (!user) return;
    
    const dbPrefs = {
      strategy: newPreferences.strategy,
      risk_tolerance: newPreferences.riskTolerance,
      emergency_fund_months: newPreferences.emergencyFundMonths,
      auto_allocate: newPreferences.autoAllocate,
      reminder_time: newPreferences.reminderTime,
      currency: JSON.stringify(newPreferences.currency),
      debt_strategy: newPreferences.debtStrategy,
      auto_suggest_strategy: newPreferences.autoSuggestStrategy
    };
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update(dbPrefs)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating preferences:', error);
      return;
    }
    
    setPreferences(newPreferences);
  };

  // Challenges
  const loadChallenges = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('deadline', { ascending: true });
    
    if (error) {
      console.error('Error loading challenges:', error);
      return;
    }
    
    setChallenges(data || []);
  };

  const completeChallenge = async (challengeId: string) => {
    if (!user || !userProgress) return;
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    // Update challenge
    const { error: challengeError } = await supabase
      .from('user_challenges')
      .update({
        is_completed: true,
        current: challenge.target
      })
      .eq('id', challengeId)
      .eq('user_id', user.id);
    
    if (challengeError) {
      console.error('Error completing challenge:', challengeError);
      return;
    }
    
    // Update user progress
    const newPoints = userProgress.totalPoints + challenge.points;
    const { level, currentLevelPoints, nextLevelPoints } = calculateUserLevel(newPoints);
    
    const { error: progressError } = await supabase
      .from('user_progress')
      .update({
        total_points: newPoints,
        level,
        current_level_points: currentLevelPoints,
        next_level_points: nextLevelPoints,
        challenges_completed: userProgress.challengesCompleted + 1,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', user.id);
    
    if (progressError) {
      console.error('Error updating user progress:', progressError);
      return;
    }
    
    // Update local state
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isCompleted: true, current: c.target } : c));
    setUserProgress({
      ...userProgress,
      totalPoints: newPoints,
      level,
      currentLevelPoints,
      nextLevelPoints,
      challengesCompleted: userProgress.challengesCompleted + 1,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
  };

  // User Progress
  const loadUserProgress = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading user progress:', error);
      return;
    }
    
    if (data) {
      setUserProgress({
        totalPoints: data.total_points,
        level: data.level,
        currentLevelPoints: data.current_level_points,
        nextLevelPoints: data.next_level_points,
        streak: data.streak,
        longestStreak: data.longest_streak,
        challengesCompleted: data.challenges_completed,
        achievementsUnlocked: data.achievements_unlocked,
        financialHealthImprovement: data.financial_health_improvement,
        lastActivityDate: data.last_activity_date
      });
    } else {
      // Create default progress
      createDefaultUserProgress();
    }
  };

  const createDefaultUserProgress = async () => {
    if (!user) return;
    
    const defaultProgress = {
      user_id: user.id,
      total_points: 0,
      level: 1,
      current_level_points: 0,
      next_level_points: 100,
      streak: 0,
      longest_streak: 0,
      challenges_completed: 0,
      achievements_unlocked: 0,
      financial_health_improvement: 0
    };
    
    const { data, error } = await supabase
      .from('user_progress')
      .insert([defaultProgress])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default user progress:', error);
      return;
    }
    
    setUserProgress({
      totalPoints: data.total_points,
      level: data.level,
      currentLevelPoints: data.current_level_points,
      nextLevelPoints: data.next_level_points,
      streak: data.streak,
      longestStreak: data.longest_streak,
      challengesCompleted: data.challenges_completed,
      achievementsUnlocked: data.achievements_unlocked,
      financialHealthImprovement: data.financial_health_improvement
    });
  };

  // Helper function to calculate user level
  const calculateUserLevel = (totalPoints: number) => {
    // Level progression: 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000, etc.
    const levelThresholds = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000];
    
    let level = 1;
    let currentLevelPoints = totalPoints;
    let nextLevelPoints = 100;
    
    for (let i = 1; i < levelThresholds.length; i++) {
      if (totalPoints >= levelThresholds[i]) {
        level = i + 1;
        currentLevelPoints = totalPoints - levelThresholds[i];
        nextLevelPoints = i + 1 < levelThresholds.length 
          ? levelThresholds[i + 1] - levelThresholds[i]
          : levelThresholds[i] * 1.5; // For levels beyond predefined thresholds
      } else {
        nextLevelPoints = levelThresholds[i] - levelThresholds[i - 1];
        break;
      }
    }
    
    return { level, currentLevelPoints, nextLevelPoints };
  };

  // Reset all data (for testing)
  const resetAllData = async () => {
    if (!user) return false;
    
    try {
      // Delete all data in reverse order of dependencies
      await supabase.from('expected_payments').delete().eq('user_id', user.id);
      await supabase.from('transfers').delete().eq('user_id', user.id);
      await supabase.from('business_entries').delete().eq('user_id', user.id);
      await supabase.from('daily_entries').delete().eq('user_id', user.id);
      await supabase.from('bills').delete().eq('user_id', user.id);
      await supabase.from('loans').delete().eq('user_id', user.id);
      await supabase.from('expenses').delete().eq('user_id', user.id);
      await supabase.from('incomes').delete().eq('user_id', user.id);
      await supabase.from('financial_goals').delete().eq('user_id', user.id);
      await supabase.from('user_challenges').delete().eq('user_id', user.id);
      await supabase.from('user_progress').delete().eq('user_id', user.id);
      await supabase.from('bank_accounts').delete().eq('user_id', user.id);
      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      
      // Reset local state
      setBankAccounts([]);
      setIncomes([]);
      setExpenses([]);
      setLoans([]);
      setBills([]);
      setDailyEntries([]);
      setBusinessEntries([]);
      setTransfers([]);
      setGoals([]);
      setExpectedPayments([]);
      setChallenges([]);
      setUserProgress(null);
      setPreferences({
        strategy: 'balanced',
        riskTolerance: 'moderate',
        emergencyFundMonths: 6,
        autoAllocate: true,
        reminderTime: '09:00',
        currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
        autoSuggestStrategy: false
      });
      
      // Create default preferences and progress
      await createDefaultPreferences();
      await createDefaultUserProgress();
      
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      return false;
    }
  };

  return {
    loading,
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
    updateBillPayment,
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
    updateGoal,
    deleteGoal,
    addExpectedPayment,
    updateExpectedPayment,
    markExpectedPaymentAsPaid,
    deleteExpectedPayment,
    updatePreferences,
    completeChallenge,
    resetAllData
  };
};