import React from 'react';

type ClinicType = {
  label: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
};

const clinicTypes: ClinicType[] = [
  {
    label: 'Dental Clinics',
    description: 'Manage dental appointments, procedure billing, and patient records with ease.',
    bg: 'bg-blue-50 text-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Veterinary Clinics',
    description: 'Track animal patients, owner records, vaccination schedules, and treatments.',
    bg: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: 'Medical Clinics',
    description: 'General practice management with visit notes, referrals, and insurance billing.',
    bg: 'bg-cyan-50 text-cyan-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Wellness Centers',
    description: 'Coordinate therapists, nutritionists, and wellness coaches under one platform.',
    bg: 'bg-rose-50 text-rose-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Diagnostic Clinics',
    description: 'Schedule lab tests, manage results, and generate diagnostic reports efficiently.',
    bg: 'bg-amber-50 text-amber-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
];

export function TargetClinicsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            Who We Serve
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Built for Local Clinics
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From single-provider offices to multi-location practices, ClinicHub adapts to your specialty and workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {clinicTypes.map((clinic) => (
            <div
              key={clinic.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${clinic.bg}`}>
                {clinic.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{clinic.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{clinic.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
