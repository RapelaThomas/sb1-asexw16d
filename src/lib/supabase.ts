import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
          balance: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
          balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
          balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          amount: number;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount: number;
          bank_account_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          amount: number;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount: number;
          bank_account_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: string;
          amount?: number;
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount?: number;
          bank_account_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          category: 'need' | 'want';
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount: number;
          bank_account_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          category: 'need' | 'want';
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount: number;
          bank_account_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          category?: 'need' | 'want';
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          monthly_amount?: number;
          bank_account_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          principal: number;
          current_balance: number;
          interest_rate: number;
          minimum_payment: number;
          due_date: string | null;
          penalty_rate: number | null;
          other_charges: number | null;
          lender: string;
          start_date: string;
          loan_period_months: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          principal: number;
          current_balance: number;
          interest_rate: number;
          minimum_payment: number;
          due_date?: string | null;
          penalty_rate?: number | null;
          other_charges?: number | null;
          lender?: string;
          start_date?: string;
          loan_period_months?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          principal?: number;
          current_balance?: number;
          interest_rate?: number;
          minimum_payment?: number;
          due_date?: string | null;
          penalty_rate?: number | null;
          other_charges?: number | null;
          lender?: string;
          start_date?: string;
          loan_period_months?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          category: 'utility' | 'subscription' | 'insurance' | 'other';
          is_paid: boolean;
          bank_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          category: 'utility' | 'subscription' | 'insurance' | 'other';
          is_paid?: boolean;
          bank_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          due_date?: string;
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          category?: 'utility' | 'subscription' | 'insurance' | 'other';
          is_paid?: boolean;
          bank_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          income: number;
          expenses: number;
          category: 'need' | 'want' | null;
          description: string;
          time: string | null;
          frequency: string | null;
          income_bank_account_id: string | null;
          expense_bank_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          income?: number;
          expenses?: number;
          category?: 'need' | 'want' | null;
          description?: string;
          time?: string | null;
          frequency?: string | null;
          income_bank_account_id?: string | null;
          expense_bank_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          income?: number;
          expenses?: number;
          category?: 'need' | 'want' | null;
          description?: string;
          time?: string | null;
          frequency?: string | null;
          income_bank_account_id?: string | null;
          expense_bank_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          sales: number;
          stock_value: number;
          profit: number;
          profit_to_goal: number;
          profit_to_goal_percentage: number;
          description: string;
          profit_account_id: string;
          selected_goal_id: string | null;
          marketing_budget_percentage: number | null;
          marketing_budget_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          sales: number;
          stock_value: number;
          profit: number;
          profit_to_goal: number;
          profit_to_goal_percentage: number;
          description?: string;
          profit_account_id: string;
          selected_goal_id?: string | null;
          marketing_budget_percentage?: number | null;
          marketing_budget_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          sales?: number;
          stock_value?: number;
          profit?: number;
          profit_to_goal?: number;
          profit_to_goal_percentage?: number;
          description?: string;
          profit_account_id?: string;
          selected_goal_id?: string | null;
          marketing_budget_percentage?: number | null;
          marketing_budget_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          amount: number;
          description: string;
          is_loan: boolean;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          amount: number;
          description?: string;
          is_loan?: boolean;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_account_id?: string;
          to_account_id?: string;
          amount?: number;
          description?: string;
          is_loan?: boolean;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string;
          category: 'emergency' | 'investment' | 'purchase' | 'vacation' | 'other';
          priority: 'high' | 'medium' | 'low';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          target_date: string;
          category: 'emergency' | 'investment' | 'purchase' | 'vacation' | 'other';
          priority: 'high' | 'medium' | 'low';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string;
          category?: 'emergency' | 'investment' | 'purchase' | 'vacation' | 'other';
          priority?: 'high' | 'medium' | 'low';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          strategy: 'debt-focused' | 'balanced' | 'savings-focused';
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
          emergency_fund_months: number;
          auto_allocate: boolean;
          reminder_time: string;
          currency: string;
          debt_strategy: string | null;
          auto_suggest_strategy: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          strategy?: 'debt-focused' | 'balanced' | 'savings-focused';
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
          emergency_fund_months?: number;
          auto_allocate?: boolean;
          reminder_time?: string;
          currency?: string;
          debt_strategy?: string | null;
          auto_suggest_strategy?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          strategy?: 'debt-focused' | 'balanced' | 'savings-focused';
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
          emergency_fund_months?: number;
          auto_allocate?: boolean;
          reminder_time?: string;
          currency?: string;
          debt_strategy?: string | null;
          auto_suggest_strategy?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_type: 'daily' | 'weekly' | 'monthly';
          title: string;
          description: string;
          category: 'savings' | 'debt' | 'income' | 'tracking' | 'goals' | 'investment';
          target: number;
          current: number;
          points: number;
          difficulty: 'easy' | 'medium' | 'hard';
          deadline: string;
          is_completed: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_type: 'daily' | 'weekly' | 'monthly';
          title: string;
          description: string;
          category: 'savings' | 'debt' | 'income' | 'tracking' | 'goals' | 'investment';
          target: number;
          current?: number;
          points: number;
          difficulty: 'easy' | 'medium' | 'hard';
          deadline: string;
          is_completed?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_type?: 'daily' | 'weekly' | 'monthly';
          title?: string;
          description?: string;
          category?: 'savings' | 'debt' | 'income' | 'tracking' | 'goals' | 'investment';
          target?: number;
          current?: number;
          points?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          deadline?: string;
          is_completed?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          level: number;
          current_level_points: number;
          next_level_points: number;
          streak: number;
          longest_streak: number;
          challenges_completed: number;
          achievements_unlocked: number;
          financial_health_improvement: number;
          last_activity_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_points?: number;
          level?: number;
          current_level_points?: number;
          next_level_points?: number;
          streak?: number;
          longest_streak?: number;
          challenges_completed?: number;
          achievements_unlocked?: number;
          financial_health_improvement?: number;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_points?: number;
          level?: number;
          current_level_points?: number;
          next_level_points?: number;
          streak?: number;
          longest_streak?: number;
          challenges_completed?: number;
          achievements_unlocked?: number;
          financial_health_improvement?: number;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};