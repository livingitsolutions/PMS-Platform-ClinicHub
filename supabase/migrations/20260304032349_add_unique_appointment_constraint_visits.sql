/*
  # Add Unique Constraint for Appointment to Visit Mapping

  ## Summary
  Ensures each appointment can only have one associated visit, preventing duplicate visit creation.

  ## Changes
  - Add UNIQUE constraint on appointment_id in visits table
  - Ensures one-to-one relationship between appointments and visits
  - Prevents accidental duplicate visit creation from the same appointment

  ## Impact
  - Enforces data integrity for appointment-visit relationship
  - Enables safe "get or create" logic for visit creation from appointments
  - Database will reject attempts to create multiple visits for same appointment
*/

-- Add unique constraint to ensure one visit per appointment
ALTER TABLE visits
ADD CONSTRAINT unique_visit_per_appointment
UNIQUE (appointment_id);
