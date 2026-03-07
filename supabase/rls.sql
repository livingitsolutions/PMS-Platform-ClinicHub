-- Enable Row Level Security on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_procedures ENABLE ROW LEVEL SECURITY;

-- Clinics Policies
-- Users can view clinics they belong to
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

-- Users can update clinics they belong to
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

-- Users can delete clinics they belong to
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
-- Users can view their own clinic memberships
CREATE POLICY "Users can view their clinic memberships"
  ON user_clinics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own clinic memberships
CREATE POLICY "Users can insert their own memberships"
  ON user_clinics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own clinic memberships
CREATE POLICY "Users can update their clinic memberships"
  ON user_clinics FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own clinic memberships
CREATE POLICY "Users can leave clinics"
  ON user_clinics FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Patients Policies
-- Users can view patients from clinics they belong to
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

-- Users can insert patients for clinics they belong to
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

-- Users can update patients from clinics they belong to
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

-- Users can delete patients from clinics they belong to
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
-- Clinic members can view providers from their clinics
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

-- Clinic members can create providers in their clinics
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

-- Clinic members can update providers in their clinics
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

-- Clinic members can delete providers from their clinics
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
-- Clinic members can view provider availability
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

-- Clinic members can create provider availability
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

-- Clinic members can update provider availability
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

-- Clinic members can delete provider availability
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
-- Users can view appointments from clinics they belong to
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

-- Users can insert appointments for clinics they belong to
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

-- Users can update appointments from clinics they belong to
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

-- Users can delete appointments from clinics they belong to
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

-- Procedures Policies
-- Users can view procedures from clinics they belong to
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

-- Users can insert procedures for clinics they belong to
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

-- Users can update procedures from clinics they belong to
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

-- Users can delete procedures from clinics they belong to
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

-- Visits Policies
-- Users can view visits from clinics they belong to
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

-- Users can insert visits for clinics they belong to
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

-- Users can update visits from clinics they belong to
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

-- Users can delete visits from clinics they belong to
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

-- Visit Procedures Policies
-- Users can view visit procedures from clinics they belong to
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

-- Users can insert visit procedures for clinics they belong to
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

-- Users can update visit procedures from clinics they belong to
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

-- Users can delete visit procedures from clinics they belong to
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
