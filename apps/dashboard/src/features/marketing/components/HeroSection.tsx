import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full opacity-40 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Healthcare Practice Management
            </span>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Where Local Clinics Turn Daily Chaos into{' '}
              <span className="text-blue-600">Organized Care</span>
              {' '}— In One System
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
              ClinicHub Solutions helps startup and established dental clinics, veterinary practices, and small medical offices manage patients, appointments, visits, and billing seamlessly in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
                onClick={() => navigate('/signup')}
              >
                Start Your Clinic
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                onClick={() => navigate('/demo')}
              >
                View Demo
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              No credit card required &bull; 14-day free trial &bull; Cancel anytime
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl opacity-10 transform rotate-2 scale-105" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full opacity-80" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-80" />
                  <div className="w-3 h-3 bg-green-400 rounded-full opacity-80" />
                </div>
                <span className="text-blue-100 text-sm font-medium ml-2">ClinicHub Dashboard</span>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {([
                    { label: "Today's Patients", value: '24', color: 'bg-blue-500' },
                    { label: 'Appointments', value: '18', color: 'bg-emerald-500' },
                    { label: 'Revenue', value: '$3.2k', color: 'bg-amber-500' },
                  ] as const).map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className={`w-8 h-1.5 ${stat.color} rounded-full mb-2`} />
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Upcoming Appointments</span>
                    <span className="text-xs text-blue-600 font-medium">View all</span>
                  </div>
                  {([
                    { name: 'Sarah Johnson', time: '09:00 AM', type: 'Check-up', status: 'Confirmed' },
                    { name: 'Mike Chen', time: '10:30 AM', type: 'Cleaning', status: 'Pending' },
                    { name: 'Emily Davis', time: '02:00 PM', type: 'X-Ray', status: 'Confirmed' },
                  ] as const).map((apt) => (
                    <div key={apt.name} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          {apt.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{apt.name}</div>
                          <div className="text-xs text-gray-400">{apt.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-600">{apt.time}</div>
                        <div className={`text-xs mt-0.5 ${apt.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {apt.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Monthly Revenue</div>
                    <div className="text-base font-bold text-gray-900">$28,400</div>
                    <div className="text-xs text-emerald-500 font-medium">+12% vs last month</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Active Patients</div>
                    <div className="text-base font-bold text-gray-900">1,247</div>
                    <div className="text-xs text-blue-500 font-medium">+43 this month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-16">
          {[
            { value: '10,000+', label: 'Appointments Scheduled', sub: 'Every single month' },
            { value: '500+', label: 'Clinics Managed', sub: 'Across specialties' },
            { value: '99.9%', label: 'Uptime Guarantee', sub: 'Enterprise reliability' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-gray-900 font-semibold">{stat.label}</div>
              <div className="text-sm text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
