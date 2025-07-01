/*
  # Add missing loan fields and business budget features

  1. Updates to existing tables
    - Add `start_date` and `loan_period_months` columns to `loans` table
    - Add `currency` column to `user_preferences` table
    - Add `debt_strategy` and `auto_suggest_strategy` columns to `user_preferences` table
    - Add marketing budget fields to `business_entries` table

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to loans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loans' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE loans ADD COLUMN start_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loans' AND column_name = 'loan_period_months'
  ) THEN
    ALTER TABLE loans ADD COLUMN loan_period_months integer DEFAULT 12;
  END IF;
END $$;

-- Add currency column to user_preferences table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'currency'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN currency text DEFAULT '{"code":"USD","symbol":"$","name":"US Dollar"}';
  END IF;
END $$;

-- Add debt strategy columns to user_preferences table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'debt_strategy'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN debt_strategy text CHECK (debt_strategy IN ('avalanche', 'snowball'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'auto_suggest_strategy'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN auto_suggest_strategy boolean DEFAULT false;
  END IF;
END $$;

-- Add marketing budget columns to business_entries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_entries' AND column_name = 'marketing_budget_percentage'
  ) THEN
    ALTER TABLE business_entries ADD COLUMN marketing_budget_percentage numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_entries' AND column_name = 'marketing_budget_amount'
  ) THEN
    ALTER TABLE business_entries ADD COLUMN marketing_budget_amount numeric DEFAULT 0;
  END IF;
END $$;