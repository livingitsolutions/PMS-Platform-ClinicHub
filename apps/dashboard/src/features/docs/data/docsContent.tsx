import {
  Zap,
  Building2,
  Users,
  Calendar,
  ClipboardList,
  CreditCard,
  ChartBar,
  UserCog,
  ChevronRight,
  Shield,
} from 'lucide-react';

export type DocArticle = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type DocSection = {
  id: string;
  icon: React.ElementType;
  title: string;
  articles: DocArticle[];
};

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <div className="space-y-5">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
            <div className="text-gray-600 leading-relaxed text-sm">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
          <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoBox({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'amber' | 'red' }) {
  const styles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={`border rounded-lg p-4 text-sm leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="font-semibold text-gray-900 mb-1 text-sm">{title}</div>
      <div className="text-gray-600 text-sm leading-relaxed">{description}</div>
    </div>
  );
}

export const DOCS: DocSection[] = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    articles: [
      {
        id: 'overview',
        title: 'What is ClinicHub?',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub is a cloud-based practice management platform built for modern healthcare providers. It combines appointment scheduling, patient records, billing, AI-assisted documentation, and analytics in a single, easy-to-use dashboard.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key capabilities</h3>
              <BulletList items={[
                'Appointment scheduling with provider availability management',
                'Complete patient profiles with visit history and timelines',
                'Automated invoice generation tied to visit procedures',
                'AI-generated SOAP-format visit notes',
                'Revenue analytics and provider performance reports',
                'Role-based staff access with full audit logging',
                'Automated appointment reminders via email',
                'Secure cloud backups of clinic data',
              ]} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Feature overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Multi-clinic support', description: 'Manage multiple clinic locations from a single account.' },
                  { title: 'Role-based access', description: 'Owner, Admin, and Staff roles with fine-grained permissions.' },
                  { title: 'Stripe integration', description: 'Accept online payments directly through invoices.' },
                  { title: 'AI documentation', description: 'Auto-generate SOAP notes from brief clinical summaries.' },
                ].map((f) => (
                  <FeatureCard key={f.title} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'quickstart',
        title: 'Quick Start Guide',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed text-sm">
              Get your clinic live in under 10 minutes by following these steps.
            </p>
            <StepList steps={[
              { title: 'Create your account', body: 'Sign up at clinichub.app with your email address. No credit card is required for the 14-day trial. You will be taken directly to the clinic setup wizard.' },
              { title: 'Set up your clinic', body: 'Enter your clinic name, contact details, and time zone. You can configure currency, branding, and billing settings at any time from Settings.' },
              { title: 'Add providers', body: 'Go to Providers and create a profile for each healthcare provider. Set their weekly availability schedule so the booking system knows when they are free.' },
              { title: 'Add your procedure catalogue', body: 'Navigate to Procedures and add the services your clinic offers along with their prices. These are used for automated invoice generation.' },
              { title: 'Book your first appointment', body: 'Head to Appointments, select a date and time, choose a provider, and attach or create a patient. The system will check availability automatically.' },
              { title: 'Invite your team', body: 'From Staff, invite colleagues by email. Assign roles (Owner, Admin, or Staff) to control what each person can see and do.' },
            ]} />
          </div>
        ),
      },
      {
        id: 'roles',
        title: 'User Roles & Permissions',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub uses role-based access control (RBAC) to ensure each team member sees only what they need.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Roles overview</h3>
              <div className="space-y-3">
                {[
                  { role: 'Owner', color: 'bg-blue-100 text-blue-800', desc: 'Full access. Can manage billing, staff, settings, and all clinic data.' },
                  { role: 'Admin', color: 'bg-green-100 text-green-800', desc: 'Can manage staff, providers, appointments, visits, and reports. Cannot manage billing.' },
                  { role: 'Staff', color: 'bg-gray-100 text-gray-800', desc: 'Can book and edit appointments, create visits, view patient records, and process payments.' },
                ].map((r) => (
                  <div key={r.role} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${r.color}`}>{r.role}</span>
                    <span className="text-sm text-gray-600">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Permissions table</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-900">Feature</th>
                    <th className="text-center px-4 py-2 border border-gray-200 font-semibold text-gray-900">Owner</th>
                    <th className="text-center px-4 py-2 border border-gray-200 font-semibold text-gray-900">Admin</th>
                    <th className="text-center px-4 py-2 border border-gray-200 font-semibold text-gray-900">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Manage billing & subscription', true, false, false],
                    ['Manage staff & roles', true, true, false],
                    ['View audit logs', true, true, false],
                    ['Manage providers', true, true, false],
                    ['Book & edit appointments', true, true, true],
                    ['Create & edit visits', true, true, true],
                    ['View patient records', true, true, true],
                    ['Process payments', true, true, true],
                    ['View reports', true, true, false],
                  ].map(([feature, owner, admin, staff]) => (
                    <tr key={String(feature)} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-700 border border-gray-200 text-sm">{String(feature)}</td>
                      {[owner, admin, staff].map((allowed, i) => (
                        <td key={i} className="text-center px-4 py-2 border border-gray-200">
                          {allowed ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'clinic-setup',
    icon: Building2,
    title: 'Clinic Setup',
    articles: [
      {
        id: 'create-clinic',
        title: 'Creating Your Clinic',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              When you first sign up, the onboarding wizard walks you through creating your clinic. You can also create additional clinic locations at any time.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What you'll configure</h3>
              <BulletList items={[
                'Clinic name and contact details',
                'Time zone (used for appointment scheduling)',
                'Default currency for invoices and reports',
                'Billing address for subscription management',
              ]} />
            </div>
            <StepList steps={[
              { title: 'Enter clinic details', body: 'Provide your clinic name, phone number, email, and physical address.' },
              { title: 'Set your time zone', body: 'Choose the time zone your clinic operates in. This ensures appointments show correctly for all team members.' },
              { title: 'Choose your currency', body: 'Select the currency used for invoices. This can be changed later from Settings.' },
              { title: 'Complete setup', body: 'Click Create Clinic. You will be redirected to select a subscription plan before accessing the dashboard.' },
            ]} />
          </div>
        ),
      },
      {
        id: 'clinic-settings',
        title: 'Clinic Settings',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The Settings page lets clinic owners update clinic information, configure integrations, and manage subscription preferences.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'General', description: 'Clinic name, contact info, address, and time zone.' },
                  { title: 'Currency', description: 'Change the default currency for all invoices and reports.' },
                  { title: 'Billing', description: 'Update billing address and manage subscription.' },
                  { title: 'Integrations', description: 'Connect Stripe for online patient payments.' },
                ].map((s) => (
                  <FeatureCard key={s.title} title={s.title} description={s.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'providers-setup',
        title: 'Setting Up Providers',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Providers are the healthcare professionals who see patients. Each provider has a profile and a weekly availability schedule that drives the appointment booking system.
            </p>
            <StepList steps={[
              { title: 'Navigate to Providers', body: 'Go to Providers in the sidebar.' },
              { title: 'Create a provider', body: 'Click New Provider and enter their name, title, and specialty.' },
              { title: 'Set availability', body: 'Open the provider\'s schedule and mark which days and hours they are available each week.' },
              { title: 'Save changes', body: 'The provider is now bookable. Their available slots will appear when creating appointments.' },
            ]} />
            <InfoBox variant="blue">
              <strong>Tip:</strong> Providers and staff users are separate. A staff member logging into ClinicHub is not automatically a bookable provider. Link them if needed.
            </InfoBox>
          </div>
        ),
      },
    ],
  },
  {
    id: 'patients',
    icon: Users,
    title: 'Patients',
    articles: [
      {
        id: 'overview-patients',
        title: 'Patient Management Overview',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The Patients module is the central hub for all patient information. Every appointment, visit, procedure, and invoice is linked back to a patient record.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Feature overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Patient profiles', description: 'Full contact info, demographics, and medical notes.' },
                  { title: 'Visit timeline', description: 'Chronological history of every visit and procedure.' },
                  { title: 'Invoice history', description: 'All invoices and payment records per patient.' },
                  { title: 'Search & filter', description: 'Find patients quickly by name, DOB, or contact details.' },
                ].map((f) => (
                  <FeatureCard key={f.title} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'create-patient',
        title: 'Creating a Patient Record',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Patient records store contact information, demographics, and a complete history of every visit, procedure, and invoice.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Required fields</h3>
              <BulletList items={['First name', 'Last name', 'Date of birth', 'Gender']} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Optional fields</h3>
              <BulletList items={['Phone number', 'Email address', 'Address', 'Emergency contact', 'Medical notes']} />
            </div>
            <StepList steps={[
              { title: 'Go to Patients', body: 'Navigate to Patients in the sidebar.' },
              { title: 'Click New Patient', body: 'The Create Patient dialog opens.' },
              { title: 'Fill in the details', body: 'Enter required fields and any optional information available.' },
              { title: 'Save', body: 'The patient profile is created and you are taken to their record.' },
            ]} />
          </div>
        ),
      },
      {
        id: 'patient-timeline',
        title: 'Patient Timeline',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The patient profile page shows a chronological timeline of all visits. Each entry displays the visit date, provider, procedures performed, and current invoice status.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              Clicking a visit opens the full visit record where you can view or edit notes, add procedures, and manage payment.
            </p>
            <InfoBox variant="blue">
              <strong>Tip:</strong> You can download a PDF visit summary directly from the patient timeline. This is useful for referral letters or patient-held records.
            </InfoBox>
          </div>
        ),
      },
    ],
  },
  {
    id: 'appointments',
    icon: Calendar,
    title: 'Appointments',
    articles: [
      {
        id: 'overview-appointments',
        title: 'Appointments Overview',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The Appointments module handles all scheduling. It shows a visual calendar view of provider bookings and prevents double-booking automatically.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Feature overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Calendar view', description: 'See all appointments laid out by day, week, or provider.' },
                  { title: 'Availability checking', description: 'Only available time slots are shown for each provider.' },
                  { title: 'Walk-in visits', description: 'Create unscheduled visits for walk-in patients.' },
                  { title: 'Reminders', description: 'Automatic email reminders sent 24 hours before each appointment.' },
                ].map((f) => (
                  <FeatureCard key={f.title} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'book-appointment',
        title: 'Booking an Appointment',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Appointments can be booked from the Appointments page using the calendar or list view.
            </p>
            <StepList steps={[
              { title: 'Navigate to Appointments', body: 'Click Appointments in the sidebar.' },
              { title: 'Click New Appointment', body: 'The booking dialog opens.' },
              { title: 'Select a patient', body: 'Search for an existing patient or create a new one on the spot.' },
              { title: 'Choose a provider', body: 'The calendar shows their next available time slots.' },
              { title: 'Pick a date and time', body: 'Select from the available slots shown.' },
              { title: 'Confirm', body: 'Add an optional note and click Save. The appointment appears on the calendar immediately.' },
            ]} />
            <InfoBox variant="blue">
              <strong>Tip:</strong> The system prevents double-booking automatically. If a slot appears grayed out, the provider is unavailable or already booked.
            </InfoBox>
          </div>
        ),
      },
      {
        id: 'reminders',
        title: 'Automated Reminders',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub can send automated email reminders to patients before their appointment. Reminders are processed daily by a scheduled background job.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
              <BulletList items={[
                'Reminders are sent 24 hours before the scheduled appointment.',
                'Each reminder includes the appointment date, time, and provider name.',
                'Reminder status is tracked and visible in the Reminders section.',
                'You can review sent and pending reminders from the Reminders page.',
              ]} />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'visits',
    icon: ClipboardList,
    title: 'Visits',
    articles: [
      {
        id: 'overview-visits',
        title: 'Visits Overview',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              A visit represents a patient encounter — whether from a booked appointment or a walk-in. Visits contain clinical notes, the list of procedures performed, and a linked invoice.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Feature overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Clinical notes', description: 'Free-text or AI-generated SOAP notes for each encounter.' },
                  { title: 'Procedure tracking', description: 'Add procedures performed; invoice updates automatically.' },
                  { title: 'Linked invoices', description: 'Every visit has one invoice that reflects all procedures.' },
                  { title: 'PDF export', description: 'Download a formatted visit summary as a PDF.' },
                ].map((f) => (
                  <FeatureCard key={f.title} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'create-visit',
        title: 'Creating a Visit',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Visits are created automatically when an appointment is completed, or manually as walk-in encounters.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">From an appointment</h3>
              <BulletList items={[
                'Open the appointment from the calendar.',
                'Click Start Visit to convert it into an active visit.',
                'The visit record opens automatically.',
              ]} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Walk-in visit</h3>
              <StepList steps={[
                { title: 'Go to Visits', body: 'Navigate to Visits in the sidebar.' },
                { title: 'Click New Walk-in Visit', body: 'The walk-in dialog opens.' },
                { title: 'Select the patient and provider', body: 'Search for an existing patient or create one.' },
                { title: 'Save', body: 'The visit is created and ready for notes and procedures.' },
              ]} />
            </div>
          </div>
        ),
      },
      {
        id: 'ai-notes',
        title: 'AI-Generated Visit Notes',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub can generate a full SOAP-format visit note from a brief summary you provide. This dramatically reduces documentation time while keeping records comprehensive.
            </p>
            <StepList steps={[
              { title: 'Open a visit record', body: 'Navigate to the visit you want to document.' },
              { title: 'Click Generate Notes with AI', body: 'The AI notes dialog opens.' },
              { title: 'Enter a brief summary', body: 'Describe the encounter in plain language, e.g. "Patient with knee pain after running, no swelling, mild tenderness medial joint line".' },
              { title: 'Review the output', body: 'The AI generates a structured SOAP note (Subjective, Objective, Assessment, Plan).' },
              { title: 'Edit and save', body: 'Make any clinical corrections, then save to the visit record.' },
            ]} />
            <InfoBox variant="blue">
              <strong>Important:</strong> AI-generated notes are a drafting aid. Always review the output for clinical accuracy before saving to the patient record.
            </InfoBox>
          </div>
        ),
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing',
    articles: [
      {
        id: 'invoices-overview',
        title: 'How Invoices Work',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Invoices in ClinicHub are tied directly to visits. When procedures are added to a visit, the invoice total is recalculated automatically.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Invoice lifecycle</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {['Draft', 'Pending', 'Partially Paid', 'Paid', 'Cancelled'].map((status, i, arr) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{status}</span>
                    {i < arr.length - 1 && <ChevronRight className="size-4 text-gray-400" />}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recording a payment</h3>
              <StepList steps={[
                { title: 'Open the invoice', body: 'Find the invoice from the Invoices page or from inside the visit record.' },
                { title: 'Click Record Payment', body: 'The payment dialog opens.' },
                { title: 'Enter payment details', body: 'Enter the amount and select the payment method (Cash, Card, Bank Transfer, etc.).' },
                { title: 'Confirm', body: 'The invoice status updates automatically. Partial payments are tracked.' },
              ]} />
            </div>
          </div>
        ),
      },
      {
        id: 'online-payments',
        title: 'Online Payments with Stripe',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub integrates with Stripe to let you send patients a secure payment link directly from an invoice.
            </p>
            <InfoBox variant="amber">
              <strong>Setup required:</strong> Online payments require a connected Stripe account. Go to Settings → Billing to connect your Stripe account.
            </InfoBox>
            <StepList steps={[
              { title: 'Open a pending invoice', body: 'Find the invoice from the Invoices page.' },
              { title: 'Click Pay Online', body: 'ClinicHub generates a Stripe Checkout session.' },
              { title: 'Share the link', body: 'Copy the link and send it to the patient by email or SMS.' },
              { title: 'Automatic reconciliation', body: 'Once the patient pays, the invoice is automatically marked as Paid via the Stripe webhook.' },
            ]} />
          </div>
        ),
      },
      {
        id: 'subscription',
        title: 'Managing Your Subscription',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              ClinicHub subscriptions are billed monthly or annually through Stripe. Owners can manage their subscription from the Billing section of Settings.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What you can do</h3>
              <BulletList items={[
                'View your current plan and renewal date',
                'Upgrade or downgrade your plan',
                'Download past subscription invoices',
                'Update payment method',
                'Cancel your subscription',
              ]} />
            </div>
            <InfoBox variant="blue">
              <strong>Note:</strong> Subscription management is only available to clinic Owners. Admin and Staff roles cannot access billing settings.
            </InfoBox>
          </div>
        ),
      },
    ],
  },
  {
    id: 'reports',
    icon: ChartBar,
    title: 'Reports',
    articles: [
      {
        id: 'reports-overview',
        title: 'Reports Overview',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The Reports section gives you visibility into revenue, provider productivity, and procedure volumes. All reports support date range filtering and CSV export.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available reports</h3>
              <div className="space-y-3">
                {[
                  { name: 'Revenue Report', desc: 'Monthly and cumulative revenue broken down by date range. Compare periods and spot trends.' },
                  { name: 'Provider Performance Report', desc: 'Number of visits, procedures performed, and revenue generated per provider.' },
                  { name: 'Procedure Report', desc: 'Volume and revenue breakdown by procedure type. Identify your most and least popular services.' },
                  { name: 'Dashboard Summary', desc: "Top-level KPIs including today's appointments, outstanding invoices, and monthly revenue totals." },
                ].map((r) => (
                  <FeatureCard key={r.name} title={r.name} description={r.desc} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'using-reports',
        title: 'Using Reports',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              All reports are accessed from the Reports page in the sidebar. Each report has filtering controls and an export option.
            </p>
            <StepList steps={[
              { title: 'Navigate to Reports', body: 'Click Reports in the sidebar.' },
              { title: 'Select a report type', body: 'Use the tabs at the top to switch between Revenue, Provider Performance, and Procedure reports.' },
              { title: 'Set date range', body: 'Use the date pickers to filter data to the period you care about.' },
              { title: 'Analyse the data', body: 'Charts and summary tables update automatically based on your filters.' },
              { title: 'Export to CSV', body: 'Click Export CSV to download the report data for use in Excel or your accounting software.' },
            ]} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'staff',
    icon: UserCog,
    title: 'Staff Management',
    articles: [
      {
        id: 'staff-overview',
        title: 'Staff Management Overview',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              The Staff page lets clinic owners and admins manage who has access to the clinic, what role they hold, and review recent activity.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Feature overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Invite staff', description: 'Send email invitations to new team members.' },
                  { title: 'Role management', description: 'Assign or change roles for any team member.' },
                  { title: 'Remove access', description: 'Revoke access for staff who leave the clinic.' },
                  { title: 'Audit logs', description: 'View a full history of all actions taken by every user.' },
                ].map((f) => (
                  <FeatureCard key={f.title} title={f.title} description={f.description} />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'invite-staff',
        title: 'Inviting Team Members',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              New team members are invited by email. They must create a ClinicHub account using the same email address before they can access the clinic.
            </p>
            <StepList steps={[
              { title: 'Navigate to Staff', body: 'Click Staff in the sidebar.' },
              { title: 'Click Invite Staff', body: 'The invitation dialog opens.' },
              { title: 'Enter their email and role', body: 'Type the email address and select the appropriate role: Owner, Admin, or Staff.' },
              { title: 'Send invitation', body: 'Click Invite. The user will receive an email with instructions to join the clinic.' },
            ]} />
            <InfoBox variant="blue">
              <strong>Note:</strong> The invited user must sign up (or already have an account) with the exact email address you invite. Once they log in, they will see the clinic in their clinic selector.
            </InfoBox>
          </div>
        ),
      },
      {
        id: 'change-roles',
        title: 'Changing Roles & Removing Access',
        content: (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed text-sm">
              Roles can be changed at any time by Owners and Admins. Removing a user from the clinic immediately revokes their access.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Changing a role</h3>
              <BulletList items={[
                'Find the staff member in the Staff table.',
                'Click the role badge or the edit icon in their row.',
                'Select the new role from the dropdown.',
                'Confirm the change.',
              ]} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Removing a staff member</h3>
              <BulletList items={[
                'Find the staff member in the Staff table.',
                'Click the Remove button in their row.',
                'Confirm the removal.',
                'Their access is revoked immediately. Their user account is not deleted.',
              ]} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Security features</h3>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                <Shield className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  All staff changes are recorded in the audit log with the acting user, timestamp, and changed values.
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
];
