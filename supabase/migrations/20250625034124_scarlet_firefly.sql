/*
  # Add Business Management and Transfer Tables

  1. New Tables
    - `business_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `sales` (numeric)
      - `stock_value` (numeric)
      - `profit` (numeric)
      - `profit_to_goal` (numeric)
      - `profit_to_goal_percentage` (numeric)
      - `description` (text)
      - `profit_account_id` (uuid, references bank_accounts)
      - `selected_goal_id` (uuid, references financial_goals)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `from_account_id` (uuid, references bank_accounts)
      - `to_account_id` (uuid, references bank_accounts)
      - `amount` (numeric)
      - `description` (text)
      - `is_loan` (boolean)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `time` and `frequency` columns to `daily_entries`

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create business_entries table
CREATE TABLE IF NOT EXISTS business_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  sales numeric NOT NULL DEFAULT 0,
  stock_value numeric NOT NULL DEFAULT 0,
  profit numeric NOT NULL DEFAULT 0,
  profit_to_goal numeric NOT NULL DEFAULT 0,
  profit_to_goal_percentage numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  profit_account_id uuid REFERENCES bank_accounts NOT NULL,
  selected_goal_id uuid REFERENCES financial_goals,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business entries"
  ON business_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  from_account_id uuid REFERENCES bank_accounts NOT NULL,
  to_account_id uuid REFERENCES bank_accounts NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  is_loan boolean DEFAULT false,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transfers"
  ON transfers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add new columns to daily_entries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_entries' AND column_name = 'time'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN time text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_entries' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_entries_user_id ON business_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_business_entries_date ON business_entries(date);
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(date);

-- Add updated_at triggers to new tables
CREATE TRIGGER update_business_entries_updated_at BEFORE UPDATE ON business_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();