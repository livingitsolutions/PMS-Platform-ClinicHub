/*
  # Fix signup trigger - use SECURITY DEFINER to bypass RLS

  ## Problem
  The `create_clinic_for_user` trigger fires on auth.users INSERT during signup.
  At that point RLS blocks the inserts because:
  1. `clinics` has no INSERT policy
  2. The user context is not yet fully established

  ## Fix
  - Recreate the trigger function with SECURITY DEFINER so it runs as the
    function owner (postgres) and bypasses RLS checks during the signup flow.
  - Add an INSERT policy on clinics so authenticated users can also create
    clinics manually (e.g., from the onboarding flow).
*/

CREATE OR REPLACE FUNCTION create_clinic_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_clinic_id uuid;
BEGIN
  INSERT INTO clinics (name)
  VALUES ('My Clinic')
  RETURNING id INTO new_clinic_id;

  INSERT INTO user_clinics (user_id, clinic_id, role)
  VALUES (NEW.id, new_clinic_id, 'owner');

  RETURN NEW;
END;
$$;

CREATE POLICY "Authenticated users can create clinics"
  ON clinics FOR INSERT
  TO authenticated
  WITH CHECK (true);
