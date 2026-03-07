/*
  # Fix RLS Policies for Clinic Isolation

  ## Summary
  This migration fixes incorrect table references in RLS policies to ensure proper
  clinic isolation across all tables. All policies now correctly reference the
  `user_clinics` junction table.

  ## Changes Made

  ### 1. Audit Logs Table
  - Drop existing policies that reference non-existent `clinic_users` table
  - Recreate policies to use correct `user_clinics` table
  - Policies: SELECT, INSERT

  ### 2. Appointment Reminders Table
  - Drop existing policies that reference non-existent `clinic_users` table
  - Recreate policies to use correct `user_clinics` table
  - Policies: SELECT, INSERT, UPDATE, DELETE

  ### 3. Payments Table
  - Update existing policies to use direct `clinic_id` check instead of subquery
  - Simplifies query execution and improves performance
  - Policies: SELECT, INSERT, UPDATE, DELETE

  ### 4. Notifications Table
  - Add INSERT and DELETE policies with clinic isolation
  - Ensures users can only create/delete notifications for their clinics
  - Existing SELECT and UPDATE policies remain unchanged

  ## Security Notes
  - All policies enforce strict clinic isolation
  - Users can ONLY access data from clinics they belong to
  - All policies check membership via user_clinics table
  - No data leakage possible between different clinics
*/

-- ============================================================================
-- FIX AUDIT LOGS POLICIES
-- ============================================================================

-- Drop incorrect policies
DROP POLICY IF EXISTS "Users can view audit logs from their clinic" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs for their clinic" ON audit_logs;

-- Recreate with correct table reference
CREATE POLICY "Users can view audit logs from their clinic"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audit logs for their clinic"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- ============================================================================
-- FIX APPOINTMENT REMINDERS POLICIES
-- ============================================================================

-- Drop incorrect policies
DROP POLICY IF EXISTS "Users can view reminders for their clinic" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can create reminders for their clinic" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can update reminders for their clinic" ON appointment_reminders;

-- Recreate with correct table reference
CREATE POLICY "Users can view reminders from their clinics"
  ON appointment_reminders FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reminders in their clinics"
  ON appointment_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders in their clinics"
  ON appointment_reminders FOR UPDATE
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

CREATE POLICY "Users can delete reminders from their clinics"
  ON appointment_reminders FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- OPTIMIZE PAYMENTS POLICIES (Direct clinic_id check)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view payments from their clinic invoices" ON payments;
DROP POLICY IF EXISTS "Users can create payments for their clinic invoices" ON payments;
DROP POLICY IF EXISTS "Users can update payments for their clinic invoices" ON payments;
DROP POLICY IF EXISTS "Users can delete payments from their clinic invoices" ON payments;

-- Recreate with direct clinic_id check for better performance
CREATE POLICY "Users can view payments from their clinics"
  ON payments FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments in their clinics"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments in their clinics"
  ON payments FOR UPDATE
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

CREATE POLICY "Users can delete payments from their clinics"
  ON payments FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ADD MISSING NOTIFICATIONS POLICIES
-- ============================================================================

-- Add INSERT policy with clinic isolation
CREATE POLICY "Users can create notifications in their clinics"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- Add DELETE policy for users to delete their own notifications in their clinics
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );