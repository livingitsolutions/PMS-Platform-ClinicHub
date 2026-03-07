/*
  # Add Automatic Invoice Recalculation System

  1. New Function
    - `recalculate_invoice_total_for_visit(visit_id uuid)`
      - Calculates total from visit_procedures (SUM(quantity * price))
      - Updates invoices.total_amount for the given visit
      - Updates invoices.updated_at timestamp
      - Only executes if an invoice exists for the visit

  2. New Triggers on visit_procedures
    - `trigger_recalculate_invoice_on_insert`
      - Fires AFTER INSERT on visit_procedures
      - Calls recalculation function
    
    - `trigger_recalculate_invoice_on_update`
      - Fires AFTER UPDATE on visit_procedures
      - Calls recalculation function when quantity or price changes
    
    - `trigger_recalculate_invoice_on_delete`
      - Fires AFTER DELETE on visit_procedures
      - Calls recalculation function

  3. Behavior
    - Automatically keeps invoice totals in sync with visit procedures
    - No manual API calls needed for recalculation
    - Handles all CRUD operations on visit_procedures
    - Safe when no invoice exists (no-op)

  4. Important Notes
    - Function is idempotent (safe to call multiple times)
    - Triggers fire at row level for each affected procedure
    - Amount paid and invoice status remain unchanged
    - Only total_amount is recalculated
*/

-- Create function to recalculate invoice total for a given visit
CREATE OR REPLACE FUNCTION recalculate_invoice_total_for_visit(p_visit_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_total numeric(10,2);
BEGIN
  -- Calculate the new total from visit_procedures
  SELECT COALESCE(SUM(quantity * price), 0)
  INTO v_new_total
  FROM visit_procedures
  WHERE visit_id = p_visit_id;

  -- Update the invoice with the new total (only if changed)
  UPDATE invoices
  SET
    total_amount = v_new_total,
    updated_at = now()
  WHERE visit_id = p_visit_id
    AND total_amount IS DISTINCT FROM v_new_total;
END;
$$;

-- Create trigger function for INSERT on visit_procedures
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_on_procedure_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM recalculate_invoice_total_for_visit(NEW.visit_id);
  RETURN NEW;
END;
$$;

-- Create trigger function for UPDATE on visit_procedures
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_on_procedure_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM recalculate_invoice_total_for_visit(NEW.visit_id);
  RETURN NEW;
END;
$$;

-- Create trigger function for DELETE on visit_procedures
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_on_procedure_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM recalculate_invoice_total_for_visit(OLD.visit_id);
  RETURN OLD;
END;
$$;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_recalculate_invoice_on_insert ON visit_procedures;
CREATE TRIGGER trigger_recalculate_invoice_on_insert
  AFTER INSERT ON visit_procedures
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_on_procedure_insert();

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_recalculate_invoice_on_update ON visit_procedures;
CREATE TRIGGER trigger_recalculate_invoice_on_update
  AFTER UPDATE ON visit_procedures
  FOR EACH ROW
  WHEN (
    OLD.quantity IS DISTINCT FROM NEW.quantity OR
    OLD.price IS DISTINCT FROM NEW.price
  )
  EXECUTE FUNCTION trigger_recalculate_invoice_on_procedure_update();

-- Create trigger for DELETE
DROP TRIGGER IF EXISTS trigger_recalculate_invoice_on_delete ON visit_procedures;
CREATE TRIGGER trigger_recalculate_invoice_on_delete
  AFTER DELETE ON visit_procedures
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_on_procedure_delete();