/*
  # Add Overdraft Capability to Bank Accounts

  1. Updates to existing tables
    - Add `has_overdraft`, `overdraft_limit`, and `overdraft_used` columns to `bank_accounts` table

  2. Security
    - Maintain existing RLS policies
*/

-- Add overdraft columns to bank_accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_accounts' AND column_name = 'has_overdraft'
  ) THEN
    ALTER TABLE bank_accounts ADD COLUMN has_overdraft boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_accounts' AND column_name = 'overdraft_limit'
  ) THEN
    ALTER TABLE bank_accounts ADD COLUMN overdraft_limit numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_accounts' AND column_name = 'overdraft_used'
  ) THEN
    ALTER TABLE bank_accounts ADD COLUMN overdraft_used numeric DEFAULT 0;
  END IF;
END $$;