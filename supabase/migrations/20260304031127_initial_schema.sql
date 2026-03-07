/*
  # Initial Database Schema

  ## Summary
  Creates the foundational schema for a multi-tenant Practice Management System (PMS) with clinic isolation.

  ## 1. New Tables

  ### `clinics`
  Multi-tenant clinic organizations
  - `id` (uuid, primary key)
  - `name` (text) - Clinic name
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `user_clinics`
  Junction table linking users to clinics with roles
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `clinic_id` (uuid, foreign key to clinics)
  - `role` (text) - User role: owner, admin, staff
  - `created_at` (timestamptz)
  - UNIQUE constraint on (user_id, clinic_id)

  ### `patients`
  Patient records per clinic
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, foreign key to clinics)
  - `first_name` (text)
  - `last_name` (text)
  - `email` (text)
  - `phone` (text)
  - `date_of_birth` (date)
  - `gender` (text) - male, female, other
  - `address` (text)
  - `medical_notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `providers`
  Healthcare providers per clinic
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, foreign key to clinics)
  - `user_id` (uuid, foreign key to auth.users, nullable)
  - `name` (text)
  - `specialization` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `provider_availability`
  Weekly availability schedule for providers
  - `id` (uuid, primary key)
  - `provider_id` (uuid, foreign key to providers)
  - `day_of_week` (integer) - 0=Sunday, 6=Saturday
  - `start_time` (time)
  - `end_time` (time)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `appointments`
  Patient appointments with providers
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, foreign key to clinics)
  - `patient_id` (uuid, foreign key to patients)
  - `provider_id` (uuid, foreign key to providers, nullable)
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `status` (text) - scheduled, confirmed, completed, cancelled
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Clinic isolation: users can only access data for their assigned clinics
*/

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_clinics junction table
CREATE TABLE IF NOT EXISTS user_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Create patients table
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

-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create provider_availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
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

-- Create indexes
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

-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Clinics Policies
CREATE POLICY "Users can view their clinics"
  ON clinics FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their clinics"
  ON clinics FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their clinics"
  ON clinics FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- User Clinics Policies
CREATE POLICY "Users can view their clinic memberships"
  ON user_clinics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships"
  ON user_clinics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their clinic memberships"
  ON user_clinics FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave clinics"
  ON user_clinics FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Patients Policies
CREATE POLICY "Users can view patients from their clinics"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = patients.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients in their clinics"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = patients.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update patients in their clinics"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = patients.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = patients.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patients from their clinics"
  ON patients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = patients.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

-- Providers Policies
CREATE POLICY "Clinic members can view providers"
  ON providers FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic members can create providers"
  ON providers FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic members can update providers"
  ON providers FOR UPDATE
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

CREATE POLICY "Clinic members can delete providers"
  ON providers FOR DELETE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id
      FROM user_clinics
      WHERE user_id = auth.uid()
    )
  );

-- Provider Availability Policies
CREATE POLICY "Clinic members can view provider availability"
  ON provider_availability FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM providers
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clinic members can create provider availability"
  ON provider_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IN (
      SELECT id FROM providers
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clinic members can update provider availability"
  ON provider_availability FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM providers
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM providers
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clinic members can delete provider availability"
  ON provider_availability FOR DELETE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM providers
      WHERE clinic_id IN (
        SELECT clinic_id
        FROM user_clinics
        WHERE user_id = auth.uid()
      )
    )
  );

-- Appointments Policies
CREATE POLICY "Users can view appointments from their clinics"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointments.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments in their clinics"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointments.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments in their clinics"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointments.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointments.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments from their clinics"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_clinics
      WHERE user_clinics.clinic_id = appointments.clinic_id
      AND user_clinics.user_id = auth.uid()
    )
  );