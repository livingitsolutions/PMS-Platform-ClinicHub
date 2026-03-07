/*
  # Add currency fields to clinics table

  ## Summary
  Adds currency support to the clinics table so each clinic can display monetary
  values in their local currency instead of a hardcoded USD symbol.

  ## Changes

  ### Modified Tables
  - `clinics`
    - `currency_code` (TEXT, default 'PHP') — ISO 4217 currency code (e.g. PHP, USD, EUR)
    - `currency_symbol` (TEXT, default '₱') — Display symbol for the currency

  ## Notes
  - Existing rows will automatically receive PHP / ₱ as defaults
  - No data loss: only additive columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'currency_code'
  ) THEN
    ALTER TABLE clinics ADD COLUMN currency_code TEXT DEFAULT 'PHP';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinics' AND column_name = 'currency_symbol'
  ) THEN
    ALTER TABLE clinics ADD COLUMN currency_symbol TEXT DEFAULT '₱';
  END IF;
END $$;
