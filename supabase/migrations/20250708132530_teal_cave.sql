/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `amount` (decimal)
      - `frequency` (text: monthly, quarterly, yearly)
      - `category` (text)
      - `start_date` (date)
      - `next_billing_date` (date)
      - `is_active` (boolean)
      - `auto_renewal` (boolean)
      - `description` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for users to manage their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  category text NOT NULL,
  start_date date NOT NULL,
  next_billing_date date NOT NULL,
  is_active boolean DEFAULT true,
  auto_renewal boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_next_billing_idx ON subscriptions(user_id, next_billing_date);