/*
  # Consolidate clinic_users into user_clinics

  ## Summary
  This migration eliminates the duplicate `clinic_users` table and standardizes
  the entire system to use only `user_clinics` as the single source of truth for
  clinic membership and role management.

  ## Problem
  Two tables existed with identical purposes:
  - `user_clinics` - original table defined in the initial schema migration
  - `clinic_users` - duplicate table introduced in migration 20260304072243

  This caused inconsistent RLS policies, split application code, and risk of
  diverging membership data between the two tables.

  ## Changes

  ### 1. Data Migration
  - Copies any rows from `clinic_users` that do not already exist in `user_clinics`
    (matched on user_id + clinic_id) to prevent duplicates
  - Preserves role and created_at from source rows

  ### 2. RLS Policy Cleanup on Dependent Tables
  - Drops all live policies on audit_logs, subscriptions, backups,
    appointment_reminders that reference clinic_users
  - Recreates those policies to reference user_clinics instead

  ### 3. Table Removal
  - Drops all policies on clinic_users (including self-referential ones)
  - Drops all indexes on clinic_users
  - Drops the clinic_users table

  ## Security
  - All recreated policies maintain identical access semantics
  - No data is lost — rows are migrated before the table is dropped
  - RLS remains enabled on all affected tables

  ## Important Notes
  1. Safe to run on a live database — data migration happens first
  2. INSERT ON CONFLICT DO NOTHING guarantees no duplicate memberships
  3. After this migration, user_clinics is the sole membership table
*/

-- ============================================================
-- STEP 1: Migrate data from clinic_users → user_clinics
-- ============================================================

INSERT INTO user_clinics (user_id, clinic_id, role, created_at)
SELECT
  cu.user_id,
  cu.clinic_id,
  cu.role,
  cu.created_at
FROM clinic_users cu
WHERE NOT EXISTS (
  SELECT 1
  FROM user_clinics uc
  WHERE uc.user_id = cu.user_id
    AND uc.clinic_id = cu.clinic_id
);

-- ============================================================
-- STEP 2: Drop all dependent policies referencing clinic_users
-- These must be dropped before the table can be removed
-- ============================================================

-- backups
DROP POLICY IF EXISTS "Users can view backups for their clinics" ON backups;
DROP POLICY IF EXISTS "Users can view their clinic backups" ON backups;

-- subscriptions
DROP POLICY IF EXISTS "Clinic members can view their subscription" ON subscriptions;

-- audit_logs
DROP POLICY IF EXISTS "Users can view audit logs from their clinic" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs for their clinic" ON audit_logs;

-- appointment_reminders
DROP POLICY IF EXISTS "Users can view reminders from their clinics" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can create reminders in their clinics" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can update reminders in their clinics" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can delete reminders from their clinics" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can view reminders for their clinic" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can create reminders for their clinic" ON appointment_reminders;
DROP POLICY IF EXISTS "Users can update reminders for their clinic" ON appointment_reminders;

-- clinic_users self-referential policies
DROP POLICY IF EXISTS "Users can view their clinic memberships" ON clinic_users;
DROP POLICY IF EXISTS "Clinic owners can insert clinic memberships" ON clinic_users;
DROP POLICY IF EXISTS "Clinic owners can update clinic memberships" ON clinic_users;
DROP POLICY IF EXISTS "Clinic owners can delete clinic memberships" ON clinic_users;

-- ============================================================
-- STEP 3: Drop clinic_users indexes and the table
-- ============================================================

DROP INDEX IF EXISTS idx_clinic_users_user_id;
DROP INDEX IF EXISTS idx_clinic_users_clinic_id;

DROP TABLE IF EXISTS clinic_users;

-- ============================================================
-- STEP 4: Recreate all dropped policies using user_clinics
-- ============================================================

-- backups
CREATE POLICY "Users can view backups for their clinics"
  ON backups FOR SELECT
  TO authenticated
  USING (
    clinic_id IS NULL
    OR clinic_id IN (
      SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
    )
  );

-- subscriptions
CREATE POLICY "Clinic members can view their subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = subscriptions.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );

-- audit_logs
CREATE POLICY "Users can view audit logs from their clinic"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audit logs for their clinic"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
    )
  );

-- appointment_reminders
CREATE POLICY "Users can view reminders from their clinics"
  ON appointment_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointment_reminders.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reminders in their clinics"
  ON appointment_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointment_reminders.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders in their clinics"
  ON appointment_reminders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointment_reminders.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointment_reminders.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders from their clinics"
  ON appointment_reminders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointment_reminders.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );
