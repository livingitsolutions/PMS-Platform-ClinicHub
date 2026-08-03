# Frontend API Migration Checklist

All former Supabase table operations now pass through the authenticated `POST /api/data` REST bridge in `src/lib/supabase.ts`. The bridge preserves the existing query-chain business logic while moving database credentials, tenant checks, and SQL execution into Netlify Functions. New feature work should use explicit feature endpoints rather than adding more compatibility calls.

## Shared request and response

- Request: `{ table, operation, values?, filters?, select?, order?, range?, limit?, single? }`.
- Response: `{ data, error, count }` with database rows retaining their existing snake_case field names.
- Authentication: Netlify Identity cookie, or `Authorization: Bearer <JWT>` signed with `JWT_SECRET`.
- Tenant scope: derived server-side from `user_clinics`; browser-provided clinic IDs never bypass membership checks.

## Feature mapping

| Feature | Current Supabase calls found | Netlify endpoint | Request | Response |
|---|---|---|---|---|
| Patients | `patients.select/insert/update/delete`, visit/invoice timeline lookups | `POST /api/data` (`table: patients`) | Filters include `clinic_id` or `id`; writes use the existing patient payload | Patient row(s), optional exact count |
| Appointments | `appointments.select/insert/update/delete`, patient/provider lookups and date filters | `POST /api/data` (`table: appointments`) | Existing appointment payload; `gte/lte` filters for calendar ranges | Appointment row(s), with requested patient/provider relations |
| Visits | `visits.select/upsert/update`, `visit_procedures` CRUD, appointment lookups | `POST /api/data` (`table: visits` or `visit_procedures`) | Existing visit/procedure payloads and conflict keys | Visit rows with patient/provider relations; procedure rows with procedure relation |
| Invoices | `invoices.select/upsert/update`, `payments.select/insert`, total calculations | `POST /api/data`; `POST /api/create-invoice-payment-session` | Existing invoice/payment payload; Stripe invoice ID for hosted payment | Invoice/payment rows or `{ checkout_url }` |
| Providers | `providers` CRUD and `provider_availability` CRUD | `POST /api/data` | Provider or weekly availability payload | Provider/availability row(s) and counts |
| Subscriptions | `subscriptions.select`, subscription invoice reads, checkout and portal functions | `POST /api/data`, `POST /api/create-checkout-session`, `POST /api/create-billing-portal` | `{ clinicId, plan, successUrl, cancelUrl }` or `{ clinicId, returnUrl }` | Subscription rows, `{ sessionId, url }`, or `{ url }` |
| Notifications | `notifications.select/insert/update` and realtime channel | `POST /api/data` | User/clinic filters and notification payload | Notification rows/count; UI polls every 15 seconds instead of Postgres realtime |

## Additional migrated calls

- Clinic onboarding RPC → `POST /api/rpc/create_clinic_for_authenticated_user`.
- Staff email/user RPCs → `POST /api/rpc/get_user_id_by_email` and `POST /api/rpc/get_users_by_ids`.
- Dashboard RPCs → `POST /api/rpc/get_today_stats`, `get_monthly_revenue`, `get_top_procedures`, and `get_top_providers`.
- AI notes → `POST /api/generate-visit-notes`.
- Appointment reminders → `POST /api/process-appointment-reminders`, also scheduled every 15 minutes.
- Clinic backups → `POST /api/perform-backup`; downloads use `GET /api/backup-download/:id`.

## Follow-up checklist

- Replace compatibility calls feature-by-feature with typed endpoint modules when changing that feature.
- Add endpoint-level integration tests using `netlify dev` and a database branch.
- Confirm every imported Supabase user has the same UUID in Netlify Identity or in custom JWT `sub` claims.
- Verify owner/admin/staff permissions for destructive operations during acceptance testing.
