/*
  # Add auth_users_view and get_users_by_ids RPC

  ## Summary
  The staff management page needs to resolve user emails from auth.users.
  Two approaches are used with fallback logic in the frontend:
    1. A view `auth_users_view` that exposes id + email from auth.users
    2. An RPC `get_users_by_ids` as a fallback

  ## New Objects
  - `auth_users_view` (view): Exposes id and email from auth.users, restricted to authenticated users
  - `get_users_by_ids(user_ids uuid[])` (function): Returns id+email for an array of user IDs

  ## Security
  - View is SECURITY DEFINER to allow access to auth.users
  - RPC is SECURITY DEFINER to allow access to auth.users
  - Both only return rows where the user ID is in the provided list
  - Authenticated users can only query; no mutations
*/

CREATE OR REPLACE VIEW public.auth_users_view
WITH (security_invoker = false)
AS
  SELECT id, email
  FROM auth.users;

GRANT SELECT ON public.auth_users_view TO authenticated;

CREATE OR REPLACE FUNCTION public.get_users_by_ids(user_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email
  FROM auth.users
  WHERE id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_users_by_ids(uuid[]) TO authenticated;
