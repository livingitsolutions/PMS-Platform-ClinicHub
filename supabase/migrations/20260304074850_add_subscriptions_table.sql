/*
  # Add subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `stripe_customer_id` (text, unique)
      - `stripe_subscription_id` (text, unique, nullable)
      - `plan` (text) - plan tier (starter, professional, enterprise)
      - `status` (text) - subscription status (active, canceled, past_due, trialing, incomplete)
      - `current_period_end` (timestamptz) - end of current billing period
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for clinic owners to read their subscription
    - Add policy for clinic admins to read their clinic subscription

  3. Indexes
    - Index on clinic_id for fast lookups
    - Index on stripe_customer_id for webhook processing
    - Index on stripe_subscription_id for webhook processing
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text UNIQUE NOT NULL,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON subscriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can view their subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = subscriptions.clinic_id
      AND clinic_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
