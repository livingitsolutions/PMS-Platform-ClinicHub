/*
  # Add Audit Logs Table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key) - Unique identifier for each audit log entry
      - `clinic_id` (uuid, not null) - Reference to the clinic where the action occurred
      - `user_id` (uuid, not null) - Reference to the user who performed the action
      - `action` (text, not null) - Description of the action performed (e.g., 'patient_created', 'invoice_paid')
      - `entity_type` (text, not null) - Type of entity affected (e.g., 'patient', 'visit', 'invoice')
      - `entity_id` (uuid, not null) - ID of the entity that was affected
      - `metadata` (jsonb) - Additional contextual information about the action
      - `created_at` (timestamptz, default now()) - Timestamp when the action occurred

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policy for authenticated users to read audit logs from their clinic
    - Audit logs are append-only; no update or delete policies

  3. Indexes
    - Add index on clinic_id for efficient clinic-scoped queries
    - Add index on user_id for user activity tracking
    - Add index on entity_type and entity_id for entity history lookup
    - Add index on created_at for time-based queries

  ## Notes
  - Audit logs provide a complete history of critical actions
  - All write operations should go through the audit helper function
  - Logs are immutable once created (no updates or deletes allowed)
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs from their clinic"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audit logs for their clinic"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );
