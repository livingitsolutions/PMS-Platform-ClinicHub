# Netlify Deployment

1. Configure the site base directory as `apps/dashboard`, build command as `npm run build`, and publish directory as `dist`.
2. Add the variables listed in `.env.example` through Netlify environment variable management. Do not commit values.
3. Enable Netlify Identity, choose Open or Invite-only registration, and configure email confirmation and external providers as required.
4. Deploy once to provision Netlify Database. Migrations under `netlify/database/migrations` apply automatically.
5. Configure Stripe webhook delivery to `/api/stripe-webhook` and subscribe to checkout session, invoice, and customer subscription events.
6. Confirm the three Stripe price IDs match the products used by the existing plans.
7. Verify the scheduled reminder function appears with the `*/15 * * * *` schedule.
8. Import production data in dependency order: users, clinics, user_clinics, patients/providers, appointments/visits, procedures, invoices/payments, then billing and operational tables.
9. Run acceptance tests for onboarding, clinic switching, role enforcement, scheduling, visit billing, Stripe lifecycle events, reminders, AI note generation, and backup download.

## Manual review and breaking changes

- Supabase RLS was intentionally removed. Tenant isolation now depends on Netlify Function authorization and must not be bypassed by direct database access from the browser.
- Supabase Auth password hashes and sessions are not portable. Users need Netlify Identity invitations/password resets unless a custom JWT issuer keeps the original user UUIDs.
- User UUIDs must remain unchanged because providers, memberships, notifications, and audit logs reference `users(id)`.
- Supabase Realtime notifications now use 15-second polling. If true push delivery is required, add a Netlify-compatible realtime provider without changing notification persistence.
- Supabase Storage backup URLs were replaced by authenticated Netlify Blobs download endpoints; old signed URLs do not migrate.
- Existing Stripe customers and subscriptions remain valid only if their IDs and clinic metadata are imported before webhook traffic is switched.
- The compatibility REST bridge intentionally returns full rows even when a narrower PostgREST select was requested. This avoids business-logic changes but should be narrowed during endpoint-by-endpoint hardening.
