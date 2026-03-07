/*
  # Add backups table

  1. New Tables
    - `backups`
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics, nullable for system-wide backups)
      - `backup_time` (timestamptz) - when the backup was created
      - `backup_status` (text) - status of the backup (pending, in_progress, completed, failed)
      - `storage_url` (text) - URL or path to the backup file
      - `backup_size` (bigint) - size of the backup in bytes
      - `backup_type` (text) - type of backup (full, incremental, differential)
      - `error_message` (text) - error message if backup failed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `backups` table
    - Add policy for authenticated users to view backups for their clinics
    - Add policy for service role to manage all backups

  3. Indexes
    - Index on clinic_id for fast clinic backup lookups
    - Index on backup_time for sorting by date
    - Index on backup_status for filtering by status

  4. Notes
    - Backups can be clinic-specific or system-wide (clinic_id NULL)
    - The storage_url stores the location of the backup file
    - Backup status tracks the lifecycle: pending -> in_progress -> completed/failed
*/

CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  backup_time timestamptz DEFAULT now() NOT NULL,
  backup_status text DEFAULT 'pending' NOT NULL,
  storage_url text,
  backup_size bigint DEFAULT 0,
  backup_type text DEFAULT 'full' NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backups_clinic_id ON backups(clinic_id);
CREATE INDEX IF NOT EXISTS idx_backups_backup_time ON backups(backup_time DESC);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(backup_status);

ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view backups for their clinics"
  ON backups FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_users 
      WHERE user_id = auth.uid()
    )
    OR clinic_id IS NULL
  );

CREATE POLICY "Service role can manage all backups"
  ON backups FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
