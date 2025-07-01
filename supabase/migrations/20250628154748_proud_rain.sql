/*
  # Add missing loan fields

  1. Updates to existing tables
    - Add `start_date` and `loan_period_months` columns to `loans` table
    - Add `currency` column to `user_preferences` table

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