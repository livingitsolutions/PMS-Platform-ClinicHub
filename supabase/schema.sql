-- Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Clinics Junction Table (links users to clinics)
CREATE TABLE IF NOT EXISTS user_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  medical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider Availability Table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Procedures Table (catalog of medical procedures/treatments)
CREATE TABLE IF NOT EXISTS procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  base_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visits Table (medical encounters)
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

-- Visit Procedures Junction Table (links visits to procedures performed)
CREATE TABLE IF NOT EXISTS visit_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES procedures(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT non_negative_price CHECK (price >= 0),
  CONSTRAINT unique_visit_procedure UNIQUE (visit_id, procedure_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_clinics_user_id ON user_clinics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clinics_clinic_id ON user_clinics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_providers_clinic_id ON providers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id ON provider_availability(provider_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_day_time ON provider_availability(provider_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_time ON appointments(provider_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_day ON appointments(provider_id, start_time);
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id ON procedures(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id ON visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_appointment_id ON visits(appointment_id);
CREATE INDEX IF NOT EXISTS idx_visit_procedures_visit_id ON visit_procedures(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_procedures_procedure_id ON visit_procedures(procedure_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at on record modification
CREATE TRIGGER set_clinics_timestamp
BEFORE UPDATE ON clinics
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_providers_timestamp
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_provider_availability_timestamp
BEFORE UPDATE ON provider_availability
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_appointments_timestamp
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_procedures_timestamp
BEFORE UPDATE ON procedures
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_visits_timestamp
BEFORE UPDATE ON visits
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Function to create a clinic for new users
CREATE OR REPLACE FUNCTION create_clinic_for_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create clinic for new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_clinic_for_user();
