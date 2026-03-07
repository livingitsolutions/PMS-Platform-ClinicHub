/*
  # Add billing fields to clinics table

  ## Changes
  - `clinics` table
    - Add `plan` (text, DEFAULT 'starter') — tracks the active billing plan name
    - Add `subscription_status` (text, DEFAULT 'inactive') — mirrors the subscription status for quick access

  ## Purpose
  These denormalized fields allow the app to check a clinic's plan and billing status
  directly from the clinics table without joining the subscriptions table.
  They are kept in sync by the stripe-webhook edge function.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'plan'
  ) THEN
    ALTER TABLE clinics ADD COLUMN plan text NOT NULL DEFAULT 'starter';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE clinics ADD COLUMN subscription_status text NOT NULL DEFAULT 'inactive';
  END IF;
END $$;
