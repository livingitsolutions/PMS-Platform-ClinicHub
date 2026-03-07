/*
  # Add delete policy for backups table

  Allows clinic members to delete backups belonging to their clinics.
*/

CREATE POLICY "Clinic members can delete backups"
  ON backups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = backups.clinic_id
        AND user_clinics.user_id = auth.uid()
    )
  );
