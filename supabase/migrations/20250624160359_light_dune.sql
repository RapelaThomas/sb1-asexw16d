/*
  # Create Financial Management Tables

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `type` (text)
      - `balance` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `incomes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `source` (text)
      - `amount` (numeric)
      - `frequency` (text)
      - `monthly_amount` (numeric)
      - `bank_account_id` (uuid, references bank_accounts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `amount` (numeric)
      - `category` (text)
      - `frequency` (text)
      - `monthly_amount` (numeric)
      - `bank_account_id` (uuid, references bank_accounts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `loans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `principal` (numeric)
      - `current_balance` (numeric)
      - `interest_rate` (numeric)
      - `minimum_payment` (numeric)
      - `due_date` (date)
      - `penalty_rate` (numeric)
      - `other_charges` (numeric)
      - `lender` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `amount` (numeric)
      - `due_date` (date)
      - `frequency` (text)
      - `category` (text)
      - `is_paid` (boolean)
      - `bank_account_id` (uuid, references bank_accounts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `income` (numeric)
      - `expenses` (numeric)
      - `category` (text)
      - `description` (text)
      - `income_bank_account_id` (uuid, references bank_accounts)
      - `expense_bank_account_id` (uuid, references bank_accounts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `financial_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `target_amount` (numeric)
      - `current_amount` (numeric)
      - `target_date` (date)
      - `category` (text)
      - `priority` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `strategy` (text)
      - `risk_tolerance` (text)
      - `emergency_fund_months` (integer)
      - `auto_allocate` (boolean)
      - `reminder_time` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'cash')),
  balance numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bank accounts"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create incomes table
CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  monthly_amount numeric NOT NULL DEFAULT 0,
  bank_account_id uuid REFERENCES bank_accounts NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own incomes"
  ON incomes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category IN ('need', 'want')),
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  monthly_amount numeric NOT NULL DEFAULT 0,
  bank_account_id uuid REFERENCES bank_accounts NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  principal numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  minimum_payment numeric NOT NULL DEFAULT 0,
  due_date date,
  penalty_rate numeric,
  other_charges numeric,
  lender text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own loans"
  ON loans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  category text NOT NULL CHECK (category IN ('utility', 'subscription', 'insurance', 'other')),
  is_paid boolean DEFAULT false,
  bank_account_id uuid REFERENCES bank_accounts,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bills"
  ON bills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create daily_entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  income numeric DEFAULT 0,
  expenses numeric DEFAULT 0,
  category text CHECK (category IN ('need', 'want')),
  description text DEFAULT '',
  income_bank_account_id uuid REFERENCES bank_accounts,
  expense_bank_account_id uuid REFERENCES bank_accounts,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily entries"
  ON daily_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric DEFAULT 0,
  target_date date NOT NULL,
  category text NOT NULL CHECK (category IN ('emergency', 'investment', 'purchase', 'vacation', 'other')),
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own financial goals"
  ON financial_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  strategy text DEFAULT 'balanced' CHECK (strategy IN ('debt-focused', 'balanced', 'savings-focused')),
  risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  emergency_fund_months integer DEFAULT 6,
  auto_allocate boolean DEFAULT true,
  reminder_time text DEFAULT '09:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();