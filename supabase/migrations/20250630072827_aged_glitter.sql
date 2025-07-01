/*
  # Create Gamification Tables

  1. New Tables
    - `user_challenges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `challenge_type` (text)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `target` (numeric)
      - `current` (numeric)
      - `points` (integer)
      - `difficulty` (text)
      - `deadline` (date)
      - `is_completed` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_points` (integer)
      - `level` (integer)
      - `current_level_points` (integer)
      - `next_level_points` (integer)
      - `streak` (integer)
      - `longest_streak` (integer)
      - `challenges_completed` (integer)
      - `achievements_unlocked` (integer)
      - `financial_health_improvement` (integer)
      - `last_activity_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their own data
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can manage their own progress" ON user_progress;

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('savings', 'debt', 'income', 'tracking', 'goals', 'investment')),
  target numeric NOT NULL DEFAULT 0,
  current numeric NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  deadline date NOT NULL,
  is_completed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own challenges"
  ON user_challenges
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  current_level_points integer DEFAULT 0,
  next_level_points integer DEFAULT 100,
  streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  challenges_completed integer DEFAULT 0,
  achievements_unlocked integer DEFAULT 0,
  financial_health_improvement integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_deadline ON user_challenges(deadline);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON user_challenges;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;

-- Add updated_at triggers to new tables
CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();