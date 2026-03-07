/*
  # Add Invoices and Payments System

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `visit_id` (uuid, foreign key to visits)
      - `status` (text) - unpaid, partial, paid, void
      - `total_amount` (numeric) - total invoice amount
      - `amount_paid` (numeric) - total paid so far
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `payments`
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `invoice_id` (uuid, foreign key to invoices)
      - `amount` (numeric) - payment amount
      - `method` (text) - cash, card, bank_transfer, other
      - `notes` (text) - optional notes
      - `created_at` (timestamptz)

  2. Constraints
    - Invoice status must be one of: unpaid, partial, paid, void
    - Payment method must be one of: cash, card, bank_transfer, other
    - Each visit can only have one invoice (unique constraint)

  3. Indexes
    - Index on invoices.clinic_id for faster clinic-based queries
    - Index on invoices.visit_id for faster visit lookups
    - Index on payments.invoice_id for faster invoice payment lookups

  4. Security
    - Enable RLS on both tables
    - Users can only access invoices/payments from their assigned clinics
    - All operations (SELECT, INSERT, UPDATE, DELETE) restricted by clinic membership
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unpaid',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT invoices_status_check CHECK (status IN ('unpaid', 'partial', 'paid', 'void')),
  CONSTRAINT invoices_visit_unique UNIQUE (visit_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  method text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT payments_method_check CHECK (method IN ('cash', 'card', 'bank_transfer', 'other'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_visit ON invoices(visit_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices from their clinics"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices in their clinics"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices in their clinics"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoices from their clinics"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view payments from their clinic invoices"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create payments for their clinic invoices"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update payments for their clinic invoices"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete payments from their clinic invoices"
  ON payments
  FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );