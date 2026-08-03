CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_clinics_timestamp BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_patients_timestamp BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_providers_timestamp BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_provider_availability_timestamp BEFORE UPDATE ON provider_availability FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_appointments_timestamp BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_procedures_timestamp BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_visits_timestamp BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_invoices_timestamp BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_subscriptions_timestamp BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER set_backups_timestamp BEFORE UPDATE ON backups FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION recalculate_invoice_total_for_visit(p_visit_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  new_total numeric(10,2);
BEGIN
  SELECT coalesce(sum(quantity * price), 0) INTO new_total
  FROM visit_procedures WHERE visit_id = p_visit_id;
  UPDATE invoices SET total_amount = new_total, updated_at = now()
  WHERE visit_id = p_visit_id AND total_amount IS DISTINCT FROM new_total;
END;
$$;

CREATE OR REPLACE FUNCTION recalculate_invoice_after_visit_procedure_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM recalculate_invoice_total_for_visit(coalesce(NEW.visit_id, OLD.visit_id));
  RETURN coalesce(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_recalculate_invoice_on_insert
AFTER INSERT ON visit_procedures FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_after_visit_procedure_change();
CREATE TRIGGER trigger_recalculate_invoice_on_update
AFTER UPDATE OF quantity, price ON visit_procedures FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_after_visit_procedure_change();
CREATE TRIGGER trigger_recalculate_invoice_on_delete
AFTER DELETE ON visit_procedures FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_after_visit_procedure_change();

CREATE OR REPLACE FUNCTION create_appointment_reminder()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO appointment_reminders (appointment_id, clinic_id, reminder_time)
  VALUES (NEW.id, NEW.clinic_id, NEW.start_time - interval '24 hours');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_appointment_reminder()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.start_time IS DISTINCT FROM NEW.start_time THEN
    UPDATE appointment_reminders
    SET reminder_time = NEW.start_time - interval '24 hours'
    WHERE appointment_id = NEW.id AND sent = false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_appointment_reminder
AFTER INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION create_appointment_reminder();
CREATE TRIGGER trigger_update_appointment_reminder
AFTER UPDATE OF start_time ON appointments FOR EACH ROW EXECUTE FUNCTION update_appointment_reminder();
