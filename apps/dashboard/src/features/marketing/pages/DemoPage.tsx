import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '../components/Footer';
import { MarketingNav } from '../components/MarketingNav';
import { Calendar, Users, FileText, CreditCard, ChartBar as BarChart3, CircleCheck as CheckCircle, ChevronRight } from 'lucide-react';

const DEMO_SCREENS = [
  {
    id: 'scheduling',
    icon: Calendar,
    label: 'Smart Scheduling',
    title: 'Book appointments in seconds',
    description:
      'Our intelligent scheduling engine automatically detects conflicts, shows real-time provider availability, and lets patients or staff book appointments with just a few clicks. Built-in reminders reduce no-shows by up to 40%.',
    highlights: [
      'Real-time provider availability',
      'Automated conflict detection',
      'Drag-and-drop calendar view',
      'SMS & email reminders',
    ],
    screenshot: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 h-72 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-800">March 2026</span>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className={`rounded-full w-7 h-7 flex items-center justify-center mx-auto cursor-pointer transition-colors ${
                d === 7
                  ? 'bg-blue-600 text-white font-semibold'
                  : d === 12 || d === 18 || d === 25
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
            <div className="w-2 h-8 rounded-full bg-blue-500" />
            <div>
              <div className="text-xs font-semibold text-gray-800">9:00 AM — Dr. Rivera</div>
              <div className="text-xs text-gray-500">Maria Gonzalez · Follow-up</div>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Confirmed</span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
            <div className="w-2 h-8 rounded-full bg-teal-500" />
            <div>
              <div className="text-xs font-semibold text-gray-800">10:30 AM — Dr. Chen</div>
              <div className="text-xs text-gray-500">James Park · Initial consult</div>
            </div>
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'patients',
    icon: Users,
    label: 'Patient Management',
    title: 'Complete patient records at your fingertips',
    description:
      'Maintain comprehensive patient profiles with full visit history, procedures, invoices, and documents — all in one secure place. The timeline view gives every provider instant context before walking into a room.',
    highlights: [
      'Complete visit timeline',
      'Attached documents & notes',
      'Procedure & billing history',
      'Role-based access control',
    ],
    screenshot: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 h-72 overflow-hidden">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            MG
          </div>
          <div>
            <div className="font-semibold text-gray-900">Maria Gonzalez</div>
            <div className="text-sm text-gray-500">DOB: 14 Mar 1985 · F</div>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Mar 7, 2026', title: 'Follow-up Visit', provider: 'Dr. Rivera', badge: 'Completed', color: 'green' },
            { date: 'Feb 12, 2026', title: 'Dental Cleaning', provider: 'Dr. Chen', badge: 'Invoiced', color: 'blue' },
            { date: 'Jan 3, 2026', title: 'Initial Consultation', provider: 'Dr. Rivera', badge: 'Completed', color: 'green' },
          ].map((item) => (
            <div key={item.date} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-400">{item.date}</div>
                <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-500">{item.provider}</div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full bg-${item.color}-100 text-${item.color}-700`}
              >
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'notes',
    icon: FileText,
    label: 'AI Visit Notes',
    title: 'Generate clinical notes in one click',
    description:
      'Our AI assistant drafts thorough SOAP-style visit notes from a brief summary of the encounter. Providers review and approve — saving 10–15 minutes of documentation per visit while maintaining full clinical accuracy.',
    highlights: [
      'SOAP-format output',
      'Provider review & approval',
      'Editable before saving',
      'Audit trail maintained',
    ],
    screenshot: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 h-72 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800">Visit Notes — Mar 7, 2026</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            AI Generated
          </span>
        </div>
        <div className="space-y-3 text-xs text-gray-700">
          <div>
            <div className="font-semibold text-gray-900 mb-1">S — Subjective</div>
            <div className="text-gray-600 leading-relaxed">
              Patient presents with mild left-knee discomfort for 2 weeks following increased physical activity. Denies fever or swelling.
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">O — Objective</div>
            <div className="text-gray-600 leading-relaxed">
              BP 118/76, HR 72. ROM full. Mild tenderness on palpation of the medial joint line.
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">A — Assessment</div>
            <div className="text-gray-600 leading-relaxed">
              Mild medial knee strain, likely activity-related. No structural damage suspected.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'billing',
    icon: CreditCard,
    label: 'Automated Billing',
    title: 'Invoices generated automatically',
    description:
      'As soon as a visit is completed and procedures are logged, ClinicPro generates a detailed invoice ready to send. Track payments, record partial payments, and keep outstanding balances front and centre.',
    highlights: [
      'Auto-generated invoices',
      'Partial payment tracking',
      'Stripe online payments',
      'Exportable PDF invoices',
    ],
    screenshot: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 h-72 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Invoice #INV-0042</div>
            <div className="text-xs text-gray-500">Maria Gonzalez · Mar 7, 2026</div>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { name: 'Initial Consultation', qty: 1, price: '$150.00' },
            { name: 'X-Ray (Knee)', qty: 1, price: '$85.00' },
            { name: 'Physical Therapy Session', qty: 2, price: '$140.00' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs bg-white rounded p-2 border border-gray-100">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-medium text-gray-900">{item.price}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
          <span className="text-sm font-semibold text-gray-800">Total</span>
          <span className="text-lg font-bold text-gray-900">$375.00</span>
        </div>
        <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs h-8">
          Record Payment
        </Button>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics & Reports',
    title: 'Data-driven practice insights',
    description:
      'Track revenue trends, monitor top-performing providers and procedures, and generate detailed reports for any date range. Export to CSV for accounting or board presentations.',
    highlights: [
      'Revenue trend charts',
      'Provider performance metrics',
      'Procedure volume reports',
      'CSV export',
    ],
    screenshot: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 h-72 overflow-hidden">
        <div className="flex items-end gap-2 h-28 mb-4 items-end">
          {[40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 72].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                height: `${h}%`,
                background: i === 10 ? '#2563eb' : `rgba(37,99,235,${0.3 + (h / 100) * 0.5})`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-5">
          {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Monthly Revenue', value: '$24,850' },
            { label: 'Visits This Month', value: '182' },
            { label: 'Collection Rate', value: '94%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
              <div className="text-sm font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function DemoPage() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(DEMO_SCREENS[0].id);

  const active = DEMO_SCREENS.find((s) => s.id === activeScreen)!;
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="demo" />

      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Interactive Demo
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            See ClinicPro in action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the key features that help hundreds of clinics run more efficiently every day.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-blue-600 hover:bg-blue-700 px-8"
            onClick={() => navigate('/signup')}
          >
            Start Free Trial <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {DEMO_SCREENS.map((screen) => {
              const Icon = screen.icon;
              return (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeScreen === screen.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="size-4" />
                  {screen.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ActiveIcon className="size-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {active.label}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{active.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{active.description}</p>
              <ul className="space-y-3">
                {active.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3">
                    <CheckCircle className="size-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/signup')}
                >
                  Try It Free
                </Button>
                <Button variant="outline" onClick={() => navigate('/docs')}>
                  Read Docs
                </Button>
              </div>
            </div>

            <div className="transition-all duration-300">{active.screenshot}</div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Trusted by growing practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'ClinicPro cut our admin workload in half. The automated invoicing alone saves us two hours every day.',
                name: 'Dr. Sarah Kim',
                role: 'Family Medicine · 3 providers',
              },
              {
                quote:
                  'Our no-show rate dropped from 18% to 9% in the first month after enabling automated reminders.',
                name: 'James Thornton',
                role: 'Practice Manager · 7 providers',
              },
              {
                quote:
                  "The AI notes feature was the game changer. My documentation time went from 15 minutes to 3 minutes per visit.",
                name: 'Dr. Ana Reyes',
                role: 'Physiotherapy Clinic · Solo practice',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.562-.955L10 0l2.95 5.955 6.562.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of clinics already running on ClinicPro. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-700 px-8"
              onClick={() => navigate('/pricing')}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
