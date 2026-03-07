/*
  # Add Unique Constraint to Visit Procedures

  ## Summary
  Adds a unique constraint to prevent duplicate procedures from being added to the same visit.

  ## Changes
  - Add UNIQUE constraint on (visit_id, procedure_id) to visit_procedures table
  - Ensures each procedure can only be added once per visit
  - The quantity field should be used for multiple units instead

  ## Impact
  - Prevents data integrity issues with duplicate procedures
  - Forces proper use of the quantity field
*/

-- Add unique constraint to prevent duplicate procedures per visit
ALTER TABLE visit_procedures
ADD CONSTRAINT unique_visit_procedure
UNIQUE (visit_id, procedure_id);
