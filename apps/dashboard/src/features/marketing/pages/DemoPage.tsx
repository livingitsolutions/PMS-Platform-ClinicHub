import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '../components/Footer';
import { MarketingNav } from '../components/MarketingNav';
import {
  Users,
  Calendar,
  ClipboardList,
  BarChart2,
  CreditCard,
  UserCog,
  Copy,
  ArrowRight,
  CircleCheck as CheckCircle,
  Lock,
} from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: Users,
    label: 'Patients',
    description: 'Browse patient profiles, visit history, and medical records.',
  },
  {
    icon: Calendar,
    label: 'Appointments',
    description: 'View the scheduling calendar and provider availability.',
  },
  {
    icon: ClipboardList,
    label: 'Visits',
    description: 'Explore visit records, AI-generated notes, and procedures.',
  },
  {
    icon: BarChart2,
    label: 'Reports',
    description: 'Inspect revenue charts, provider performance, and analytics.',
  },
  {
    icon: CreditCard,
    label: 'Billing',
    description: 'Review invoices, payment history, and subscription management.',
  },
  {
    icon: UserCog,
    label: 'Staff Management',
    description: 'See staff roles, permissions, and clinic user management.',
  },
];

const CREDENTIALS = {
  email: 'demo@clinichub.app',
  password: 'Demo123!',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle className="size-4 text-green-500" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

export function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="demo" />

      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            Live Demo
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Explore the ClinicHub Solutions Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sign in with the demo account below to browse a fully populated clinic. All data is read-only — no changes will be saved.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lock className="size-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Demo Login Credentials</h2>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Email Address
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <span className="text-gray-900 font-medium text-sm">{CREDENTIALS.email}</span>
                  <CopyButton value={CREDENTIALS.email} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Password
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <span className="text-gray-900 font-medium text-sm">{CREDENTIALS.password}</span>
                  <CopyButton value={CREDENTIALS.password} />
                </div>
              </div>

              <div className="pt-1">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                  onClick={() => navigate('/login')}
                >
                  Open Demo Dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                This is a shared read-only account. Any attempt to create, edit, or delete data will be blocked.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Features to Explore</h2>
            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, label, description }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500 leading-snug">{description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to use it for your clinic?</h2>
          <p className="text-gray-600 mb-8">
            Create your own account and get started in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8"
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
