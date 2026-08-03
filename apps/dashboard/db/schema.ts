import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
};

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  plan: text('plan').notNull().default('starter'),
  subscriptionStatus: text('subscription_status').notNull().default('inactive'),
  currencyCode: text('currency_code').default('PHP'),
  currencySymbol: text('currency_symbol').default('₱'),
  ...timestamps,
});

export const userClinics = pgTable('user_clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('staff'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('user_clinics_user_id_clinic_id_key').on(table.userId, table.clinicId),
  check('user_clinics_role_check', sql`${table.role} in ('owner', 'admin', 'staff')`),
  index('idx_user_clinics_user_id').on(table.userId),
  index('idx_user_clinics_clinic_id').on(table.clinicId),
]);

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  address: text('address'),
  medicalNotes: text('medical_notes'),
  ...timestamps,
}, (table) => [
  check('patients_gender_check', sql`${table.gender} is null or ${table.gender} in ('male', 'female', 'other')`),
  index('idx_patients_clinic_id').on(table.clinicId),
  index('idx_patients_name').on(table.lastName, table.firstName),
]);

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  specialization: text('specialization'),
  ...timestamps,
}, (table) => [
  index('idx_providers_clinic_id').on(table.clinicId),
  index('idx_providers_user_id').on(table.userId),
]);

export const providerAvailability = pgTable('provider_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  ...timestamps,
}, (table) => [
  check('provider_availability_day_check', sql`${table.dayOfWeek} between 0 and 6`),
  unique('idx_provider_day_time').on(table.providerId, table.dayOfWeek, table.startTime),
  index('idx_provider_availability_provider_id').on(table.providerId),
]);

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'set null' }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: text('status').default('scheduled'),
  notes: text('notes'),
  ...timestamps,
}, (table) => [
  check('appointments_status_check', sql`${table.status} in ('scheduled', 'confirmed', 'completed', 'cancelled')`),
  index('idx_appointments_clinic').on(table.clinicId),
  index('idx_appointments_clinic_id').on(table.clinicId),
  index('idx_appointments_patient_id').on(table.patientId),
  index('idx_appointments_provider_id').on(table.providerId),
  index('idx_provider_time').on(table.providerId, table.startTime, table.endTime),
  index('idx_appointments_provider_day').on(table.providerId, table.startTime),
  index('idx_appointments_clinic_start_time').on(table.clinicId, table.startTime),
]);

export const procedures = pgTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').default(''),
  baseCost: numeric('base_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  ...timestamps,
}, (table) => [index('idx_procedures_clinic_id').on(table.clinicId)]);

export const visits = pgTable('visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'restrict' }),
  status: text('status').notNull().default('scheduled'),
  chiefComplaint: text('chief_complaint').default(''),
  diagnosis: text('diagnosis').default(''),
  notes: text('notes').default(''),
  visitDate: timestamp('visit_date', { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
}, (table) => [
  check('valid_visit_status', sql`${table.status} in ('scheduled', 'in_progress', 'completed', 'cancelled')`),
  unique('unique_visit_per_appointment').on(table.appointmentId),
  index('idx_visits_clinic_id').on(table.clinicId),
  index('idx_visits_patient_id').on(table.patientId),
  index('idx_visits_appointment_id').on(table.appointmentId),
  index('idx_visits_clinic_date').on(table.clinicId, table.visitDate.desc()),
]);

export const visitProcedures = pgTable('visit_procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  procedureId: uuid('procedure_id').notNull().references(() => procedures.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  check('positive_quantity', sql`${table.quantity} > 0`),
  check('non_negative_price', sql`${table.price} >= 0`),
  unique('unique_visit_procedure').on(table.visitId, table.procedureId),
  index('idx_visit_procedures_visit_id').on(table.visitId),
  index('idx_visit_procedures_procedure_id').on(table.procedureId),
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('unpaid'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  ...timestamps,
}, (table) => [
  check('invoices_status_check', sql`${table.status} in ('unpaid', 'partial', 'paid', 'void')`),
  unique('invoices_visit_unique').on(table.visitId),
  index('idx_invoices_clinic_id').on(table.clinicId),
  index('idx_invoices_clinic').on(table.clinicId),
  index('idx_invoices_visit').on(table.visitId),
  index('idx_invoices_status').on(table.status),
]);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method').notNull(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  check('payments_method_check', sql`${table.method} in ('cash', 'card', 'bank_transfer', 'other')`),
  index('idx_payments_clinic_id').on(table.clinicId),
  index('idx_payments_invoice_id').on(table.invoiceId),
  index('idx_payments_invoice').on(table.invoiceId),
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_audit_logs_clinic_id').on(table.clinicId),
  index('idx_audit_logs_created_at').on(table.createdAt.desc()),
  index('idx_audit_logs_clinic_created').on(table.clinicId, table.createdAt.desc()),
  index('idx_audit_logs_entity').on(table.entityType, table.entityId),
  index('idx_audit_logs_user_id').on(table.userId),
]);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  plan: text('plan').notNull().default('starter'),
  status: text('status').notNull().default('incomplete'),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index('idx_subscriptions_clinic_id').on(table.clinicId),
  index('idx_subscriptions_stripe_customer_id').on(table.stripeCustomerId),
  index('idx_subscriptions_stripe_subscription_id').on(table.stripeSubscriptionId),
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_clinic_id').on(table.clinicId),
  index('idx_notifications_read').on(table.read),
  index('idx_notifications_created_at').on(table.createdAt.desc()),
  index('idx_notifications_user_read').on(table.userId, table.read),
]);

export const backups = pgTable('backups', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').references(() => clinics.id, { onDelete: 'cascade' }),
  backupTime: timestamp('backup_time', { withTimezone: true }).notNull().defaultNow(),
  backupStatus: text('backup_status').notNull().default('pending'),
  storageUrl: text('storage_url'),
  backupSize: bigint('backup_size', { mode: 'number' }).default(0),
  backupType: text('backup_type').notNull().default('full'),
  errorMessage: text('error_message'),
  ...timestamps,
}, (table) => [
  index('idx_backups_clinic_id').on(table.clinicId),
  index('idx_backups_backup_time').on(table.backupTime.desc()),
  index('idx_backups_status').on(table.backupStatus),
]);

export const appointmentReminders = pgTable('appointment_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  reminderTime: timestamp('reminder_time', { withTimezone: true }).notNull(),
  sent: boolean('sent').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_appointment_reminders_pending').on(table.clinicId, table.sent, table.reminderTime).where(sql`${table.sent} = false`),
  index('idx_appointment_reminders_appointment_id').on(table.appointmentId),
]);

export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id').references(() => clinics.id, { onDelete: 'cascade' }),
  stripeInvoiceId: text('stripe_invoice_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  amountDue: numeric('amount_due', { precision: 10, scale: 2 }).notNull().default('0'),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull().default('open'),
  invoicePdfUrl: text('invoice_pdf_url'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_subscription_invoices_clinic_id').on(table.clinicId),
  index('idx_subscription_invoices_stripe_invoice_id').on(table.stripeInvoiceId),
]);
