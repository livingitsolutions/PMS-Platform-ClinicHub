/*
  # Add create_clinic RPC function

  ## Purpose
  The onboarding flow needs to create a clinic and simultaneously become its owner.
  Due to RLS ordering (SELECT policy on clinics requires a user_clinics row, which
  doesn't exist yet when inserting), we use a SECURITY DEFINER function to perform
  both operations atomically and return the new clinic data.

  ## New Functions
  - `create_clinic_for_authenticated_user` - Creates a clinic and owner membership in one call,
    returns the newly created clinic row. Runs as SECURITY DEFINER to bypass RLS ordering issues.
*/

CREATE OR REPLACE FUNCTION create_clinic_for_authenticated_user(
  p_name text,
  p_address text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_clinic_id uuid;
  result json;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO clinics (name, address, phone, email)
  VALUES (p_name, p_address, p_phone, p_email)
  RETURNING id INTO new_clinic_id;

  INSERT INTO user_clinics (user_id, clinic_id, role)
  VALUES (auth.uid(), new_clinic_id, 'owner');

  SELECT row_to_json(c) INTO result
  FROM clinics c
  WHERE c.id = new_clinic_id;

  RETURN result;
END;
$$;
