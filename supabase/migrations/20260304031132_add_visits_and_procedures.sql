/*
  # Add Medical Visits and Treatments Schema

  ## Summary
  This migration adds support for medical visits, procedures, and the ability to track
  which procedures were performed during each visit.

  ## 1. New Tables

  ### `procedures`
  Catalog of medical procedures/treatments available at each clinic
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, foreign key to clinics)
  - `name` (text) - Procedure name
  - `description` (text) - Detailed description
  - `base_cost` (numeric) - Default cost for this procedure
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `visits`
  Medical visits/encounters between patients and providers
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, foreign key to clinics)
  - `appointment_id` (uuid, foreign key to appointments, nullable)
  - `patient_id` (uuid, foreign key to patients)
  - `provider_id` (uuid, foreign key to providers)
  - `status` (text) - Visit status (scheduled, in_progress, completed, cancelled)
  - `chief_complaint` (text) - Patient's primary concern
  - `diagnosis` (text) - Provider's diagnosis
  - `notes` (text) - Visit notes
  - `visit_date` (timestamptz) - Date and time of visit
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `visit_procedures`
  Junction table linking visits to procedures performed
  - `id` (uuid, primary key)
  - `visit_id` (uuid, foreign key to visits)
  - `procedure_id` (uuid, foreign key to procedures)
  - `quantity` (integer) - Number of times procedure performed
  - `price` (numeric) - Actual price charged (may differ from base_cost)
  - `notes` (text) - Procedure-specific notes
  - `created_at` (timestamptz)

  ## 2. Indexes
  - `procedures(clinic_id)` - Fast lookup by clinic
  - `visits(clinic_id)` - Fast lookup by clinic
  - `visits(patient_id)` - Fast lookup by patient
  - `visits(appointment_id)` - Fast lookup by appointment
  - `visit_procedures(visit_id)` - Fast lookup of procedures for a visit
  - `visit_procedures(procedure_id)` - Fast lookup of visits for a procedure

  ## 3. Security
  - Enable RLS on all new tables
  - Apply clinic isolation pattern: users can only access data for clinics they belong to
  - Policies for SELECT, INSERT, UPDATE, DELETE on all tables
*/

-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  base_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'scheduled',
  chief_complaint text DEFAULT '',
  diagnosis text DEFAULT '',
  notes text DEFAULT '',
  visit_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_visit_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Create visit_procedures junction table
CREATE TABLE IF NOT EXISTS visit_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES procedures(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT non_negative_price CHECK (price >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id ON procedures(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id ON visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_appointment_id ON visits(appointment_id);
CREATE INDEX IF NOT EXISTS idx_visit_procedures_visit_id ON visit_procedures(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_procedures_procedure_id ON visit_procedures(procedure_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_procedures_timestamp
BEFORE UPDATE ON procedures
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_visits_timestamp
BEFORE UPDATE ON visits
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Enable Row Level Security
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for procedures table
CREATE POLICY "Users can view procedures from their clinics"
  ON procedures FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create procedures in their clinics"
  ON procedures FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update procedures in their clinics"
  ON procedures FOR UPDATE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete procedures from their clinics"
  ON procedures FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for visits table
CREATE POLICY "Users can view visits from their clinics"
  ON visits FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create visits in their clinics"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update visits in their clinics"
  ON visits FOR UPDATE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete visits from their clinics"
  ON visits FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for visit_procedures table
CREATE POLICY "Users can view visit procedures from their clinics"
  ON visit_procedures FOR SELECT
  TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM visits
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create visit procedures in their clinics"
  ON visit_procedures FOR INSERT
  TO authenticated
  WITH CHECK (
    visit_id IN (
      SELECT id FROM visits
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update visit procedures in their clinics"
  ON visit_procedures FOR UPDATE
  TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM visits
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    visit_id IN (
      SELECT id FROM visits
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete visit procedures from their clinics"
  ON visit_procedures FOR DELETE
  TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM visits
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );