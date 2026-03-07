/*
  # Add get_user_id_by_email RPC function

  ## Summary
  Creates a security-definer RPC function that allows authenticated users to look up
  a Supabase auth user's UUID by their email address. This is used by the staff
  management feature when inviting a new staff member to a clinic.

  ## New Functions
  - `get_user_id_by_email(email_input text)` — returns the UUID of the auth user
    with the given email, or NULL if no match. Runs as SECURITY DEFINER so it can
    read `auth.users` without exposing the table directly.

  ## Security Notes
  - Function is granted only to `authenticated` role.
  - Only returns the UUID; no other user data is exposed.
*/

CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_id uuid;
BEGIN
  SELECT id INTO found_id
  FROM auth.users
  WHERE email = email_input
  LIMIT 1;

  RETURN found_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;
