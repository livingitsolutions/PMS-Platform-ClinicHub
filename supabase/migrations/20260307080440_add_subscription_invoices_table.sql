/*
  # Add subscription_invoices table

  ## Summary
  Creates a table to store Stripe subscription invoice records synced via webhook.

  ## New Tables

  ### subscription_invoices
  Stores billing invoice records from Stripe for each clinic's subscription.

  Columns:
  - id: UUID primary key
  - clinic_id: FK to clinics
  - stripe_invoice_id: Unique Stripe invoice ID (e.g., in_xxx)
  - stripe_subscription_id: Associated Stripe subscription ID
  - amount_due: Total amount due (in major currency unit, e.g., dollars)
  - amount_paid: Total amount paid
  - currency: ISO currency code (e.g., usd)
  - status: Stripe invoice status (draft, open, paid, void, uncollectible)
  - invoice_pdf_url: URL to download the invoice PDF from Stripe
  - paid_at: Timestamp when invoice was paid
  - created_at: Record creation timestamp

  ## Security
  - RLS enabled
  - Owners of the clinic can select their own subscription invoices

  ## Notes
  1. stripe_invoice_id is unique to prevent duplicate inserts from webhook retries
  2. Service role key is used in the webhook to bypass RLS for upserts
*/

CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  amount_due NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'open',
  invoice_pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_clinic_id
  ON subscription_invoices(clinic_id);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_stripe_invoice_id
  ON subscription_invoices(stripe_invoice_id);

CREATE POLICY "Clinic owners can view their subscription invoices"
  ON subscription_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = subscription_invoices.clinic_id
        AND user_clinics.user_id = auth.uid()
        AND user_clinics.role = 'owner'
    )
  );
