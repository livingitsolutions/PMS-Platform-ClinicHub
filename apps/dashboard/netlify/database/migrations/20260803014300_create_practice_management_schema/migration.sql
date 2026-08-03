CREATE TABLE "appointment_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"appointment_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"reminder_time" timestamp with time zone NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "appointments_status_check" CHECK ("status" in ('scheduled', 'confirmed', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid,
	"backup_time" timestamp with time zone DEFAULT now() NOT NULL,
	"backup_status" text DEFAULT 'pending' NOT NULL,
	"storage_url" text,
	"backup_size" bigint DEFAULT 0,
	"backup_type" text DEFAULT 'full' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"plan" text DEFAULT 'starter' NOT NULL,
	"subscription_status" text DEFAULT 'inactive' NOT NULL,
	"currency_code" text DEFAULT 'PHP',
	"currency_symbol" text DEFAULT '₱',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"visit_id" uuid NOT NULL CONSTRAINT "invoices_visit_unique" UNIQUE,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"total_amount" numeric(10,2) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(10,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "invoices_status_check" CHECK ("status" in ('unpaid', 'partial', 'paid', 'void'))
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" date,
	"gender" text,
	"address" text,
	"medical_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "patients_gender_check" CHECK ("gender" is null or "gender" in ('male', 'female', 'other'))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(10,2) NOT NULL,
	"method" text NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_method_check" CHECK ("method" in ('cash', 'card', 'bank_transfer', 'other'))
);
--> statement-breakpoint
CREATE TABLE "procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"base_cost" numeric(10,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"provider_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "idx_provider_day_time" UNIQUE("provider_id","day_of_week","start_time"),
	CONSTRAINT "provider_availability_day_check" CHECK ("day_of_week" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"specialization" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid,
	"stripe_invoice_id" text NOT NULL UNIQUE,
	"stripe_subscription_id" text,
	"amount_due" numeric(10,2) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(10,2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"invoice_pdf_url" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"stripe_customer_id" text NOT NULL UNIQUE,
	"stripe_subscription_id" text UNIQUE,
	"plan" text DEFAULT 'starter' NOT NULL,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_clinics_user_id_clinic_id_key" UNIQUE("user_id","clinic_id"),
	CONSTRAINT "user_clinics_role_check" CHECK ("role" in ('owner', 'admin', 'staff'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visit_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"visit_id" uuid NOT NULL,
	"procedure_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10,2) DEFAULT '0' NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_visit_procedure" UNIQUE("visit_id","procedure_id"),
	CONSTRAINT "positive_quantity" CHECK ("quantity" > 0),
	CONSTRAINT "non_negative_price" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" uuid NOT NULL,
	"appointment_id" uuid CONSTRAINT "unique_visit_per_appointment" UNIQUE,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"chief_complaint" text DEFAULT '',
	"diagnosis" text DEFAULT '',
	"notes" text DEFAULT '',
	"visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "valid_visit_status" CHECK ("status" in ('scheduled', 'in_progress', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE INDEX "idx_appointment_reminders_pending" ON "appointment_reminders" ("sent","reminder_time");--> statement-breakpoint
CREATE INDEX "idx_appointment_reminders_appointment_id" ON "appointment_reminders" ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic" ON "appointments" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_id" ON "appointments" ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_provider_id" ON "appointments" ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_provider_time" ON "appointments" ("provider_id","start_time","end_time");--> statement-breakpoint
CREATE INDEX "idx_appointments_provider_day" ON "appointments" ("provider_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic_start_time" ON "appointments" ("clinic_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_clinic_id" ON "audit_logs" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_clinic_created" ON "audit_logs" ("clinic_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_backups_clinic_id" ON "backups" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_backups_backup_time" ON "backups" ("backup_time" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_backups_status" ON "backups" ("backup_status");--> statement-breakpoint
CREATE INDEX "idx_invoices_clinic_id" ON "invoices" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_visit" ON "invoices" ("visit_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_clinic_id" ON "notifications" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" ("read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" ("user_id","read");--> statement-breakpoint
CREATE INDEX "idx_patients_clinic_id" ON "patients" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_patients_name" ON "patients" ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_payments_clinic_id" ON "payments" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_payments_invoice_id" ON "payments" ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_procedures_clinic_id" ON "procedures" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_provider_availability_provider_id" ON "provider_availability" ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_providers_clinic_id" ON "providers" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_providers_user_id" ON "providers" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_clinic_id" ON "subscription_invoices" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_stripe_invoice_id" ON "subscription_invoices" ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_clinic_id" ON "subscriptions" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions" ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "subscriptions" ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_user_clinics_user_id" ON "user_clinics" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_clinics_clinic_id" ON "user_clinics" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_visit_procedures_visit_id" ON "visit_procedures" ("visit_id");--> statement-breakpoint
CREATE INDEX "idx_visit_procedures_procedure_id" ON "visit_procedures" ("procedure_id");--> statement-breakpoint
CREATE INDEX "idx_visits_clinic_id" ON "visits" ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_visits_patient_id" ON "visits" ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_visits_appointment_id" ON "visits" ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_visits_clinic_date" ON "visits" ("clinic_id","visit_date" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_appointments_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "backups" ADD CONSTRAINT "backups_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_visit_id_visits_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_provider_id_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_clinics" ADD CONSTRAINT "user_clinics_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_clinics" ADD CONSTRAINT "user_clinics_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "visit_procedures" ADD CONSTRAINT "visit_procedures_visit_id_visits_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "visit_procedures" ADD CONSTRAINT "visit_procedures_procedure_id_procedures_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_appointment_id_appointments_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_provider_id_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT;