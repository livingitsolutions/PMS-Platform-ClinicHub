/*
  # Add Appointment Reminders System

  1. New Table
    - `appointment_reminders`
      - `id` (uuid, primary key) - Unique reminder identifier
      - `appointment_id` (uuid, foreign key) - Links to appointment
      - `clinic_id` (uuid, foreign key) - Links to clinic for filtering
      - `reminder_time` (timestamptz) - When to send the reminder
      - `sent` (boolean) - Whether reminder has been sent
      - `created_at` (timestamptz) - When reminder was created

  2. Security
    - Enable RLS on `appointment_reminders` table
    - Add policies for authenticated users to manage reminders for their clinic

  3. Triggers
    - Automatically create reminder 24 hours before appointment when appointment is created
    - Handle appointment updates to adjust reminder time

  4. Important Notes
    - Reminders are created automatically via trigger
    - Reminders filter by clinic_id for multi-tenancy
    - Only unsent reminders with past reminder_time are processed
*/

-- Create appointment_reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  reminder_time timestamptz NOT NULL,
  sent boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for efficient querying of pending reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_pending 
  ON appointment_reminders(clinic_id, sent, reminder_time) 
  WHERE sent = false;

-- Create index for appointment_id lookups
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id 
  ON appointment_reminders(appointment_id);

-- Enable RLS
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reminders for their clinic appointments
CREATE POLICY "Users can view reminders for their clinic"
  ON appointment_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = appointment_reminders.clinic_id
      AND clinic_users.user_id = auth.uid()
    )
  );

-- Policy: Users can insert reminders for their clinic appointments
CREATE POLICY "Users can create reminders for their clinic"
  ON appointment_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = appointment_reminders.clinic_id
      AND clinic_users.user_id = auth.uid()
    )
  );

-- Policy: Users can update reminders for their clinic
CREATE POLICY "Users can update reminders for their clinic"
  ON appointment_reminders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = appointment_reminders.clinic_id
      AND clinic_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_users
      WHERE clinic_users.clinic_id = appointment_reminders.clinic_id
      AND clinic_users.user_id = auth.uid()
    )
  );

-- Function to create reminder for new appointment
CREATE OR REPLACE FUNCTION create_appointment_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Create reminder 24 hours (1 day) before appointment
  INSERT INTO appointment_reminders (
    appointment_id,
    clinic_id,
    reminder_time
  ) VALUES (
    NEW.id,
    NEW.clinic_id,
    NEW.start_time - INTERVAL '24 hours'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create reminder when appointment is created
DROP TRIGGER IF EXISTS trigger_create_appointment_reminder ON appointments;
CREATE TRIGGER trigger_create_appointment_reminder
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_reminder();

-- Function to update reminder when appointment time changes
CREATE OR REPLACE FUNCTION update_appointment_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if start_time changed and reminder hasn't been sent yet
  IF OLD.start_time IS DISTINCT FROM NEW.start_time THEN
    UPDATE appointment_reminders
    SET reminder_time = NEW.start_time - INTERVAL '24 hours'
    WHERE appointment_id = NEW.id
      AND sent = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reminder when appointment time is updated
DROP TRIGGER IF EXISTS trigger_update_appointment_reminder ON appointments;
CREATE TRIGGER trigger_update_appointment_reminder
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_reminder();
