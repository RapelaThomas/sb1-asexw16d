/*
  # Add Hybrid Debt Strategy Support

  1. Updates to existing tables
    - Update `debt_strategy` column in `user_preferences` table to support 'hybrid' strategy

  2. Security
    - Maintain existing RLS policies
*/

-- Update debt_strategy column in user_preferences table to support 'hybrid' strategy
DO $$
BEGIN
  -- First, drop the existing constraint
  ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_debt_strategy_check;
  
  -- Then add the new constraint with the 'hybrid' option
  ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_debt_strategy_check 
    CHECK (debt_strategy IN ('avalanche', 'snowball', 'hybrid'));
END $$;