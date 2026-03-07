import React from 'react';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
};

const features: Feature[] = [
  {
    title: 'Patient Management',
    description: 'Complete patient records with visit history, procedures, allergies, and secure document storage all in one place.',
    accent: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Appointments & Walk-ins',
    description: 'Intelligent booking with provider availability, conflict detection, and seamless walk-in patient handling.',
    accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Visit & Treatment Records',
    description: 'Document every visit with structured notes, procedures performed, and AI-assisted documentation to save time.',
    accent: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Billing & Invoices',
    description: 'Auto-generate invoices from visit procedures, track payments, manage outstanding balances, and accept online payments.',
    accent: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: 'Reports & Analytics',
    description: 'Gain insight into revenue trends, top procedures, provider performance, and patient retention with visual reports.',
    accent: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Staff Management',
    description: 'Manage your team with role-based access, provider schedules, availability settings, and audit logging for compliance.',
    accent: 'bg-violet-50 text-violet-600 border-violet-100',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            Platform Features
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything You Need to Run Your Clinic
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Powerful features designed specifically for modern healthcare practices — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${feature.accent} mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
