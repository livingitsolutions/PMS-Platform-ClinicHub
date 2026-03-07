
/*
  # Fix user_clinics UPDATE policy — owner-only role changes

  ## Summary
  Replaces the existing UPDATE policy on `user_clinics` which allowed any member
  to update their own row (including their own role) with a stricter policy that
  only permits clinic owners to update membership rows.

  ## Changes
  - Drops: "Users can update their clinic memberships" (allowed self-updates, including role)
  - Adds:  "Clinic owners can update memberships in their clinic"
    - USING: the authenticated user must have role = 'owner' for that clinic_id
    - WITH CHECK: same condition, preventing a row from being moved to a clinic
      where the acting user is not an owner

  ## Security
  - Non-owners can no longer update any row in user_clinics, including their own role
  - Only a user who already holds role = 'owner' for a given clinic_id may update rows
    in that clinic
*/

DROP POLICY IF EXISTS "Users can update their clinic memberships" ON user_clinics;

CREATE POLICY "Clinic owners can update memberships in their clinic"
  ON user_clinics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics uc
      WHERE uc.clinic_id = user_clinics.clinic_id
        AND uc.user_id = auth.uid()
        AND uc.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics uc
      WHERE uc.clinic_id = user_clinics.clinic_id
        AND uc.user_id = auth.uid()
        AND uc.role = 'owner'
    )
  );
