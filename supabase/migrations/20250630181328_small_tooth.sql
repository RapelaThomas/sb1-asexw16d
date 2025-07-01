/*
  # Create Lending and Expected Payments System

  1. New Tables
    - `expected_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - 'income' or 'expense'
      - `name` (text)
      - `amount` (numeric)
      - `expected_date` (date)
      - `bank_account_id` (uuid, references bank_accounts)
      - `person_name` (text) - for lending tracking
      - `description` (text)
      - `is_paid` (boolean)
      - `paid_date` (date)
      - `reminder_sent` (boolean)
      - `overdue_reminders` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create expected_payments table
CREATE TABLE IF NOT EXISTS expected_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  expected_date date NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts NOT NULL,
  person_name text,
  description text DEFAULT '',
  is_paid boolean DEFAULT false,
  paid_date date,
  reminder_sent boolean DEFAULT false,
  overdue_reminders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expected_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expected payments"
  ON expected_payments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expected_payments_user_id ON expected_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_expected_payments_expected_date ON expected_payments(expected_date);
CREATE INDEX IF NOT EXISTS idx_expected_payments_type ON expected_payments(type);
CREATE INDEX IF NOT EXISTS idx_expected_payments_is_paid ON expected_payments(is_paid);

-- Add updated_at trigger
CREATE TRIGGER update_expected_payments_updated_at 
  BEFORE UPDATE ON expected_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();