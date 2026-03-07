/*
  # Add Performance Indexes for Clinic-Scoped Queries

  1. Overview
    This migration adds strategic indexes to improve query performance across all major tables.
    All indexes are designed to optimize clinic-scoped queries and common access patterns.

  2. Indexes by Table

    **patients**
    - clinic_id - For filtering patients by clinic

    **visits**
    - clinic_id - For filtering visits by clinic
    - (clinic_id, visit_date DESC) - For chronological visit queries within a clinic

    **appointments**
    - clinic_id - For filtering appointments by clinic
    - (clinic_id, start_time) - For scheduling queries and calendar views

    **invoices**
    - clinic_id - For filtering invoices by clinic
    - status - For filtering by payment status (pending, paid, etc.)

    **payments**
    - clinic_id - For filtering payments by clinic
    - invoice_id - For looking up payments by invoice

    **providers**
    - clinic_id - For filtering providers by clinic

    **procedures**
    - clinic_id - For filtering procedures by clinic

    **visit_procedures**
    - visit_id - For looking up procedures performed in a visit

    **clinic_users**
    - user_id - For looking up clinics for a user
    - clinic_id - For looking up users in a clinic

    **notifications**
    - user_id - For fetching user notifications
    - read - For filtering read/unread notifications

    **audit_logs**
    - clinic_id - For filtering audit logs by clinic
    - created_at DESC - For chronological audit log queries

  3. Important Notes
    - All indexes use IF NOT EXISTS to prevent conflicts
    - Composite indexes are ordered for optimal query performance
    - Indexes are designed to support existing RLS policies
    - No changes to existing queries required
*/

-- Patients table indexes
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id 
  ON patients(clinic_id);

-- Visits table indexes
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id 
  ON visits(clinic_id);

CREATE INDEX IF NOT EXISTS idx_visits_clinic_date 
  ON visits(clinic_id, visit_date DESC);

-- Appointments table indexes
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id 
  ON appointments(clinic_id);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start_time 
  ON appointments(clinic_id, start_time);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id 
  ON invoices(clinic_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status 
  ON invoices(status);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_clinic_id 
  ON payments(clinic_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id 
  ON payments(invoice_id);

-- Providers table indexes
CREATE INDEX IF NOT EXISTS idx_providers_clinic_id 
  ON providers(clinic_id);

-- Procedures table indexes
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id 
  ON procedures(clinic_id);

-- Visit procedures table indexes
CREATE INDEX IF NOT EXISTS idx_visit_procedures_visit_id 
  ON visit_procedures(visit_id);

-- Clinic users table indexes
CREATE INDEX IF NOT EXISTS idx_clinic_users_user_id 
  ON clinic_users(user_id);

CREATE INDEX IF NOT EXISTS idx_clinic_users_clinic_id 
  ON clinic_users(clinic_id);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read 
  ON notifications(read);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_id 
  ON audit_logs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON audit_logs(created_at DESC);

-- Additional composite index for notifications (user + read status)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, read);

-- Additional composite index for audit logs (clinic + timestamp)
CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_created 
  ON audit_logs(clinic_id, created_at DESC);
