/*
  # Remove auto-create clinic trigger on signup

  ## Problem
  The `create_clinic_for_user` trigger was firing on every new user signup and
  auto-creating a generic "My Clinic" with no real details. This is incorrect
  behavior — new users should go through the onboarding flow to create their
  clinic with proper name, address, phone, and email.

  ## Changes
  - Drop the `create_clinic_for_user` trigger from auth.users
  - Drop the `create_clinic_for_user` function
  - The onboarding flow (CreateClinicPage + create_clinic_for_authenticated_user RPC)
    already handles clinic creation correctly after signup
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS create_clinic_for_user();
