/*
  # Create clinic-backups storage bucket

  Creates a private storage bucket for storing clinic data export files (JSON).
  Access is restricted to authenticated users who belong to the clinic being backed up.

  1. New Storage Bucket
    - `clinic-backups` — private bucket for JSON backup files
  2. Security
    - Authenticated users can read their own clinic's backups
    - Service role has full access (used by the edge function)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-backups',
  'clinic-backups',
  false,
  524288000,
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Clinic members can read their backups"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'clinic-backups'
    AND EXISTS (
      SELECT 1 FROM public.user_clinics
      WHERE user_clinics.clinic_id::text = (storage.foldername(name))[1]
        AND user_clinics.user_id = auth.uid()
    )
  );
