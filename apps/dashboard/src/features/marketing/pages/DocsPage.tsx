import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '../components/Footer';
import { MarketingNav } from '../components/MarketingNav';
import { Calendar, Users, FileText, CreditCard, ChartBar as BarChart3, Shield, Database, ChevronRight, Search, BookOpen, Zap, LifeBuoy } from 'lucide-react';

type DocSection = {
  id: string;
  icon: React.ElementType;
  title: string;
  articles: DocArticle[];
};

type DocArticle = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const DOCS: DocSection[] = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    articles: [
      {
        id: 'overview',
        title: 'What is ClinicPro?',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro is a cloud-based practice management platform built for modern healthcare providers. It combines appointment scheduling, patient records, billing, AI-assisted documentation, and analytics in a single, easy-to-use dashboard.
            </p>
            <h3 className="font-semibold text-gray-900 text-lg">Key capabilities</h3>
            <ul className="space-y-2 text-gray-600">
              {[
                'Appointment scheduling with provider availability management',
                'Complete patient profiles with visit history and timelines',
                'Automated invoice generation tied to visit procedures',
                'AI-generated SOAP-format visit notes',
                'Revenue analytics and provider performance reports',
                'Role-based staff access with full audit logging',
                'Automated appointment reminders via email',
                'Secure cloud backups of clinic data',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'quickstart',
        title: 'Quick Start Guide',
        content: (
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Get your clinic live in under 10 minutes by following these steps.
            </p>
            {[
              {
                step: '1',
                title: 'Create your account',
                body: 'Sign up with your email address. No credit card is required for the 14-day trial. You will be taken directly to the clinic setup wizard.',
              },
              {
                step: '2',
                title: 'Set up your clinic',
                body: 'Enter your clinic name, contact details, and time zone. You can configure currency, branding, and billing settings at any time from Settings.',
              },
              {
                step: '3',
                title: 'Add providers',
                body: 'Go to Providers and create a profile for each healthcare provider. Set their weekly availability schedule so the booking system knows when they are free.',
              },
              {
                step: '4',
                title: 'Add your procedure catalogue',
                body: 'Navigate to Procedures and add the services your clinic offers along with their prices. These are used for automated invoice generation.',
              },
              {
                step: '5',
                title: 'Book your first appointment',
                body: 'Head to Appointments, select a date and time, choose a provider, and attach or create a patient. The system will check availability automatically.',
              },
              {
                step: '6',
                title: 'Invite your team',
                body: 'From Staff, invite colleagues by email. Assign roles (Owner, Admin, or Staff) to control what each person can see and do.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
                  <div className="text-gray-600 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'roles',
        title: 'User Roles & Permissions',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro uses role-based access control (RBAC) to ensure each team member sees only what they need.
            </p>
            <div className="overflow-x-auto">
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
                      <td className="px-4 py-2 text-gray-700 border border-gray-200">{String(feature)}</td>
                      {[owner, admin, staff].map((allowed, i) => (
                        <td key={i} className="text-center px-4 py-2 border border-gray-200">
                          {allowed ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
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
    id: 'appointments',
    icon: Calendar,
    title: 'Appointments',
    articles: [
      {
        id: 'book-appointment',
        title: 'Booking an Appointment',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Appointments can be booked from the Appointments page using the calendar or list view.
            </p>
            <h3 className="font-semibold text-gray-900">Steps</h3>
            <ol className="space-y-3 text-gray-600 list-decimal list-inside">
              <li>Navigate to <strong>Appointments</strong> in the sidebar.</li>
              <li>Click <strong>New Appointment</strong> in the top-right corner.</li>
              <li>Select or search for a patient. If new, you can create them on the spot.</li>
              <li>Choose a provider. The calendar shows their next available time slots.</li>
              <li>Pick a date and time from the available slots.</li>
              <li>Add an optional note and confirm.</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Tip:</strong> The system prevents double-booking automatically. If a slot appears grayed out, the provider is unavailable or already booked.
            </div>
          </div>
        ),
      },
      {
        id: 'reminders',
        title: 'Automated Reminders',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro can send automated email reminders to patients before their appointment. Reminders are processed daily by a scheduled background job.
            </p>
            <h3 className="font-semibold text-gray-900">How it works</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Reminders are sent 24 hours before the scheduled appointment.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Each reminder includes the appointment date, time, and provider name.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Reminder status is tracked and visible in the Reminders section.
              </li>
            </ul>
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
        id: 'create-patient',
        title: 'Creating a Patient Record',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Patient records store contact information, demographics, and a complete history of every visit, procedure, and invoice.
            </p>
            <h3 className="font-semibold text-gray-900">Required fields</h3>
            <ul className="space-y-2 text-gray-600">
              {['First name', 'Last name', 'Date of birth', 'Gender'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-gray-900">Optional fields</h3>
            <ul className="space-y-2 text-gray-600">
              {['Phone number', 'Email address', 'Address', 'Emergency contact', 'Medical notes'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ChevronRight className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'patient-timeline',
        title: 'Patient Timeline',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              The patient profile page shows a chronological timeline of all visits. Each entry displays the visit date, provider, procedures performed, and current invoice status.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Clicking a visit opens the full visit record where you can view or edit notes, add procedures, and manage payment.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Invoices',
    articles: [
      {
        id: 'invoices',
        title: 'How Invoices Work',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Invoices in ClinicPro are tied directly to visits. When procedures are added to a visit, the invoice total is recalculated automatically.
            </p>
            <h3 className="font-semibold text-gray-900">Invoice lifecycle</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {['Draft', 'Pending', 'Partially Paid', 'Paid', 'Cancelled'].map((status, i, arr) => (
                <div key={status} className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {status}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="size-4 text-gray-400" />}
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-gray-900">Recording a payment</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Open the invoice from the Invoices page or the visit record.</li>
              <li>Click <strong>Record Payment</strong>.</li>
              <li>Enter the amount and payment method.</li>
              <li>The invoice status updates automatically.</li>
            </ol>
          </div>
        ),
      },
      {
        id: 'online-payments',
        title: 'Online Payments with Stripe',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro integrates with Stripe to let you send patients a secure payment link directly from an invoice.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Setup required:</strong> Online payments require a connected Stripe account. Go to Settings → Billing to connect your Stripe account.
            </div>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Open any pending invoice.</li>
              <li>Click <strong>Pay Online</strong> to generate a Stripe checkout link.</li>
              <li>Share the link with the patient by email or copy it manually.</li>
              <li>Once paid, the invoice is automatically marked as Paid via the Stripe webhook.</li>
            </ol>
          </div>
        ),
      },
    ],
  },
  {
    id: 'ai-notes',
    icon: FileText,
    title: 'AI Visit Notes',
    articles: [
      {
        id: 'generate-notes',
        title: 'Generating Notes with AI',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro can generate a full SOAP-format visit note from a brief summary you provide. This dramatically reduces documentation time while keeping records comprehensive and accurate.
            </p>
            <h3 className="font-semibold text-gray-900">How to use it</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Open a visit record.</li>
              <li>Click <strong>Generate Notes with AI</strong>.</li>
              <li>Enter a brief description of the encounter (e.g., "Patient with knee pain after running, no swelling, mild tenderness medial joint line").</li>
              <li>Review the generated SOAP note.</li>
              <li>Edit if needed, then save.</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Important:</strong> AI-generated notes are a drafting aid. Always review the output for clinical accuracy before saving to the patient record.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Reports & Analytics',
    articles: [
      {
        id: 'reports-overview',
        title: 'Available Reports',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              The Reports section gives you visibility into revenue, provider productivity, and procedure volumes.
            </p>
            <div className="space-y-3">
              {[
                {
                  name: 'Revenue Report',
                  desc: 'Monthly and cumulative revenue broken down by date range. Compare periods and spot trends.',
                },
                {
                  name: 'Provider Performance Report',
                  desc: 'Number of visits, procedures performed, and revenue generated per provider.',
                },
                {
                  name: 'Procedure Report',
                  desc: 'Volume and revenue breakdown by procedure type. Identify your most and least popular services.',
                },
                {
                  name: 'Dashboard Summary',
                  desc: "Top-level KPIs including today's appointments, outstanding invoices, and monthly revenue totals.",
                },
              ].map((r) => (
                <div key={r.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">{r.name}</div>
                  <div className="text-gray-600 text-sm">{r.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              All reports can be exported to CSV for use in Excel or accounting software.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security & Compliance',
    articles: [
      {
        id: 'security-overview',
        title: 'Security Overview',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro is built with data security at its core. Patient data is sensitive and we treat it accordingly.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Row-level security',
                  body: "Every database query is scoped to the authenticated user's clinic. It is architecturally impossible for one clinic to access another's data.",
                },
                {
                  title: 'Role-based access control',
                  body: 'Fine-grained permissions ensure staff only see and do what their role permits.',
                },
                {
                  title: 'Audit logging',
                  body: 'All create, update, and delete operations are recorded in an immutable audit log with the user, timestamp, and changed values.',
                },
                {
                  title: 'Encrypted storage',
                  body: 'All data is encrypted at rest and in transit using industry-standard AES-256 and TLS 1.3.',
                },
                {
                  title: 'Automated backups',
                  body: 'Clinic data is backed up automatically. You can also trigger manual backups and download backup archives from the Backups page.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <Shield className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-gray-600 text-sm leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'backups',
    icon: Database,
    title: 'Backups',
    articles: [
      {
        id: 'backups-overview',
        title: 'Managing Backups',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              ClinicPro stores encrypted backups of your clinic data in secure cloud storage. You can create manual backups at any time and delete old ones to manage storage usage.
            </p>
            <h3 className="font-semibold text-gray-900">Creating a backup</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Navigate to <strong>System → Backups</strong> in the sidebar.</li>
              <li>Click <strong>Create Backup Now</strong>.</li>
              <li>The backup runs in the background. Status updates automatically.</li>
            </ol>
            <h3 className="font-semibold text-gray-900">Deleting a backup</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Find the backup you want to remove in the list.</li>
              <li>Click the red trash icon on that row.</li>
              <li>Confirm the deletion when prompted.</li>
            </ol>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <strong>Warning:</strong> Deleted backups cannot be recovered. Only delete backups you are certain you no longer need.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'support',
    icon: LifeBuoy,
    title: 'Support',
    articles: [
      {
        id: 'contact',
        title: 'Getting Help',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              We're here to help. If you can't find what you need in the docs, reach out through one of the channels below.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Email support', value: 'support@clinicpro.io', note: 'Response within 24 hours' },
                { label: 'Priority support', value: 'For Professional & Enterprise plans', note: 'Response within 4 hours' },
                { label: 'Enterprise onboarding', value: 'Dedicated onboarding specialist', note: 'Custom SLA available' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="font-semibold text-gray-900">{item.label}</div>
                  <div className="text-blue-600 text-sm">{item.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
];

export function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(DOCS[0].id);
  const [activeArticle, setActiveArticle] = useState(DOCS[0].articles[0].id);
  const [search, setSearch] = useState('');

  const section = DOCS.find((s) => s.id === activeSection)!;
  const article = section.articles.find((a) => a.id === activeArticle) ?? section.articles[0];

  const filteredDocs = search
    ? DOCS.flatMap((s) =>
        s.articles
          .filter(
            (a) =>
              a.title.toLowerCase().includes(search.toLowerCase()) ||
              s.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((a) => ({ section: s, article: a }))
      )
    : [];

  const handleSearchSelect = (sectionId: string, articleId: string) => {
    setActiveSection(sectionId);
    setActiveArticle(articleId);
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="docs" />

      <div className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <BookOpen className="size-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">ClinicPro Docs</h1>
          <p className="text-gray-400 text-lg mb-6">
            Everything you need to get the most out of ClinicPro.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            {search && filteredDocs.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {filteredDocs.map(({ section: s, article: a }) => (
                  <button
                    key={`${s.id}-${a.id}`}
                    onClick={() => handleSearchSelect(s.id, a.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-xs text-gray-400 mb-0.5">{s.title}</div>
                    <div className="text-sm font-medium text-gray-900">{a.title}</div>
                  </button>
                ))}
              </div>
            )}
            {search && filteredDocs.length === 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 px-4 py-3 text-sm text-gray-500">
                No results for "{search}"
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {DOCS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => {
                        setActiveSection(s.id);
                        setActiveArticle(s.articles[0].id);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === s.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="size-4 flex-shrink-0" />
                      {s.title}
                    </button>
                    {activeSection === s.id && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {s.articles.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setActiveArticle(a.id)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                              activeArticle === a.id
                                ? 'text-blue-700 font-semibold'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            {a.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <span>{section.title}</span>
              <ChevronRight className="size-3" />
              <span className="text-gray-700 font-medium">{article.title}</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h2>
            <div className="h-1 w-12 bg-blue-600 rounded mb-8" />

            <div className="prose-sm max-w-none">{article.content}</div>

            <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Was this helpful?{' '}
                <button className="text-blue-600 hover:underline ml-1">Yes</button>
                {' / '}
                <button className="text-blue-600 hover:underline">No</button>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>
                Start Free Trial
              </Button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
