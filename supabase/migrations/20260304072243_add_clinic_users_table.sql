/*
  # Add Multi-Clinic Membership Support

  1. New Tables
    - `clinic_users`
      - `id` (uuid, primary key) - Unique identifier for the clinic-user relationship
      - `clinic_id` (uuid, foreign key) - References clinics table
      - `user_id` (uuid, foreign key) - References auth.users table
      - `role` (text) - User role within the clinic (owner, admin, staff)
      - `created_at` (timestamptz) - Timestamp when user was added to clinic

  2. Constraints
    - Unique constraint on (clinic_id, user_id) to prevent duplicate memberships
    - Check constraint on role to ensure valid values only
    - Foreign key constraints with cascade delete

  3. Security
    - Enable RLS on clinic_users table
    - Add policies for authenticated users to read their own clinic memberships
    - Add policies for clinic owners/admins to manage memberships

  4. Important Notes
    - This table enables users to belong to multiple clinics
    - Each clinic-user relationship has a role for fine-grained permissions
    - Existing clinic queries remain unchanged as they filter by clinic_id
*/

CREATE TABLE IF NOT EXISTS clinic_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clinic_users_clinic_id_user_id_key'
  ) THEN
    ALTER TABLE clinic_users ADD CONSTRAINT clinic_users_clinic_id_user_id_key UNIQUE (clinic_id, user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clinic_users_user_id ON clinic_users(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_users_clinic_id ON clinic_users(clinic_id);

ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic memberships"
  ON clinic_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clinic owners can insert clinic memberships"
  ON clinic_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = clinic_users.clinic_id
      AND clinic_users.user_id = auth.uid()
      AND clinic_users.role = 'owner'
    )
  );

CREATE POLICY "Clinic owners can update clinic memberships"
  ON clinic_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users AS cu
      WHERE cu.clinic_id = clinic_users.clinic_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_users AS cu
      WHERE cu.clinic_id = clinic_users.clinic_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'owner'
    )
  );

CREATE POLICY "Clinic owners can delete clinic memberships"
  ON clinic_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users AS cu
      WHERE cu.clinic_id = clinic_users.clinic_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'owner'
    )
  );
