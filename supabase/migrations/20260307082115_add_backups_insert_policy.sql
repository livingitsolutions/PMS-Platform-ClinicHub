/*
  # Add INSERT policy for backups table

  Allows authenticated users to create backups for clinics they belong to.
*/

CREATE POLICY "Clinic members can create backups"
  ON backups FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
    )
  );
