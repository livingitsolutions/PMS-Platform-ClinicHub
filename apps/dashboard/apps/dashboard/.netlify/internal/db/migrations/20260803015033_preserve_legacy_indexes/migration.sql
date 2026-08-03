DROP INDEX "idx_appointment_reminders_pending";--> statement-breakpoint
CREATE INDEX "idx_appointment_reminders_pending" ON "appointment_reminders" ("clinic_id","sent","reminder_time") WHERE "sent" = false;--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic_id" ON "appointments" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_clinic" ON "invoices" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_payments_invoice" ON "payments" ("invoice_id");